import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/bank_data.dart';
import '../core/storage/local_finance_store.dart';
import '../data/models/account_model.dart';
import '../data/models/analytics_models.dart';
import '../data/models/budget_model.dart';
import '../data/models/financial_plan_models.dart';
import '../data/models/income_model.dart';
import '../data/models/transaction_model.dart';
import '../data/services/sadar_api_service.dart';
import 'auth_provider.dart';

final localFinanceStoreProvider = Provider<LocalFinanceStore>(
  (ref) => LocalFinanceStore(),
);

class FinanceState {
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMoreHistory;
  final bool isOffline;
  final bool isSyncing;
  final int pendingSyncCount;
  final DateTime? lastSyncedAt;
  final String? error;
  final List<AccountModel> accounts;
  final List<TransactionModel> transactions;
  final List<IncomeModel> incomes;
  final List<TransferLogModel> transfers;
  final List<SavingsGoalModel> savingsGoals;
  final List<RecurringItemModel> recurringItems;
  final List<DebtItemModel> debts;
  final List<EWalletLinkModel> ewalletLinks;
  final BudgetModel? budget;
  final HealthScoreResult? healthScore;
  final List<ScoreHistoryItem> scoreHistory;
  final List<InsightModel> insights;
  final List<AlertModel> alerts;
  final List<Map<String, dynamic>> broadcasts;
  final BehaviorPredictionModel? behaviorPrediction;
  final OverspendingForecastModel? overspendingForecast;
  final String scorePeriod;

  const FinanceState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMoreHistory = false,
    this.isOffline = false,
    this.isSyncing = false,
    this.pendingSyncCount = 0,
    this.lastSyncedAt,
    this.error,
    this.accounts = const [],
    this.transactions = const [],
    this.incomes = const [],
    this.transfers = const [],
    this.savingsGoals = const [],
    this.recurringItems = const [],
    this.debts = const [],
    this.ewalletLinks = const [],
    this.budget,
    this.healthScore,
    this.scoreHistory = const [],
    this.insights = const [],
    this.alerts = const [],
    this.broadcasts = const [],
    this.behaviorPrediction,
    this.overspendingForecast,
    this.scorePeriod = '3m',
  });

  double get totalBalance => accounts.fold(0, (sum, a) => sum + a.balance);

  double get currentMonthIncome {
    final now = DateTime.now();
    return incomes
        .where((i) =>
            i.incomeDate.year == now.year && i.incomeDate.month == now.month)
        .fold(0, (sum, i) => sum + i.amount);
  }

  double get currentMonthExpense {
    final now = DateTime.now();
    return transactions
        .where((t) =>
            t.transactionDate.year == now.year &&
            t.transactionDate.month == now.month &&
            t.categoryGroup != 'Savings')
        .fold(0, (sum, t) => sum + t.amount);
  }

  double get currentMonthTotalOutflow {
    final now = DateTime.now();
    return transactions
        .where((t) =>
            t.transactionDate.year == now.year &&
            t.transactionDate.month == now.month)
        .fold(0, (sum, t) => sum + t.amount);
  }

  bool get hasBudgetConfigured => budget != null && budget!.totalLimit > 0;

  bool get hasBudgetOrIncome => hasBudgetConfigured || currentMonthIncome > 0;

  double get remainingBudget {
    if (hasBudgetConfigured) {
      return budget!.totalLimit - currentMonthTotalOutflow;
    }
    if (currentMonthIncome > 0) {
      return currentMonthIncome - currentMonthExpense;
    }
    return totalBalance;
  }

  int get totalRecordsCount =>
      transactions.length + incomes.length + transfers.length;

  // ── GAMIFICATION (STREAK, XP, LEVEL, BADGES) ──────────────

  int get streakDays {
    final activeDays = <String>{};
    for (final t in transactions) {
      activeDays.add(
        '${t.transactionDate.year}-${t.transactionDate.month}-${t.transactionDate.day}',
      );
    }
    for (final i in incomes) {
      activeDays.add(
        '${i.incomeDate.year}-${i.incomeDate.month}-${i.incomeDate.day}',
      );
    }
    if (activeDays.isEmpty) return 0;

    int streak = 0;
    final today = DateTime.now();
    for (int offset = 0; offset < 365; offset++) {
      final d = today.subtract(Duration(days: offset));
      final key = '${d.year}-${d.month}-${d.day}';
      if (activeDays.contains(key)) {
        streak++;
      } else if (offset == 0) {
        // Allow today to not have a record yet if yesterday had one
        continue;
      } else {
        break;
      }
    }
    return streak == 0 && activeDays.isNotEmpty ? 1 : streak;
  }

  int get xpPoints {
    int xp = 0;
    xp += transactions.length * 15;
    xp += incomes.length * 25;
    xp += transfers.length * 10;
    xp += savingsGoals.length * 40;
    xp += savingsGoals.where((g) => g.isCompleted).length * 120;
    xp += recurringItems.length * 30;
    xp += debts.where((d) => d.isSettled).length * 35;
    xp += ewalletLinks.where((e) => e.autoRecordEnabled).length * 50;
    if (hasBudgetConfigured) xp += 100;
    if ((healthScore?.overallScore ?? 0) >= 70) xp += 120;
    xp += streakDays * 20;
    return xp;
  }

  int get financialLevel {
    if (xpPoints >= 900) return 5;
    if (xpPoints >= 550) return 4;
    if (xpPoints >= 300) return 3;
    if (xpPoints >= 120) return 2;
    return 1;
  }

  double get levelProgressRatio {
    final thresholds = [0, 120, 300, 550, 900, 1400];
    final lvl = financialLevel;
    final low = thresholds[lvl - 1];
    final high = thresholds[lvl];
    return ((xpPoints - low) / (high - low)).clamp(0.0, 1.0);
  }

  String get financialLevelTitle {
    switch (financialLevel) {
      case 5:
        return 'Level 5 - Master 50/30/20';
      case 4:
        return 'Level 4 - Sultan Sabar';
      case 3:
        return 'Level 3 - Analis Finansial';
      case 2:
        return 'Level 2 - Pejuang Darurat';
      default:
        return 'Level 1 - Pemula Sadar';
    }
  }

  List<({String id, String title, String subtitle, bool unlocked})>
      get badges {
    return [
      (
        id: 'first_record',
        title: 'Langkah Pertama',
        subtitle: 'Mencatat transaksi pertama',
        unlocked: totalRecordsCount > 0,
      ),
      (
        id: 'streak_3',
        title: 'Disiplin 3 Hari',
        subtitle: 'Streak pencatatan 3 hari',
        unlocked: streakDays >= 3,
      ),
      (
        id: 'budget_setter',
        title: 'Arsitek 50/30/20',
        subtitle: 'Mengatur target budget bulanan',
        unlocked: hasBudgetConfigured,
      ),
      (
        id: 'dream_saver',
        title: 'Penabung Impian',
        subtitle: 'Membuat target tabungan aktif',
        unlocked: savingsGoals.isNotEmpty,
      ),
      (
        id: 'smart_score',
        title: 'Finansial Sehat',
        subtitle: 'Mencapai Skor Finansial ≥ 70',
        unlocked: (healthScore?.overallScore ?? 0) >= 70,
      ),
      (
        id: 'multi_wallet',
        title: 'Manajer Dompet',
        subtitle: 'Mengelola minimal 2 akun dompet/rekening',
        unlocked: accounts.length >= 2,
      ),
    ];
  }

  /// Unique merchant suggestions learned from user's transaction history
  List<TransactionModel> get merchantSuggestions {
    final seen = <String>{};
    final result = <TransactionModel>[];
    for (final t in transactions) {
      final key = t.description.trim().toLowerCase();
      if (key.isEmpty || seen.contains(key)) continue;
      seen.add(key);
      result.add(t);
      if (result.length >= 8) break;
    }
    return result;
  }

  Map<String, double> get categoryTotalsCurrentMonth {
    final now = DateTime.now();
    final map = <String, double>{'Needs': 0, 'Wants': 0, 'Savings': 0};
    for (final t in transactions) {
      if (t.transactionDate.year == now.year &&
          t.transactionDate.month == now.month) {
        if (map.containsKey(t.categoryGroup)) {
          map[t.categoryGroup] = (map[t.categoryGroup] ?? 0) + t.amount;
        } else {
          map['Needs'] = (map['Needs'] ?? 0) + t.amount;
        }
      }
    }
    return map;
  }

  String accountNameById(String? accountId) {
    if (accountId == null || accountId.isEmpty) return '-';
    for (final a in accounts) {
      if (a.id == accountId) return a.name;
    }
    return '-';
  }

  FinanceState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMoreHistory,
    bool? isOffline,
    bool? isSyncing,
    int? pendingSyncCount,
    DateTime? lastSyncedAt,
    String? error,
    bool clearError = false,
    List<AccountModel>? accounts,
    List<TransactionModel>? transactions,
    List<IncomeModel>? incomes,
    List<TransferLogModel>? transfers,
    List<SavingsGoalModel>? savingsGoals,
    List<RecurringItemModel>? recurringItems,
    List<DebtItemModel>? debts,
    List<EWalletLinkModel>? ewalletLinks,
    BudgetModel? budget,
    HealthScoreResult? healthScore,
    List<ScoreHistoryItem>? scoreHistory,
    List<InsightModel>? insights,
    List<AlertModel>? alerts,
    List<Map<String, dynamic>>? broadcasts,
    BehaviorPredictionModel? behaviorPrediction,
    OverspendingForecastModel? overspendingForecast,
    String? scorePeriod,
  }) {
    return FinanceState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMoreHistory: hasMoreHistory ?? this.hasMoreHistory,
      isOffline: isOffline ?? this.isOffline,
      isSyncing: isSyncing ?? this.isSyncing,
      pendingSyncCount: pendingSyncCount ?? this.pendingSyncCount,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      error: clearError ? null : (error ?? this.error),
      accounts: accounts ?? this.accounts,
      transactions: transactions ?? this.transactions,
      incomes: incomes ?? this.incomes,
      transfers: transfers ?? this.transfers,
      savingsGoals: savingsGoals ?? this.savingsGoals,
      recurringItems: recurringItems ?? this.recurringItems,
      debts: debts ?? this.debts,
      ewalletLinks: ewalletLinks ?? this.ewalletLinks,
      budget: budget ?? this.budget,
      healthScore: healthScore ?? this.healthScore,
      scoreHistory: scoreHistory ?? this.scoreHistory,
      insights: insights ?? this.insights,
      alerts: alerts ?? this.alerts,
      broadcasts: broadcasts ?? this.broadcasts,
      behaviorPrediction: behaviorPrediction ?? this.behaviorPrediction,
      overspendingForecast: overspendingForecast ?? this.overspendingForecast,
      scorePeriod: scorePeriod ?? this.scorePeriod,
    );
  }
}

class FinanceNotifier extends StateNotifier<FinanceState> {
  final SadarApiService _api;
  final LocalFinanceStore _store;
  final String? Function() _currentUserId;
  StreamSubscription<List<ConnectivityResult>>? _connSub;
  String? _activeUserId;
  int _historyPage = 1;
  static const int _pageSize = 100;

  FinanceNotifier(this._api, this._store, this._currentUserId)
      : super(const FinanceState()) {
    _listenConnectivity();
  }

  String get _uid => _activeUserId ?? _currentUserId() ?? 'default';

  void _listenConnectivity() {
    try {
      _connSub = Connectivity().onConnectivityChanged.listen((results) {
        final hasNet = results.any((r) => r != ConnectivityResult.none);
        if (!hasNet) {
          if (mounted) state = state.copyWith(isOffline: true);
        } else {
          // Connection restored — auto-sync pending local changes & refresh!
          if (mounted && (state.isOffline || state.pendingSyncCount > 0)) {
            syncPendingAndRefresh();
          }
        }
      });
    } catch (_) {}
  }

  @override
  void dispose() {
    _connSub?.cancel();
    super.dispose();
  }

  static bool _isNetworkError(Object e) {
    final msg = e.toString().toLowerCase();
    return msg.contains('socketexception') ||
        msg.contains('tidak dapat terhubung') ||
        msg.contains('koneksi') ||
        msg.contains('timeout') ||
        msg.contains('failed host lookup') ||
        msg.contains('network is unreachable') ||
        msg.contains('connection');
  }

  Future<bool> _hasDeviceConnectivity() async {
    try {
      final results = await Connectivity().checkConnectivity();
      return results.any((r) => r != ConnectivityResult.none);
    } catch (_) {
      return true;
    }
  }

  static List<AlertModel> _deduplicateAlerts(List<AlertModel> raw) {
    final seen = <String>{};
    final unique = <AlertModel>[];
    for (final a in raw) {
      final msg = sanitizeIndonesianFinanceText(a.message).trim();
      if (msg.isEmpty) continue;
      final key = msg.toLowerCase();
      if (seen.contains(key)) continue;
      seen.add(key);
      unique.add(
        AlertModel(
          id: a.id,
          message: msg,
          alertType: a.alertType,
          createdAt: a.createdAt,
        ),
      );
    }
    return unique;
  }

  Future<void> _persistState({DateTime? syncedAt}) async {
    await _store.saveSnapshot(
      _uid,
      accounts: state.accounts,
      transactions: state.transactions,
      incomes: state.incomes,
      transfers: state.transfers,
      savingsGoals: state.savingsGoals,
      recurringItems: state.recurringItems,
      debts: state.debts,
      ewalletLinks: state.ewalletLinks,
      budget: state.budget,
      healthScore: state.healthScore,
      scoreHistory: state.scoreHistory,
      insights: state.insights,
      alerts: state.alerts,
      behaviorPrediction: state.behaviorPrediction,
      overspendingForecast: state.overspendingForecast,
      lastSyncedAt: syncedAt ?? state.lastSyncedAt,
    );
  }

  /// Loads local cached data immediately for instant Offline-First UI,
  /// then pushes any queued offline mutations and refreshes live backend data.
  Future<void> loadAll({String? userId}) async {
    if (userId != null && userId.isNotEmpty) {
      _activeUserId = userId;
    }
    final uid = _uid;

    // 1. Hydrate immediately from local device storage
    final cached = await _store.loadSnapshot(uid);
    final pending = await _store.loadQueue(uid);
    if (cached != null) {
      state = state.copyWith(
        accounts: cached.accounts,
        transactions: cached.transactions,
        incomes: cached.incomes,
        transfers: cached.transfers,
        savingsGoals: cached.savingsGoals,
        recurringItems: cached.recurringItems,
        debts: cached.debts,
        ewalletLinks: cached.ewalletLinks.isNotEmpty
            ? cached.ewalletLinks
            : EWalletLinkModel.defaultProviders,
        budget: cached.budget,
        healthScore: cached.healthScore,
        scoreHistory: cached.scoreHistory,
        insights: cached.insights,
        alerts: _deduplicateAlerts(cached.alerts),
        behaviorPrediction: cached.behaviorPrediction,
        overspendingForecast: cached.overspendingForecast,
        lastSyncedAt: cached.lastSyncedAt,
        pendingSyncCount: pending.length,
        isLoading: false,
      );
    } else {
      state = state.copyWith(
        isLoading: true,
        pendingSyncCount: pending.length,
        ewalletLinks: EWalletLinkModel.defaultProviders,
        clearError: true,
      );
    }

    // 2. Check connectivity; if offline, stop cleanly with local data
    final online = await _hasDeviceConnectivity();
    if (!online) {
      state = state.copyWith(isLoading: false, isOffline: true);
      return;
    }

    // 3. Flush any pending offline queue first
    if (pending.isNotEmpty) {
      await _flushQueue(uid);
    }

    // 4. Fetch fresh data from live production backend
    try {
      final accounts = await _api.getAccounts();
      final results = await Future.wait([
        _api.getTransactions(limit: 100).catchError((_) => state.transactions),
        _api.getIncomes(limit: 100).catchError((_) => state.incomes),
        _api.getLatestBudget().catchError((_) => state.budget),
        _api.getInsights().catchError((_) => state.insights),
        _api.getAlerts().catchError((_) => state.alerts),
        _api.getScoreHistory().catchError((_) => state.scoreHistory),
        _api.getActiveBroadcasts().catchError((_) => state.broadcasts),
        _api.getFinancialPlans().catchError((_) => const <String, dynamic>{}),
      ]);

      final now = DateTime.now();
      _historyPage = 1;
      final trxList = results[0] as List<TransactionModel>;
      final incList = results[1] as List<IncomeModel>;
      final cloudPlans = results[7] as Map<String, dynamic>;

      List<SavingsGoalModel> mergedGoals = state.savingsGoals;
      List<RecurringItemModel> mergedRecurring = state.recurringItems;
      List<DebtItemModel> mergedDebts = state.debts;
      List<TransferLogModel> mergedTransfers = state.transfers;

      final rawGoals = cloudPlans['savingsGoals'];
      final rawRec = cloudPlans['recurringItems'];
      final rawDebts = cloudPlans['debts'];
      final rawTrf = cloudPlans['transfers'];

      if (rawGoals is List && rawGoals.isNotEmpty) {
        mergedGoals = rawGoals
            .whereType<Map>()
            .map((e) => SavingsGoalModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
      if (rawRec is List && rawRec.isNotEmpty) {
        mergedRecurring = rawRec
            .whereType<Map>()
            .map((e) => RecurringItemModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
      if (rawDebts is List && rawDebts.isNotEmpty) {
        mergedDebts = rawDebts
            .whereType<Map>()
            .map((e) => DebtItemModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
      if (rawTrf is List && rawTrf.isNotEmpty) {
        mergedTransfers = rawTrf
            .whereType<Map>()
            .map((e) => TransferLogModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }

      final remainingQueue = await _store.loadQueue(uid);
      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        hasMoreHistory:
            trxList.length >= _pageSize || incList.length >= _pageSize,
        isOffline: false,
        pendingSyncCount: remainingQueue.length,
        lastSyncedAt: now,
        accounts: accounts,
        transactions: trxList,
        incomes: incList,
        savingsGoals: mergedGoals,
        recurringItems: mergedRecurring,
        debts: mergedDebts,
        transfers: mergedTransfers,
        budget: results[2] as BudgetModel?,
        insights: results[3] as List<InsightModel>,
        alerts: _deduplicateAlerts(results[4] as List<AlertModel>),
        scoreHistory: results[5] as List<ScoreHistoryItem>,
        broadcasts: results[6] as List<Map<String, dynamic>>,
        clearError: true,
      );
      await _persistState(syncedAt: now);

      // If local device had plans that were not yet in cloud, push them up
      final cloudEmpty = (rawGoals is! List || rawGoals.isEmpty) &&
          (rawRec is! List || rawRec.isEmpty) &&
          (rawDebts is! List || rawDebts.isEmpty) &&
          (rawTrf is! List || rawTrf.isEmpty);
      if (cloudEmpty &&
          (mergedGoals.isNotEmpty ||
              mergedRecurring.isNotEmpty ||
              mergedDebts.isNotEmpty ||
              mergedTransfers.isNotEmpty)) {
        unawaited(_syncPlansToCloud());
      }

      // Load AI analytics in parallel without blocking primary UI
      await Future.wait([
        refreshHealthScore(period: state.scorePeriod),
        refreshBehaviorAndOverspending(),
      ]);
      await _persistState(syncedAt: now);
    } catch (e) {
      if (_isNetworkError(e)) {
        state = state.copyWith(isLoading: false, isOffline: true);
      } else {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  /// Syncs all pending local operations to backend and refreshes fresh state.
  Future<bool> syncPendingAndRefresh() async {
    final online = await _hasDeviceConnectivity();
    if (!online) {
      state = state.copyWith(isOffline: true);
      return false;
    }
    await _flushQueue(_uid);
    await loadAll();
    return !state.isOffline && state.pendingSyncCount == 0;
  }

  Future<void> _flushQueue(String uid) async {
    final queue = await _store.loadQueue(uid);
    if (queue.isEmpty) return;

    state = state.copyWith(isSyncing: true);
    final remaining = <PendingSyncOp>[];
    final idMap = <String, String>{};
    bool hitNetworkFailure = false;

    String? resolveId(String? raw) {
      if (raw == null || raw.isEmpty) return raw;
      return idMap[raw] ?? raw;
    }

    for (final op in queue) {
      if (hitNetworkFailure) {
        remaining.add(op);
        continue;
      }
      try {
        final p = op.payload;
        switch (op.type) {
          case 'create_account':
            final created = await _api.createAccount(
              accountName: (p['accountName'] ?? '').toString(),
              accountNumber: (p['accountNumber'] ?? '').toString(),
              balance: (p['balance'] as num?)?.toDouble() ?? 0,
            );
            if (op.localId != null) idMap[op.localId!] = created.id;
            break;
          case 'update_account':
            final id = resolveId(p['id']?.toString());
            if (id != null && !id.startsWith('local_')) {
              await _api.updateAccount(
                id,
                accountName: p['accountName']?.toString(),
                accountNumber: p['accountNumber']?.toString(),
                balance: (p['balance'] as num?)?.toDouble(),
              );
            }
            break;
          case 'delete_account':
            final id = resolveId(p['id']?.toString());
            if (id != null && !id.startsWith('local_')) {
              await _api.deleteAccount(id);
            }
            break;
          case 'create_transaction':
            final created = await _api.createTransaction(
              accountId: resolveId(p['accountId']?.toString()),
              categoryGroup: (p['categoryGroup'] ?? 'Needs').toString(),
              categoryDetail: p['categoryDetail']?.toString(),
              transactionDate:
                  DateTime.tryParse((p['transactionDate'] ?? '').toString()) ??
                      DateTime.now(),
              description: (p['description'] ?? '').toString(),
              amount: (p['amount'] as num?)?.toDouble() ?? 0,
              source: (p['source'] ?? 'manual').toString(),
            );
            if (op.localId != null) idMap[op.localId!] = created.id;
            break;
          case 'update_transaction':
            final id = resolveId(p['id']?.toString());
            if (id != null && !id.startsWith('local_')) {
              await _api.updateTransaction(
                id,
                accountId: resolveId(p['accountId']?.toString()),
                categoryGroup: (p['categoryGroup'] ?? 'Needs').toString(),
                categoryDetail: p['categoryDetail']?.toString(),
                transactionDate: DateTime.tryParse(
                      (p['transactionDate'] ?? '').toString(),
                    ) ??
                    DateTime.now(),
                description: (p['description'] ?? '').toString(),
                amount: (p['amount'] as num?)?.toDouble() ?? 0,
              );
            }
            break;
          case 'delete_transaction':
            final id = resolveId(p['id']?.toString());
            if (id != null && !id.startsWith('local_')) {
              await _api.deleteTransaction(id);
            }
            break;
          case 'create_income':
            final created = await _api.createIncome(
              accountId: resolveId(p['accountId']?.toString()),
              amount: (p['amount'] as num?)?.toDouble() ?? 0,
              incomeDate:
                  DateTime.tryParse((p['incomeDate'] ?? '').toString()) ??
                      DateTime.now(),
              source: (p['source'] ?? 'Pemasukan').toString(),
            );
            if (op.localId != null) idMap[op.localId!] = created.id;
            break;
          case 'update_income':
            final id = resolveId(p['id']?.toString());
            if (id != null && !id.startsWith('local_')) {
              await _api.updateIncome(
                id,
                accountId: resolveId(p['accountId']?.toString()),
                amount: (p['amount'] as num?)?.toDouble() ?? 0,
                incomeDate:
                    DateTime.tryParse((p['incomeDate'] ?? '').toString()) ??
                        DateTime.now(),
                source: (p['source'] ?? 'Pemasukan').toString(),
              );
            }
            break;
          case 'delete_income':
            final id = resolveId(p['id']?.toString());
            if (id != null && !id.startsWith('local_')) {
              await _api.deleteIncome(id);
            }
            break;
          case 'save_budget':
            await _api.createBudget(
              needsAmount: (p['needsAmount'] as num?)?.toDouble() ?? 0,
              wantsAmount: (p['wantsAmount'] as num?)?.toDouble() ?? 0,
              savingsAmount: (p['savingsAmount'] as num?)?.toDouble() ?? 0,
            );
            break;
          case 'transfer_accounts':
            final fromId = resolveId(p['fromAccountId']?.toString());
            final toId = resolveId(p['toAccountId']?.toString());
            if (fromId != null &&
                toId != null &&
                !fromId.startsWith('local_') &&
                !toId.startsWith('local_')) {
              await _api.transferFunds(
                fromAccountId: fromId,
                toAccountId: toId,
                amount: (p['amount'] as num?)?.toDouble() ?? 0,
                note: p['note']?.toString(),
              );
            }
            break;
        }
      } catch (e) {
        if (_isNetworkError(e)) {
          hitNetworkFailure = true;
          remaining.add(op);
        }
        // Non-network validation errors drop the bad op so queue doesn't jam forever
      }
    }

    await _store.saveQueue(uid, remaining);
    state = state.copyWith(
      isSyncing: false,
      isOffline: hitNetworkFailure,
      pendingSyncCount: remaining.length,
    );
  }

  Future<void> refreshHealthScore({String? period}) async {
    final targetPeriod = period ?? state.scorePeriod;
    if (state.isOffline) {
      state = state.copyWith(scorePeriod: targetPeriod);
      return;
    }
    try {
      var score = await _api.calculateHealthScore(period: targetPeriod);
      // Fallback: if user hasn't recorded monthly income yet (totalIncome == 0)
      // and server returned <=15, compute a fair local baseline from available balance & transactions
      if (score.overallScore <= 15 &&
          score.totalIncome <= 0 &&
          (state.totalBalance > 0 || state.currentMonthTotalOutflow > 0)) {
        final effectiveFunds =
            state.totalBalance + state.currentMonthTotalOutflow;
        final expRatio = effectiveFunds > 0
            ? (state.currentMonthExpense / effectiveFunds).clamp(0.0, 1.5)
            : 0.0;
        final savRate = effectiveFunds > 0
            ? (state.totalBalance / effectiveFunds).clamp(0.0, 1.0)
            : 0.0;
        final expScore = (100 - (expRatio * 55)).round().clamp(25, 95);
        final savScore = ((savRate / 0.25) * 100).round().clamp(20, 100);
        final budScore = state.hasBudgetConfigured ? score.budgetScore : 65;
        final consScore =
            score.consistencyScore > 0 ? score.consistencyScore : 60;
        final overall =
            (savScore * 0.35 + expScore * 0.30 + budScore * 0.25 + consScore * 0.10)
                .round()
                .clamp(1, 100);
        score = HealthScoreResult(
          overallScore: overall,
          status: HealthScoreResult.statusForScore(overall),
          savingsScore: savScore,
          expenseScore: expScore,
          budgetScore: budScore,
          consistencyScore: consScore,
          savingsRate: savRate,
          expenseRatio: expRatio,
          budgetUsage: score.budgetUsage,
          needsRatio: score.needsRatio,
          wantsRatio: score.wantsRatio,
          savingsRatio: savRate,
          totalIncome: effectiveFunds,
          totalExpense: state.currentMonthExpense,
          budgetLimit: state.budget?.totalLimit ?? effectiveFunds,
          insights: [
            'Skor dihitung dari rasio saldo aktif (${(savRate * 100).toStringAsFixed(0)}%) terhadap pengeluaran karena pemasukan bulanan belum dicatat.',
            ...score.insights,
          ],
          recommendations: [
            'Catat pemasukan bulanan atau atur Target Budget 50/30/20 di menu Profil agar skor finansial makin presisi.',
            ...score.recommendations,
          ],
        );
      }
      final history =
          await _api.getScoreHistory().catchError((_) => state.scoreHistory);
      state = state.copyWith(
        healthScore: score,
        scoreHistory: history,
        scorePeriod: targetPeriod,
      );
      await _persistState();
    } catch (_) {}
  }

  Future<void> refreshBehaviorAndOverspending() async {
    if (state.isOffline) return;
    try {
      final latestTrx =
          state.transactions.isNotEmpty ? state.transactions.first : null;
      final now = DateTime.now();
      final rolling7d = state.transactions
          .where((t) => now.difference(t.transactionDate).inDays <= 7)
          .fold<double>(0, (s, t) => s + t.amount);

      BehaviorPredictionModel? behavior;
      try {
        behavior = await _api.predictBehavior(
          amount: latestTrx?.amount ?? 50000,
          categoryGroup: latestTrx?.categoryGroup ?? 'Needs',
          merchant: latestTrx?.description,
          rolling7dSpending: rolling7d,
        );
      } catch (_) {}

      OverspendingForecastModel? overspending;
      List<AlertModel>? freshAlerts;
      List<InsightModel>? freshInsights;
      try {
        overspending = await _api.predictOverspending(
          budgetLimit: state.budget?.totalLimit,
        );
        freshAlerts = await _api.getAlerts();
      } catch (_) {}

      try {
        freshInsights = await _api.analyzeBehavior();
      } catch (_) {}

      state = state.copyWith(
        behaviorPrediction: behavior ?? state.behaviorPrediction,
        overspendingForecast: overspending ?? state.overspendingForecast,
        insights: (freshInsights != null && freshInsights.isNotEmpty)
            ? freshInsights
            : state.insights,
        alerts: freshAlerts != null
            ? _deduplicateAlerts(freshAlerts)
            : state.alerts,
      );
      await _persistState();
    } catch (_) {}
  }

  Future<bool> addAccount({
    required String name,
    String accountNumber = '',
    required double balance,
  }) async {
    try {
      await _api.createAccount(
        accountName: name,
        accountNumber: accountNumber,
        balance: balance,
      );
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final localId = 'local_acc_${DateTime.now().millisecondsSinceEpoch}';
      final acc = AccountModel(
        id: localId,
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        balance: balance,
        type: BankData.inferAccountType(name),
      );
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'create_account',
          localId: localId,
          payload: {
            'accountName': name.trim(),
            'accountNumber': accountNumber.trim(),
            'balance': balance,
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: [...state.accounts, acc],
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> updateAccount(
    String id, {
    String? name,
    String? accountNumber,
    double? balance,
  }) async {
    try {
      await _api.updateAccount(
        id,
        accountName: name,
        accountNumber: accountNumber,
        balance: balance,
      );
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final updated = state.accounts.map((a) {
        if (a.id != id) return a;
        return a.copyWith(
          name: name?.trim(),
          accountNumber: accountNumber?.trim(),
          balance: balance,
        );
      }).toList();
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'update_account',
          payload: {
            'id': id,
            if (name != null) 'accountName': name.trim(),
            if (accountNumber != null) 'accountNumber': accountNumber.trim(),
            'balance': ?balance,
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updated,
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> deleteAccount(String id) async {
    try {
      await _api.deleteAccount(id);
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'delete_account',
          payload: {'id': id},
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: state.accounts.where((a) => a.id != id).toList(),
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  /// Returns `true` if synced online immediately, `false` if saved offline to queue.
  Future<bool> addTransaction({
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime transactionDate,
    required String description,
    required double amount,
    String source = 'manual',
    String? ocrScanId,
  }) async {
    try {
      if (ocrScanId != null && ocrScanId.isNotEmpty) {
        await _api.confirmOcrTransaction(
          ocrScanId,
          accountId: accountId,
          categoryGroup: categoryGroup,
          categoryDetail: categoryDetail,
          transactionDate: transactionDate,
          description: description,
          amount: amount,
        );
      } else {
        await _api.createTransaction(
          accountId: accountId,
          categoryGroup: categoryGroup,
          categoryDetail: categoryDetail,
          transactionDate: transactionDate,
          description: description,
          amount: amount,
          source: source,
        );
      }
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final localId = 'local_trx_${DateTime.now().millisecondsSinceEpoch}';
      final accName = state.accountNameById(accountId);
      final newTrx = TransactionModel(
        id: localId,
        accountId: accountId,
        accountName: accName != '-' ? accName : null,
        categoryGroup: categoryGroup,
        categoryDetail: categoryDetail,
        transactionDate: transactionDate,
        description: description.trim(),
        source: source,
        amount: amount,
      );
      final updatedAccounts = state.accounts.map((a) {
        if (a.id == accountId) {
          return a.copyWith(balance: (a.balance - amount).clamp(0, double.infinity));
        }
        return a;
      }).toList();

      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'create_transaction',
          localId: localId,
          payload: {
            'accountId': accountId,
            'categoryGroup': categoryGroup,
            'categoryDetail': categoryDetail,
            'transactionDate': transactionDate.toUtc().toIso8601String(),
            'description': description.trim(),
            'amount': amount,
            'source': source,
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        transactions: [newTrx, ...state.transactions],
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> updateTransaction(
    String id, {
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime transactionDate,
    required String description,
    required double amount,
  }) async {
    try {
      await _api.updateTransaction(
        id,
        accountId: accountId,
        categoryGroup: categoryGroup,
        categoryDetail: categoryDetail,
        transactionDate: transactionDate,
        description: description,
        amount: amount,
      );
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final oldIdx = state.transactions.indexWhere((t) => t.id == id);
      final old = oldIdx >= 0 ? state.transactions[oldIdx] : null;
      final updatedAccounts = state.accounts.map((a) {
        double bal = a.balance;
        if (old != null && a.id == old.accountId) bal += old.amount;
        if (a.id == accountId) bal = (bal - amount).clamp(0, double.infinity);
        return a.copyWith(balance: bal);
      }).toList();
      final updatedTrx = state.transactions.map((t) {
        if (t.id != id) return t;
        return TransactionModel(
          id: id,
          accountId: accountId,
          accountName: state.accountNameById(accountId),
          categoryGroup: categoryGroup,
          categoryDetail: categoryDetail,
          transactionDate: transactionDate,
          description: description.trim(),
          source: t.source,
          amount: amount,
        );
      }).toList();

      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'update_transaction',
          payload: {
            'id': id,
            'accountId': accountId,
            'categoryGroup': categoryGroup,
            'categoryDetail': categoryDetail,
            'transactionDate': transactionDate.toUtc().toIso8601String(),
            'description': description.trim(),
            'amount': amount,
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        transactions: updatedTrx,
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> deleteTransaction(String id) async {
    try {
      await _api.deleteTransaction(id);
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final oldIdx = state.transactions.indexWhere((t) => t.id == id);
      final old = oldIdx >= 0 ? state.transactions[oldIdx] : null;
      final updatedAccounts = state.accounts.map((a) {
        if (old != null && a.id == old.accountId) {
          return a.copyWith(balance: a.balance + old.amount);
        }
        return a;
      }).toList();
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'delete_transaction',
          payload: {'id': id},
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        transactions: state.transactions.where((t) => t.id != id).toList(),
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> addIncome({
    String? accountId,
    required double amount,
    required DateTime incomeDate,
    required String source,
  }) async {
    try {
      await _api.createIncome(
        accountId: accountId,
        amount: amount,
        incomeDate: incomeDate,
        source: source,
      );
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final localId = 'local_inc_${DateTime.now().millisecondsSinceEpoch}';
      final accName = state.accountNameById(accountId);
      final inc = IncomeModel(
        id: localId,
        accountId: accountId,
        accountName: accName != '-' ? accName : null,
        amount: amount,
        incomeDate: incomeDate,
        source: source.trim(),
      );
      final updatedAccounts = state.accounts.map((a) {
        if (a.id == accountId) return a.copyWith(balance: a.balance + amount);
        return a;
      }).toList();
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'create_income',
          localId: localId,
          payload: {
            'accountId': accountId,
            'amount': amount,
            'incomeDate': incomeDate.toUtc().toIso8601String(),
            'source': source.trim(),
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        incomes: [inc, ...state.incomes],
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> updateIncome(
    String id, {
    String? accountId,
    required double amount,
    required DateTime incomeDate,
    required String source,
  }) async {
    try {
      await _api.updateIncome(
        id,
        accountId: accountId,
        amount: amount,
        incomeDate: incomeDate,
        source: source,
      );
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final oldIdx = state.incomes.indexWhere((i) => i.id == id);
      final old = oldIdx >= 0 ? state.incomes[oldIdx] : null;
      final updatedAccounts = state.accounts.map((a) {
        double bal = a.balance;
        if (old != null && a.id == old.accountId) {
          bal = (bal - old.amount).clamp(0, double.infinity);
        }
        if (a.id == accountId) bal += amount;
        return a.copyWith(balance: bal);
      }).toList();
      final updatedIncomes = state.incomes.map((i) {
        if (i.id != id) return i;
        return IncomeModel(
          id: id,
          accountId: accountId,
          accountName: state.accountNameById(accountId),
          amount: amount,
          incomeDate: incomeDate,
          source: source.trim(),
        );
      }).toList();
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'update_income',
          payload: {
            'id': id,
            'accountId': accountId,
            'amount': amount,
            'incomeDate': incomeDate.toUtc().toIso8601String(),
            'source': source.trim(),
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        incomes: updatedIncomes,
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> deleteIncome(String id) async {
    try {
      await _api.deleteIncome(id);
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final oldIdx = state.incomes.indexWhere((i) => i.id == id);
      final old = oldIdx >= 0 ? state.incomes[oldIdx] : null;
      final updatedAccounts = state.accounts.map((a) {
        if (old != null && a.id == old.accountId) {
          return a.copyWith(
            balance: (a.balance - old.amount).clamp(0, double.infinity),
          );
        }
        return a;
      }).toList();
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'delete_income',
          payload: {'id': id},
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        incomes: state.incomes.where((i) => i.id != id).toList(),
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<bool> saveBudget({
    required double needsAmount,
    required double wantsAmount,
    required double savingsAmount,
  }) async {
    try {
      await _api.createBudget(
        needsAmount: needsAmount,
        wantsAmount: wantsAmount,
        savingsAmount: savingsAmount,
      );
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final total = needsAmount + wantsAmount + savingsAmount;
      final localBudget = BudgetModel(
        id: state.budget?.id ?? 'local_budget',
        needsAmount: needsAmount,
        wantsAmount: wantsAmount,
        savingsAmount: savingsAmount,
        needsUsed: state.budget?.needsUsed ?? 0,
        wantsUsed: state.budget?.wantsUsed ?? 0,
        savingsUsed: state.budget?.savingsUsed ?? 0,
        limitAmount: total,
      );
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'save_budget',
          payload: {
            'needsAmount': needsAmount,
            'wantsAmount': wantsAmount,
            'savingsAmount': savingsAmount,
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        budget: localBudget,
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<void> loadMoreHistory() async {
    if (state.isOffline || state.isLoadingMore || !state.hasMoreHistory) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final nextPage = _historyPage + 1;
      final moreTrx = await _api
          .getTransactions(limit: _pageSize, page: nextPage)
          .catchError((_) => <TransactionModel>[]);
      final moreInc = await _api
          .getIncomes(limit: _pageSize, page: nextPage)
          .catchError((_) => <IncomeModel>[]);

      final existingTrxIds = state.transactions.map((t) => t.id).toSet();
      final existingIncIds = state.incomes.map((i) => i.id).toSet();
      final mergedTrx = [
        ...state.transactions,
        ...moreTrx.where((t) => !existingTrxIds.contains(t.id)),
      ];
      final mergedInc = [
        ...state.incomes,
        ...moreInc.where((i) => !existingIncIds.contains(i.id)),
      ];

      _historyPage = nextPage;
      state = state.copyWith(
        isLoadingMore: false,
        hasMoreHistory:
            moreTrx.length >= _pageSize || moreInc.length >= _pageSize,
        transactions: mergedTrx,
        incomes: mergedInc,
      );
      await _persistState();
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  /// Transfers balance between two accounts without inflating monthly expense/income metrics.
  /// Returns `true` if synced online immediately, `false` if saved offline to queue.
  Future<bool> transferBetweenAccounts({
    required String fromAccountId,
    required String toAccountId,
    required double amount,
    String? note,
  }) async {
    if (fromAccountId == toAccountId) {
      throw Exception('Akun asal dan akun tujuan tidak boleh sama.');
    }
    if (amount <= 0) {
      throw Exception('Nominal transfer harus lebih dari 0.');
    }
    final fromName = state.accountNameById(fromAccountId);
    final toName = state.accountNameById(toAccountId);
    final logEntry = TransferLogModel(
      id: 'trf_${DateTime.now().millisecondsSinceEpoch}',
      fromAccountId: fromAccountId,
      fromAccountName: fromName,
      toAccountId: toAccountId,
      toAccountName: toName,
      amount: amount,
      note: (note ?? '').trim(),
      date: DateTime.now(),
    );
    try {
      await _api.transferFunds(
        fromAccountId: fromAccountId,
        toAccountId: toAccountId,
        amount: amount,
        note: note,
      );
      state = state.copyWith(
        transfers: [logEntry, ...state.transfers],
      );
      await _persistState();
      await loadAll();
      return true;
    } catch (e) {
      if (!_isNetworkError(e)) rethrow;
      final sourceIdx = state.accounts.indexWhere((a) => a.id == fromAccountId);
      if (sourceIdx >= 0 && state.accounts[sourceIdx].balance < amount) {
        throw Exception(
          'Saldo akun "${state.accounts[sourceIdx].name}" tidak mencukupi untuk transfer ini.',
        );
      }
      final updatedAccounts = state.accounts.map((a) {
        if (a.id == fromAccountId) {
          return a.copyWith(
            balance: (a.balance - amount).clamp(0, double.infinity),
          );
        }
        if (a.id == toAccountId) {
          return a.copyWith(balance: a.balance + amount);
        }
        return a;
      }).toList();
      await _store.enqueue(
        _uid,
        PendingSyncOp(
          id: 'op_${DateTime.now().microsecondsSinceEpoch}',
          type: 'transfer_accounts',
          payload: {
            'fromAccountId': fromAccountId,
            'toAccountId': toAccountId,
            'amount': amount,
            if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
          },
          createdAt: DateTime.now(),
        ),
      );
      state = state.copyWith(
        isOffline: true,
        accounts: updatedAccounts,
        transfers: [logEntry, ...state.transfers],
        pendingSyncCount: state.pendingSyncCount + 1,
      );
      await _persistState();
      return false;
    }
  }

  Future<void> clearAlerts() async {
    state = state.copyWith(alerts: const []);
    await _persistState();
  }

  Future<void> _syncPlansToCloud() async {
    if (state.isOffline) return;
    try {
      await _api.saveFinancialPlans(
        savingsGoals: state.savingsGoals.map((g) => g.toJson()).toList(),
        recurringItems: state.recurringItems.map((r) => r.toJson()).toList(),
        debts: state.debts.map((d) => d.toJson()).toList(),
        transfers: state.transfers.map((t) => t.toJson()).toList(),
      );
    } catch (_) {}
  }

  // ── SAVINGS GOALS (TARGET TABUNGAN) ────────────────────────

  Future<void> addSavingsGoal({
    required String title,
    required double targetAmount,
    double initialAmount = 0,
    String category = 'Dana Darurat',
    DateTime? targetDate,
  }) async {
    final goal = SavingsGoalModel(
      id: 'goal_${DateTime.now().millisecondsSinceEpoch}',
      title: title.trim(),
      targetAmount: targetAmount,
      currentAmount: initialAmount,
      category: category,
      targetDate: targetDate,
      createdAt: DateTime.now(),
    );
    state = state.copyWith(savingsGoals: [goal, ...state.savingsGoals]);
    await _persistState();
    await _syncPlansToCloud();
  }

  Future<void> contributeToSavingsGoal({
    required String goalId,
    required double amount,
    String? sourceAccountId,
  }) async {
    final idx = state.savingsGoals.indexWhere((g) => g.id == goalId);
    if (idx < 0 || amount <= 0) return;
    final goal = state.savingsGoals[idx];

    if (sourceAccountId != null && sourceAccountId.isNotEmpty) {
      await addTransaction(
        accountId: sourceAccountId,
        categoryGroup: 'Savings',
        categoryDetail: goal.category,
        transactionDate: DateTime.now(),
        description: 'Tabungan: ${goal.title}',
        amount: amount,
      );
    }

    final updated = state.savingsGoals.map((g) {
      if (g.id != goalId) return g;
      return g.copyWith(currentAmount: g.currentAmount + amount);
    }).toList();
    state = state.copyWith(savingsGoals: updated);
    await _persistState();
    await _syncPlansToCloud();
  }

  Future<void> deleteSavingsGoal(String goalId) async {
    state = state.copyWith(
      savingsGoals: state.savingsGoals.where((g) => g.id != goalId).toList(),
    );
    await _persistState();
    await _syncPlansToCloud();
  }

  // ── RECURRING BILLS & SALARY (TAGIHAN & GAJI RUTIN) ────────

  Future<void> addRecurringItem({
    required String title,
    required double amount,
    required bool isIncome,
    String categoryGroup = 'Needs',
    String? accountId,
    int dayOfMonth = 1,
  }) async {
    final item = RecurringItemModel(
      id: 'rec_${DateTime.now().millisecondsSinceEpoch}',
      title: title.trim(),
      amount: amount,
      isIncome: isIncome,
      categoryGroup: isIncome ? 'Income' : categoryGroup,
      accountId: accountId,
      dayOfMonth: dayOfMonth.clamp(1, 31),
      createdAt: DateTime.now(),
    );
    state = state.copyWith(recurringItems: [item, ...state.recurringItems]);
    await _persistState();
    await _syncPlansToCloud();
  }

  Future<bool> executeRecurringItem(String id) async {
    final idx = state.recurringItems.indexWhere((r) => r.id == id);
    if (idx < 0) return false;
    final item = state.recurringItems[idx];
    final now = DateTime.now();
    final targetAccountId = item.accountId ??
        (state.accounts.isNotEmpty ? state.accounts.first.id : null);

    bool syncedOnline;
    if (item.isIncome) {
      syncedOnline = await addIncome(
        accountId: targetAccountId,
        amount: item.amount,
        incomeDate: now,
        source: item.title,
      );
    } else {
      syncedOnline = await addTransaction(
        accountId: targetAccountId,
        categoryGroup: item.categoryGroup,
        categoryDetail: 'Rutin Bulanan',
        transactionDate: now,
        description: item.title,
        amount: item.amount,
      );
    }

    final period = RecurringItemModel.periodKey(now);
    final updated = state.recurringItems.map((r) {
      if (r.id != id) return r;
      return r.copyWith(lastPaidPeriod: period);
    }).toList();
    state = state.copyWith(recurringItems: updated);
    await _persistState();
    await _syncPlansToCloud();
    return syncedOnline;
  }

  Future<void> deleteRecurringItem(String id) async {
    state = state.copyWith(
      recurringItems: state.recurringItems.where((r) => r.id != id).toList(),
    );
    await _persistState();
    await _syncPlansToCloud();
  }

  Future<void> deleteTransferLog(String id) async {
    state = state.copyWith(
      transfers: state.transfers.where((t) => t.id != id).toList(),
    );
    await _persistState();
    await _syncPlansToCloud();
  }

  // ── DEBTS & SPLIT BILL (UTANG / PIUTANG & PATUNGAN) ────────

  Future<void> addDebtItem({
    required String personName,
    String phone = '',
    required double amount,
    required bool isReceivable,
    String note = '',
    DateTime? dueDate,
  }) async {
    final item = DebtItemModel(
      id: 'debt_${DateTime.now().millisecondsSinceEpoch}_${state.debts.length}',
      personName: personName.trim(),
      phone: phone.trim(),
      amount: amount,
      isReceivable: isReceivable,
      note: note.trim(),
      dueDate: dueDate,
      createdAt: DateTime.now(),
    );
    state = state.copyWith(debts: [item, ...state.debts]);
    await _persistState();
    await _syncPlansToCloud();
  }

  Future<void> settleDebtItem(String id, {String? accountId}) async {
    final idx = state.debts.indexWhere((d) => d.id == id);
    if (idx < 0) return;
    final item = state.debts[idx];
    if (item.isSettled) return;

    if (accountId != null && accountId.isNotEmpty) {
      if (item.isReceivable) {
        await addIncome(
          accountId: accountId,
          amount: item.amount,
          incomeDate: DateTime.now(),
          source: 'Pelunasan Piutang: ${item.personName}',
        );
      } else {
        await addTransaction(
          accountId: accountId,
          categoryGroup: 'Needs',
          categoryDetail: 'Pelunasan Utang',
          transactionDate: DateTime.now(),
          description: 'Pelunasan Utang ke ${item.personName}',
          amount: item.amount,
        );
      }
    }

    final updated = state.debts.map((d) {
      if (d.id != id) return d;
      return d.copyWith(isSettled: true);
    }).toList();
    state = state.copyWith(debts: updated);
    await _persistState();
    await _syncPlansToCloud();
  }

  Future<void> deleteDebtItem(String id) async {
    state = state.copyWith(
      debts: state.debts.where((d) => d.id != id).toList(),
    );
    await _persistState();
    await _syncPlansToCloud();
  }

  // ── E-WALLET & BANK NOTIFICATION AUTO-SYNC ─────────────────

  Future<void> configureEWalletLink({
    required String providerId,
    String? linkedAccountId,
    required bool autoRecordEnabled,
  }) async {
    final base = state.ewalletLinks.isNotEmpty
        ? state.ewalletLinks
        : EWalletLinkModel.defaultProviders;
    final updated = base.map((e) {
      if (e.providerId != providerId) return e;
      return e.copyWith(
        linkedAccountId: linkedAccountId,
        autoRecordEnabled: autoRecordEnabled,
      );
    }).toList();
    state = state.copyWith(ewalletLinks: updated);
    await _persistState();
  }

  /// Auto-records a transaction or income parsed from an incoming E-Wallet / Mobile Banking notification.
  Future<bool> ingestEWalletNotification({
    required String providerId,
    required double amount,
    required String merchantOrTitle,
    bool isIncome = false,
  }) async {
    if (amount <= 0) return false;
    final links = state.ewalletLinks.isNotEmpty
        ? state.ewalletLinks
        : EWalletLinkModel.defaultProviders;
    final link = links.firstWhere(
      (e) => e.providerId == providerId || e.packageName == providerId,
      orElse: () => links.first,
    );

    final targetAccId = link.linkedAccountId ??
        (state.accounts.isNotEmpty ? state.accounts.first.id : null);

    if (isIncome) {
      await addIncome(
        accountId: targetAccId,
        amount: amount,
        incomeDate: DateTime.now(),
        source: '${link.providerName}: $merchantOrTitle',
      );
    } else {
      await addTransaction(
        accountId: targetAccId,
        categoryGroup: 'Wants',
        categoryDetail: link.providerName,
        transactionDate: DateTime.now(),
        description: '$merchantOrTitle (${link.providerName})',
        amount: amount,
        source: 'ewallet_auto',
      );
    }

    final updatedLinks = links.map((e) {
      if (e.providerId != link.providerId) return e;
      return e.copyWith(
        syncedCount: e.syncedCount + 1,
        lastDetectedAt: DateTime.now(),
      );
    }).toList();
    state = state.copyWith(ewalletLinks: updatedLinks);
    await _persistState();
    return true;
  }

  Future<void> restoreFromBackupMap(Map<String, dynamic> decoded) async {
    final rawGoals = (decoded['savingsGoals'] is List)
        ? (decoded['savingsGoals'] as List).take(200).toList()
        : const [];
    final rawRec = (decoded['recurringItems'] is List)
        ? (decoded['recurringItems'] as List).take(200).toList()
        : const [];
    final rawDebts = (decoded['debts'] is List)
        ? (decoded['debts'] as List).take(200).toList()
        : const [];
    final rawTransfers = (decoded['transfers'] is List)
        ? (decoded['transfers'] as List).take(200).toList()
        : const [];

    final goals = rawGoals
        .whereType<Map>()
        .map((e) => SavingsGoalModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final recs = rawRec
        .whereType<Map>()
        .map((e) => RecurringItemModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final debts = rawDebts
        .whereType<Map>()
        .map((e) => DebtItemModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final transfers = rawTransfers
        .whereType<Map>()
        .map((e) => TransferLogModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();

    state = state.copyWith(
      savingsGoals: goals.isNotEmpty ? goals : state.savingsGoals,
      recurringItems: recs.isNotEmpty ? recs : state.recurringItems,
      debts: debts.isNotEmpty ? debts : state.debts,
      transfers: transfers.isNotEmpty ? transfers : state.transfers,
    );
    await _persistState();
    await _syncPlansToCloud();
    await loadAll();
  }

  void clear() {
    _activeUserId = null;
    _historyPage = 1;
    state = const FinanceState();
  }
}

final financeProvider = StateNotifierProvider<FinanceNotifier, FinanceState>(
  (ref) => FinanceNotifier(
    ref.watch(sadarApiServiceProvider),
    ref.watch(localFinanceStoreProvider),
    () => ref.read(authProvider).user?.id,
  ),
);
