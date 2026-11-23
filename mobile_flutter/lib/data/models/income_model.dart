class IncomeModel {
  final String id;
  final String? accountId;
  final String? accountName;
  final double amount;
  final DateTime incomeDate;
  final String source;

  const IncomeModel({
    required this.id,
    this.accountId,
    this.accountName,
    required this.amount,
    required this.incomeDate,
    required this.source,
  });

  factory IncomeModel.fromJson(Map<String, dynamic> json) {
    final rawDate =
        (json['income_date'] ?? json['incomeDate'] ?? json['date'] ?? json['created_at'])
            ?.toString();
    return IncomeModel(
      id: (json['income_id'] ?? json['id'] ?? '').toString(),
      accountId: (json['account_id'] ?? json['accountId'])?.toString(),
      accountName: (json['account_name'] ?? json['accountName'])?.toString(),
      amount: _toDouble(json['amount']),
      incomeDate: DateTime.tryParse(rawDate ?? '') ?? DateTime.now(),
      source: (json['source'] ?? 'Pemasukan').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'income_id': id,
        'account_id': accountId,
        'account_name': accountName,
        'amount': amount,
        'income_date': incomeDate.toIso8601String(),
        'source': source,
      };

  static double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}
