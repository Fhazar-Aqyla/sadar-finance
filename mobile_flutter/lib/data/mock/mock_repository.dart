import '../../core/constants/bank_data.dart';
import '../../core/constants/category_helpers.dart';
import '../models/account_model.dart';
import '../models/analytics_models.dart';
import '../models/budget_model.dart';
import '../models/income_model.dart';
import '../models/ocr_scan_model.dart';
import '../models/transaction_model.dart';
import '../models/user_model.dart';

/// Interactive in-memory Demo repository matching web mockData.js so the user
/// can explore every SADAR Finance screen immediately even without a local DB.
class MockRepository {
  UserModel _user = const UserModel(
    id: 'user_demo_01',
    firstName: 'Aqyla',
    lastName: 'Rafi',
    email: 'demo@sadarfinance.com',
    gender: 'male',
    phoneNumber: '081234567890',
    address: 'Jakarta Selatan, Indonesia',
    occupation: 'Product Engineer',
  );

  final List<AccountModel> _accounts = [
    const AccountModel(
      id: 'acc_001',
      name: 'Tunai',
      accountNumber: '',
      balance: 650000,
      type: 'Cash',
    ),
    const AccountModel(
      id: 'acc_002',
      name: 'BCA Everyday',
      accountNumber: '5210 8842 19',
      balance: 12600000,
      type: 'Bank',
    ),
    const AccountModel(
      id: 'acc_003',
      name: 'GoPay',
      accountNumber: '0812-3456-7890',
      balance: 1250000,
      type: 'E-wallet',
    ),
  ];

  late final List<IncomeModel> _incomes = _seedIncomes();
  late final List<TransactionModel> _transactions = _seedTransactions();

  BudgetModel _budget = const BudgetModel(
    id: 'bdg_001',
    needsAmount: 4775000,
    wantsAmount: 2865000,
    savingsAmount: 1910000,
    limitAmount: 9550000,
  );

  List<IncomeModel> _seedIncomes() {
    final now = DateTime.now();
    return [
      IncomeModel(
        id: 'inc_001',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        source: 'Gaji',
        amount: 8200000,
        incomeDate: DateTime(now.year, now.month, 1),
      ),
      IncomeModel(
        id: 'inc_002',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        source: 'Freelance',
        amount: 1350000,
        incomeDate: DateTime(now.year, now.month, now.day > 10 ? 10 : 1),
      ),
      IncomeModel(
        id: 'inc_003',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        source: 'Gaji',
        amount: 8200000,
        incomeDate: DateTime(now.year, now.month - 1, 1),
      ),
      IncomeModel(
        id: 'inc_004',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        source: 'Gaji',
        amount: 7900000,
        incomeDate: DateTime(now.year, now.month - 2, 1),
      ),
    ];
  }

  List<TransactionModel> _seedTransactions() {
    final now = DateTime.now();
    DateTime daysAgo(int d) => now.subtract(Duration(days: d));
    return [
      TransactionModel(
        id: 'trx_001',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Needs',
        categoryDetail: 'Belanja Harian',
        description: 'Belanja bulanan Superindo',
        amount: 425000,
        transactionDate: daysAgo(0),
        source: 'ocr',
      ),
      TransactionModel(
        id: 'trx_002',
        accountId: 'acc_003',
        accountName: 'GoPay',
        categoryGroup: 'Needs',
        categoryDetail: 'Transportasi',
        description: 'Transport online ke kantor',
        amount: 54000,
        transactionDate: daysAgo(1),
      ),
      TransactionModel(
        id: 'trx_003',
        accountId: 'acc_003',
        accountName: 'GoPay',
        categoryGroup: 'Wants',
        categoryDetail: 'Kopi & Nongkrong',
        description: 'Kopi Kenangan & snack',
        amount: 87000,
        transactionDate: daysAgo(2),
        source: 'ocr',
      ),
      TransactionModel(
        id: 'trx_004',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Wants',
        categoryDetail: 'Hiburan',
        description: 'Langganan musik & streaming',
        amount: 129000,
        transactionDate: daysAgo(3),
      ),
      TransactionModel(
        id: 'trx_005',
        accountId: 'acc_003',
        accountName: 'GoPay',
        categoryGroup: 'Needs',
        categoryDetail: 'Makanan & Minuman',
        description: 'Makan malam akhir pekan',
        amount: 238000,
        transactionDate: daysAgo(5),
      ),
      TransactionModel(
        id: 'trx_006',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Wants',
        categoryDetail: 'Belanja Gaya Hidup',
        description: 'Belanja fashion marketplace',
        amount: 620000,
        transactionDate: daysAgo(6),
      ),
      TransactionModel(
        id: 'trx_007',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Needs',
        categoryDetail: 'Tagihan & Utilitas',
        description: 'Tagihan listrik & internet',
        amount: 465000,
        transactionDate: daysAgo(8),
      ),
      TransactionModel(
        id: 'trx_008',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Savings',
        categoryDetail: 'Dana Darurat',
        description: 'Top up dana darurat',
        amount: 1150000,
        transactionDate: daysAgo(9),
      ),
      TransactionModel(
        id: 'trx_009',
        accountId: 'acc_001',
        accountName: 'Tunai',
        categoryGroup: 'Needs',
        categoryDetail: 'Makanan & Minuman',
        description: 'Sarapan & parkir harian',
        amount: 48000,
        transactionDate: daysAgo(10),
      ),
      TransactionModel(
        id: 'trx_010',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Needs',
        categoryDetail: 'Kesehatan',
        description: 'Apotek obat dan vitamin',
        amount: 128000,
        transactionDate: daysAgo(12),
      ),
      TransactionModel(
        id: 'trx_011',
        accountId: 'acc_003',
        accountName: 'GoPay',
        categoryGroup: 'Wants',
        categoryDetail: 'Hiburan',
        description: 'Tiket bioskop akhir pekan',
        amount: 165000,
        transactionDate: daysAgo(14),
      ),
      TransactionModel(
        id: 'trx_012',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Needs',
        categoryDetail: 'Belanja Harian',
        description: 'Kebutuhan rumah bulan lalu',
        amount: 2150000,
        transactionDate: DateTime(now.year, now.month - 1, 12),
      ),
      TransactionModel(
        id: 'trx_013',
        accountId: 'acc_003',
        accountName: 'GoPay',
        categoryGroup: 'Wants',
        categoryDetail: 'Belanja Gaya Hidup',
        description: 'Hangout & belanja bulan lalu',
        amount: 1450000,
        transactionDate: DateTime(now.year, now.month - 1, 19),
      ),
      TransactionModel(
        id: 'trx_014',
        accountId: 'acc_002',
        accountName: 'BCA Everyday',
        categoryGroup: 'Savings',
        categoryDetail: 'Tabungan',
        description: 'Setor tabungan bulan lalu',
        amount: 1600000,
        transactionDate: DateTime(now.year, now.month - 1, 22),
      ),
    ];
  }

  UserModel get user => _user;

  UserModel updateUser({
    String? firstName,
    String? lastName,
    String? gender,
    String? phoneNumber,
    String? address,
    String? occupation,
  }) {
    _user = _user.copyWith(
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      phoneNumber: phoneNumber,
      address: address,
      occupation: occupation,
    );
    return _user;
  }

  List<AccountModel> getAccounts() => List.unmodifiable(_accounts);

  AccountModel addAccount({
    required String name,
    String accountNumber = '',
    required double balance,
  }) {
    final acc = AccountModel(
      id: 'acc_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      accountNumber: accountNumber,
      balance: balance,
      type: BankData.inferAccountType(name),
    );
    _accounts.add(acc);
    return acc;
  }

  AccountModel updateAccount(
    String id, {
    String? name,
    String? accountNumber,
    double? balance,
  }) {
    final idx = _accounts.indexWhere((a) => a.id == id);
    if (idx == -1) throw Exception('Akun tidak ditemukan');
    final updated = _accounts[idx].copyWith(
      name: name,
      accountNumber: accountNumber,
      balance: balance,
      type: name != null ? BankData.inferAccountType(name) : null,
    );
    _accounts[idx] = updated;
    return updated;
  }

  void deleteAccount(String id) {
    _accounts.removeWhere((a) => a.id == id);
  }

  List<TransactionModel> getTransactions() {
    final sorted = [..._transactions]
      ..sort((a, b) => b.transactionDate.compareTo(a.transactionDate));
    return sorted;
  }

  TransactionModel addTransaction({
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime date,
    required String description,
    required double amount,
    String source = 'manual',
  }) {
    String? accName;
    if (accountId != null) {
      final idx = _accounts.indexWhere((a) => a.id == accountId);
      if (idx != -1) {
        accName = _accounts[idx].name;
        _accounts[idx] = _accounts[idx].copyWith(
          balance: _accounts[idx].balance - amount,
        );
      }
    }
    final trx = TransactionModel(
      id: 'trx_${DateTime.now().millisecondsSinceEpoch}',
      accountId: accountId,
      accountName: accName,
      categoryGroup: CategoryHelpers.normalizeGroup(categoryGroup),
      categoryDetail: categoryDetail,
      transactionDate: date,
      description: description,
      amount: amount,
      source: source,
    );
    _transactions.insert(0, trx);
    return trx;
  }

  TransactionModel updateTransaction(
    String id, {
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime date,
    required String description,
    required double amount,
  }) {
    final idx = _transactions.indexWhere((t) => t.id == id);
    if (idx == -1) throw Exception('Transaksi tidak ditemukan');
    final prev = _transactions[idx];
    if (prev.accountId != null) {
      final oldAcc = _accounts.indexWhere((a) => a.id == prev.accountId);
      if (oldAcc != -1) {
        _accounts[oldAcc] = _accounts[oldAcc].copyWith(
          balance: _accounts[oldAcc].balance + prev.amount,
        );
      }
    }
    String? accName;
    if (accountId != null) {
      final newAcc = _accounts.indexWhere((a) => a.id == accountId);
      if (newAcc != -1) {
        accName = _accounts[newAcc].name;
        _accounts[newAcc] = _accounts[newAcc].copyWith(
          balance: _accounts[newAcc].balance - amount,
        );
      }
    }
    final updated = TransactionModel(
      id: prev.id,
      accountId: accountId,
      accountName: accName,
      categoryGroup: CategoryHelpers.normalizeGroup(categoryGroup),
      categoryDetail: categoryDetail,
      transactionDate: date,
      description: description,
      amount: amount,
      source: prev.source,
    );
    _transactions[idx] = updated;
    return updated;
  }

  void deleteTransaction(String id) {
    final idx = _transactions.indexWhere((t) => t.id == id);
    if (idx == -1) return;
    final trx = _transactions.removeAt(idx);
    if (trx.accountId != null) {
      final accIdx = _accounts.indexWhere((a) => a.id == trx.accountId);
      if (accIdx != -1) {
        _accounts[accIdx] = _accounts[accIdx].copyWith(
          balance: _accounts[accIdx].balance + trx.amount,
        );
      }
    }
  }

  List<IncomeModel> getIncomes() {
    final sorted = [..._incomes]
      ..sort((a, b) => b.incomeDate.compareTo(a.incomeDate));
    return sorted;
  }

  IncomeModel addIncome({
    String? accountId,
    required double amount,
    required DateTime date,
    required String source,
  }) {
    String? accName;
    if (accountId != null) {
      final idx = _accounts.indexWhere((a) => a.id == accountId);
      if (idx != -1) {
        accName = _accounts[idx].name;
        _accounts[idx] = _accounts[idx].copyWith(
          balance: _accounts[idx].balance + amount,
        );
      }
    }
    final inc = IncomeModel(
      id: 'inc_${DateTime.now().millisecondsSinceEpoch}',
      accountId: accountId,
      accountName: accName,
      amount: amount,
      incomeDate: date,
      source: source,
    );
    _incomes.insert(0, inc);
    return inc;
  }

  IncomeModel updateIncome(
    String id, {
    String? accountId,
    required double amount,
    required DateTime date,
    required String source,
  }) {
    final idx = _incomes.indexWhere((i) => i.id == id);
    if (idx == -1) throw Exception('Pemasukan tidak ditemukan');
    final prev = _incomes[idx];
    if (prev.accountId != null) {
      final oldAcc = _accounts.indexWhere((a) => a.id == prev.accountId);
      if (oldAcc != -1) {
        _accounts[oldAcc] = _accounts[oldAcc].copyWith(
          balance: _accounts[oldAcc].balance - prev.amount,
        );
      }
    }
    String? accName;
    if (accountId != null) {
      final newAcc = _accounts.indexWhere((a) => a.id == accountId);
      if (newAcc != -1) {
        accName = _accounts[newAcc].name;
        _accounts[newAcc] = _accounts[newAcc].copyWith(
          balance: _accounts[newAcc].balance + amount,
        );
      }
    }
    final updated = IncomeModel(
      id: prev.id,
      accountId: accountId,
      accountName: accName,
      amount: amount,
      incomeDate: date,
      source: source,
    );
    _incomes[idx] = updated;
    return updated;
  }

  void deleteIncome(String id) {
    final idx = _incomes.indexWhere((i) => i.id == id);
    if (idx == -1) return;
    final inc = _incomes.removeAt(idx);
    if (inc.accountId != null) {
      final accIdx = _accounts.indexWhere((a) => a.id == inc.accountId);
      if (accIdx != -1) {
        _accounts[accIdx] = _accounts[accIdx].copyWith(
          balance: _accounts[accIdx].balance - inc.amount,
        );
      }
    }
  }

  BudgetModel getLatestBudget() {
    final now = DateTime.now();
    double needsUsed = 0;
    double wantsUsed = 0;
    double savingsUsed = 0;
    for (final t in _transactions) {
      if (t.transactionDate.year == now.year &&
          t.transactionDate.month == now.month) {
        switch (t.categoryGroup) {
          case 'Needs':
            needsUsed += t.amount;
          case 'Wants':
            wantsUsed += t.amount;
          case 'Savings':
            savingsUsed += t.amount;
        }
      }
    }
    return BudgetModel(
      id: _budget.id,
      needsAmount: _budget.needsAmount,
      wantsAmount: _budget.wantsAmount,
      savingsAmount: _budget.savingsAmount,
      needsUsed: needsUsed,
      wantsUsed: wantsUsed,
      savingsUsed: savingsUsed,
      limitAmount: _budget.totalLimit,
    );
  }

  BudgetModel saveBudget({
    required double needsAmount,
    required double wantsAmount,
    required double savingsAmount,
  }) {
    _budget = BudgetModel(
      id: 'bdg_${DateTime.now().millisecondsSinceEpoch}',
      needsAmount: needsAmount,
      wantsAmount: wantsAmount,
      savingsAmount: savingsAmount,
      limitAmount: needsAmount + wantsAmount + savingsAmount,
    );
    return getLatestBudget();
  }

  HealthScoreResult calculateHealthScore({String period = '3m'}) {
    final totalIncome = _incomes.fold<double>(0, (s, i) => s + i.amount);
    final totalExpense = _transactions
        .where((t) => t.categoryGroup != 'Savings')
        .fold<double>(0, (s, t) => s + t.amount);
    final needsTotal = _transactions
        .where((t) => t.categoryGroup == 'Needs')
        .fold<double>(0, (s, t) => s + t.amount);
    final wantsTotal = _transactions
        .where((t) => t.categoryGroup == 'Wants')
        .fold<double>(0, (s, t) => s + t.amount);
    final savingsTotal = _transactions
        .where((t) => t.categoryGroup == 'Savings')
        .fold<double>(0, (s, t) => s + t.amount);

    final budget = getLatestBudget();
    final expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 0.0;
    final savingsRate =
        totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0.0;
    final budgetUsage =
        budget.totalLimit > 0 ? budget.totalUsed / budget.totalLimit : 0.0;

    final expenseScore = expenseRatio <= 0.7
        ? 100
        : (100 - ((expenseRatio - 0.7) / 0.3) * 50).clamp(0, 100).round();
    final savingsScore = savingsRate >= 0.2
        ? 100
        : ((savingsRate.clamp(0, 0.2) / 0.2) * 100).round();
    final budgetScore = budgetUsage <= 0.8
        ? 100
        : (100 - ((budgetUsage - 0.8) / 0.2) * 40).clamp(0, 100).round();
    const consistencyScore = 88;

    final overall = (savingsScore * 0.35 +
            expenseScore * 0.30 +
            budgetScore * 0.25 +
            consistencyScore * 0.10)
        .round();

    return HealthScoreResult(
      overallScore: overall,
      status: HealthScoreResult.statusForScore(overall),
      savingsScore: savingsScore,
      expenseScore: expenseScore,
      budgetScore: budgetScore,
      consistencyScore: consistencyScore,
      savingsRate: savingsRate,
      expenseRatio: expenseRatio,
      budgetUsage: budgetUsage,
      needsRatio: totalIncome > 0 ? needsTotal / totalIncome : 0,
      wantsRatio: totalIncome > 0 ? wantsTotal / totalIncome : 0,
      savingsRatio: totalIncome > 0 ? savingsTotal / totalIncome : 0,
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      budgetLimit: budget.totalLimit,
      insights: [
        'Pengeluaran memakai ${(expenseRatio * 100).toStringAsFixed(1)}% dari total pemasukan pada periode ini.',
        'Anggaran bulanan terpakai ${(budgetUsage * 100).toStringAsFixed(1)}% dari pagu yang ditetapkan.',
        savingsRate >= 0.2
            ? 'Rasio tabungan sudah memenuhi target minimal 20%.'
            : 'Rasio tabungan masih di bawah target ideal 20%.',
      ],
      recommendations: [
        'Pertahankan porsi Kebutuhan di bawah 50% dan sisihkan minimal 20% untuk Tabungan/Investasi.',
        'Perhatikan lonjakan belanja kategori Keinginan di akhir pekan.',
        'Catat transaksi rutin lewat fitur Scan Struk agar proyeksi AI semakin akurat.',
      ],
    );
  }

  List<ScoreHistoryItem> getScoreHistory() {
    final now = DateTime.now();
    return [
      ScoreHistoryItem(
        id: 'scr_1',
        score: 78,
        createdAt: now.subtract(const Duration(days: 28)),
      ),
      ScoreHistoryItem(
        id: 'scr_2',
        score: 81,
        createdAt: now.subtract(const Duration(days: 14)),
      ),
      ScoreHistoryItem(
        id: 'scr_3',
        score: calculateHealthScore().overallScore,
        createdAt: now,
      ),
    ];
  }

  List<InsightModel> getInsights() => [
        InsightModel(
          id: 'ins_1',
          title: 'Pola Belanja Akhir Pekan Meningkat',
          description:
              'Rata-rata transaksi di hari Sabtu–Minggu lebih tinggi dibanding hari kerja, didominasi kategori Keinginan.',
          createdAt: DateTime.now().subtract(const Duration(hours: 6)),
        ),
        InsightModel(
          id: 'ins_2',
          title: 'Rasio Tabungan Terjaga Baik',
          description:
              'Alokasi dana darurat bulan ini sudah berjalan sesuai prinsip 50/30/20.',
          createdAt: DateTime.now().subtract(const Duration(days: 2)),
        ),
      ];

  List<AlertModel> getAlerts() => [
        AlertModel(
          id: 'alt_1',
          message:
              'Kategori Keinginan mulai mendekati batas anggaran bulanan. Tinjau ulang pembelian non-esensial minggu ini.',
          alertType: 'warning',
          createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        ),
      ];

  BehaviorPredictionModel getBehaviorPrediction() =>
      const BehaviorPredictionModel(
        riskLevel: 'low',
        spikeProbability: 0.26,
        recommendation:
            'Pola pengeluaran 7 hari terakhirmu masih terkendali. Tetap jaga batas belanja gaya hidup di akhir pekan agar tidak memicu lonjakan akhir bulan.',
        source: 'demo-dcn-preview',
      );

  OverspendingForecastModel getOverspendingForecast() {
    final budget = getLatestBudget();
    return OverspendingForecastModel(
      riskLevel: budget.usagePercent >= 85 ? 'high' : 'low',
      predictedAmount: budget.totalUsed * 1.18,
      budgetLimit: budget.totalLimit,
    );
  }

  OcrScanModel simulateReceiptScan() {
    final now = DateTime.now();
    return OcrScanModel(
      id: 'ocr_${now.millisecondsSinceEpoch}',
      status: 'completed',
      merchant: 'Kopi Kenangan',
      totalAmount: 48000,
      transactionDate:
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
      categoryGroup: 'Wants',
      categoryDetail: 'Kopi & Nongkrong',
      description: 'Kopi Kenangan (Kopi Susu Mantan, Roti Cokelat)',
      rawText: 'KOPI KENANGAN\n1x Kopi Susu Mantan 28.000\n1x Roti Cokelat 20.000\nTOTAL 48.000',
      confidence: 0.92,
      warnings: const ['Mode Demo: hasil ekstraksi disimulasikan secara lokal.'],
    );
  }
}
