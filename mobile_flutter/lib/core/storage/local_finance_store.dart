import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/account_model.dart';
import '../../data/models/analytics_models.dart';
import '../../data/models/budget_model.dart';
import '../../data/models/financial_plan_models.dart';
import '../../data/models/income_model.dart';
import '../../data/models/transaction_model.dart';

class PendingSyncOp {
  final String id;
  final String type; // create_account | update_account | delete_account | create_transaction | update_transaction | delete_transaction | create_income | update_income | delete_income | save_budget | transfer_accounts
  final Map<String, dynamic> payload;
  final String? localId;
  final DateTime createdAt;

  const PendingSyncOp({
    required this.id,
    required this.type,
    required this.payload,
    this.localId,
    required this.createdAt,
  });

  factory PendingSyncOp.fromJson(Map<String, dynamic> json) {
    return PendingSyncOp(
      id: (json['id'] ?? '').toString(),
      type: (json['type'] ?? '').toString(),
      payload: Map<String, dynamic>.from((json['payload'] as Map?) ?? const {}),
      localId: json['localId']?.toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'payload': payload,
        'localId': localId,
        'createdAt': createdAt.toIso8601String(),
      };
}

class LocalFinanceSnapshot {
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
  final BehaviorPredictionModel? behaviorPrediction;
  final OverspendingForecastModel? overspendingForecast;
  final DateTime? lastSyncedAt;

  const LocalFinanceSnapshot({
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
    this.behaviorPrediction,
    this.overspendingForecast,
    this.lastSyncedAt,
  });
}

class LocalFinanceStore {
  String _cacheKey(String userId) => 'sadar_finance_cache_$userId';
  String _queueKey(String userId) => 'sadar_sync_queue_$userId';

  Future<void> saveSnapshot(
    String userId, {
    required List<AccountModel> accounts,
    required List<TransactionModel> transactions,
    required List<IncomeModel> incomes,
    List<TransferLogModel> transfers = const [],
    List<SavingsGoalModel> savingsGoals = const [],
    List<RecurringItemModel> recurringItems = const [],
    List<DebtItemModel> debts = const [],
    List<EWalletLinkModel> ewalletLinks = const [],
    BudgetModel? budget,
    HealthScoreResult? healthScore,
    List<ScoreHistoryItem> scoreHistory = const [],
    List<InsightModel> insights = const [],
    List<AlertModel> alerts = const [],
    BehaviorPredictionModel? behaviorPrediction,
    OverspendingForecastModel? overspendingForecast,
    DateTime? lastSyncedAt,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final map = <String, dynamic>{
        'accounts': accounts.map((e) => e.toJson()).toList(),
        'transactions': transactions.map((e) => e.toJson()).toList(),
        'incomes': incomes.map((e) => e.toJson()).toList(),
        'transfers': transfers.map((e) => e.toJson()).toList(),
        'savingsGoals': savingsGoals.map((e) => e.toJson()).toList(),
        'recurringItems': recurringItems.map((e) => e.toJson()).toList(),
        'debts': debts.map((e) => e.toJson()).toList(),
        'ewalletLinks': ewalletLinks.map((e) => e.toJson()).toList(),
        'budget': budget?.toJson(),
        'healthScore': healthScore?.toJson(),
        'scoreHistory': scoreHistory.map((e) => e.toJson()).toList(),
        'insights': insights.map((e) => e.toJson()).toList(),
        'alerts': alerts.map((e) => e.toJson()).toList(),
        'behaviorPrediction': behaviorPrediction?.toJson(),
        'overspendingForecast': overspendingForecast?.toJson(),
        'lastSyncedAt': lastSyncedAt?.toIso8601String(),
      };
      await prefs.setString(_cacheKey(userId), jsonEncode(map));
    } catch (_) {}
  }

  Future<LocalFinanceSnapshot?> loadSnapshot(String userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey(userId));
      if (raw == null || raw.isEmpty) return null;
      final map = jsonDecode(raw);
      if (map is! Map<String, dynamic>) return null;

      return LocalFinanceSnapshot(
        accounts: ((map['accounts'] as List?) ?? const [])
            .map((e) => AccountModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        transactions: ((map['transactions'] as List?) ?? const [])
            .map((e) => TransactionModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        incomes: ((map['incomes'] as List?) ?? const [])
            .map((e) => IncomeModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        transfers: ((map['transfers'] as List?) ?? const [])
            .map((e) => TransferLogModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        savingsGoals: ((map['savingsGoals'] as List?) ?? const [])
            .map((e) => SavingsGoalModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        recurringItems: ((map['recurringItems'] as List?) ?? const [])
            .map((e) => RecurringItemModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        debts: ((map['debts'] as List?) ?? const [])
            .map((e) => DebtItemModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        ewalletLinks: ((map['ewalletLinks'] as List?) ?? const [])
            .map((e) => EWalletLinkModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        budget: map['budget'] is Map
            ? BudgetModel.fromJson(Map<String, dynamic>.from(map['budget'] as Map))
            : null,
        healthScore: map['healthScore'] is Map
            ? HealthScoreResult.fromJson(
                Map<String, dynamic>.from(map['healthScore'] as Map),
              )
            : null,
        scoreHistory: ((map['scoreHistory'] as List?) ?? const [])
            .map((e) => ScoreHistoryItem.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        insights: ((map['insights'] as List?) ?? const [])
            .map((e) => InsightModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        alerts: ((map['alerts'] as List?) ?? const [])
            .map((e) => AlertModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        behaviorPrediction: map['behaviorPrediction'] is Map
            ? BehaviorPredictionModel.fromJson(
                Map<String, dynamic>.from(map['behaviorPrediction'] as Map),
              )
            : null,
        overspendingForecast: map['overspendingForecast'] is Map
            ? OverspendingForecastModel.fromJson(
                Map<String, dynamic>.from(map['overspendingForecast'] as Map),
              )
            : null,
        lastSyncedAt: map['lastSyncedAt'] != null
            ? DateTime.tryParse(map['lastSyncedAt'].toString())
            : null,
      );
    } catch (_) {
      return null;
    }
  }

  Future<List<PendingSyncOp>> loadQueue(String userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_queueKey(userId));
      if (raw == null || raw.isEmpty) return [];
      final decoded = jsonDecode(raw);
      if (decoded is! List) return [];
      return decoded
          .map((e) => PendingSyncOp.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> saveQueue(String userId, List<PendingSyncOp> ops) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _queueKey(userId),
        jsonEncode(ops.map((e) => e.toJson()).toList()),
      );
    } catch (_) {}
  }

  Future<void> enqueue(String userId, PendingSyncOp op) async {
    final queue = await loadQueue(userId);
    queue.add(op);
    await saveQueue(userId, queue);
  }
}
