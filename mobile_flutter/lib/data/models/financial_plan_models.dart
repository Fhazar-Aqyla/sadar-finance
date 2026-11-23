class SavingsGoalModel {
  final String id;
  final String title;
  final double targetAmount;
  final double currentAmount;
  final String category; // Dana Darurat | Gadget | Liburan | Investasi | Pendidikan | Lainnya
  final DateTime? targetDate;
  final DateTime createdAt;

  const SavingsGoalModel({
    required this.id,
    required this.title,
    required this.targetAmount,
    required this.currentAmount,
    this.category = 'Dana Darurat',
    this.targetDate,
    required this.createdAt,
  });

  double get progressRatio {
    if (targetAmount <= 0) return 0;
    return (currentAmount / targetAmount).clamp(0.0, 1.0);
  }

  int get progressPercent => (progressRatio * 100).round();

  double get remainingAmount =>
      (targetAmount - currentAmount).clamp(0.0, double.infinity);

  bool get isCompleted => targetAmount > 0 && currentAmount >= targetAmount;

  SavingsGoalModel copyWith({
    String? title,
    double? targetAmount,
    double? currentAmount,
    String? category,
    DateTime? targetDate,
  }) {
    return SavingsGoalModel(
      id: id,
      title: title ?? this.title,
      targetAmount: targetAmount ?? this.targetAmount,
      currentAmount: currentAmount ?? this.currentAmount,
      category: category ?? this.category,
      targetDate: targetDate ?? this.targetDate,
      createdAt: createdAt,
    );
  }

  factory SavingsGoalModel.fromJson(Map<String, dynamic> json) {
    return SavingsGoalModel(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? 'Target Tabungan').toString(),
      targetAmount: (json['targetAmount'] as num?)?.toDouble() ??
          double.tryParse((json['targetAmount'] ?? '0').toString()) ??
          0,
      currentAmount: (json['currentAmount'] as num?)?.toDouble() ??
          double.tryParse((json['currentAmount'] ?? '0').toString()) ??
          0,
      category: (json['category'] ?? 'Dana Darurat').toString(),
      targetDate: json['targetDate'] != null
          ? DateTime.tryParse(json['targetDate'].toString())
          : null,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'targetAmount': targetAmount,
        'currentAmount': currentAmount,
        'category': category,
        'targetDate': targetDate?.toIso8601String(),
        'createdAt': createdAt.toIso8601String(),
      };
}

class RecurringItemModel {
  final String id;
  final String title;
  final double amount;
  final bool isIncome;
  final String categoryGroup; // Needs | Wants | Savings | Income
  final String? accountId;
  final int dayOfMonth; // 1..31
  final String? lastPaidPeriod; // YYYY-MM
  final DateTime createdAt;

  const RecurringItemModel({
    required this.id,
    required this.title,
    required this.amount,
    this.isIncome = false,
    this.categoryGroup = 'Needs',
    this.accountId,
    this.dayOfMonth = 1,
    this.lastPaidPeriod,
    required this.createdAt,
  });

  static String periodKey(DateTime date) =>
      '${date.year}-${date.month.toString().padLeft(2, '0')}';

  bool isPaidFor(DateTime date) => lastPaidPeriod == periodKey(date);

  RecurringItemModel copyWith({
    String? title,
    double? amount,
    bool? isIncome,
    String? categoryGroup,
    String? accountId,
    int? dayOfMonth,
    String? lastPaidPeriod,
  }) {
    return RecurringItemModel(
      id: id,
      title: title ?? this.title,
      amount: amount ?? this.amount,
      isIncome: isIncome ?? this.isIncome,
      categoryGroup: categoryGroup ?? this.categoryGroup,
      accountId: accountId ?? this.accountId,
      dayOfMonth: dayOfMonth ?? this.dayOfMonth,
      lastPaidPeriod: lastPaidPeriod ?? this.lastPaidPeriod,
      createdAt: createdAt,
    );
  }

  factory RecurringItemModel.fromJson(Map<String, dynamic> json) {
    return RecurringItemModel(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? 'Tagihan Rutin').toString(),
      amount: (json['amount'] as num?)?.toDouble() ??
          double.tryParse((json['amount'] ?? '0').toString()) ??
          0,
      isIncome: json['isIncome'] == true,
      categoryGroup: (json['categoryGroup'] ?? 'Needs').toString(),
      accountId: json['accountId']?.toString(),
      dayOfMonth:
          (int.tryParse((json['dayOfMonth'] ?? '1').toString()) ?? 1).clamp(1, 31),
      lastPaidPeriod: json['lastPaidPeriod']?.toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'amount': amount,
        'isIncome': isIncome,
        'categoryGroup': categoryGroup,
        'accountId': accountId,
        'dayOfMonth': dayOfMonth,
        'lastPaidPeriod': lastPaidPeriod,
        'createdAt': createdAt.toIso8601String(),
      };
}

class TransferLogModel {
  final String id;
  final String fromAccountId;
  final String fromAccountName;
  final String toAccountId;
  final String toAccountName;
  final double amount;
  final String note;
  final DateTime date;

  const TransferLogModel({
    required this.id,
    required this.fromAccountId,
    required this.fromAccountName,
    required this.toAccountId,
    required this.toAccountName,
    required this.amount,
    this.note = '',
    required this.date,
  });

  factory TransferLogModel.fromJson(Map<String, dynamic> json) {
    return TransferLogModel(
      id: (json['id'] ?? '').toString(),
      fromAccountId: (json['fromAccountId'] ?? '').toString(),
      fromAccountName: (json['fromAccountName'] ?? '-').toString(),
      toAccountId: (json['toAccountId'] ?? '').toString(),
      toAccountName: (json['toAccountName'] ?? '-').toString(),
      amount: (json['amount'] as num?)?.toDouble() ??
          double.tryParse((json['amount'] ?? '0').toString()) ??
          0,
      note: (json['note'] ?? '').toString(),
      date: DateTime.tryParse((json['date'] ?? '').toString()) ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fromAccountId': fromAccountId,
        'fromAccountName': fromAccountName,
        'toAccountId': toAccountId,
        'toAccountName': toAccountName,
        'amount': amount,
        'note': note,
        'date': date.toIso8601String(),
      };
}
