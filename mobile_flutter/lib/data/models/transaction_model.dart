import '../../core/constants/category_helpers.dart';

class TransactionModel {
  final String id;
  final String? accountId;
  final String? accountName;
  final String categoryGroup; // Needs | Wants | Savings | Other
  final String? categoryDetail;
  final DateTime transactionDate;
  final String description;
  final String source; // manual | ocr
  final double amount;

  const TransactionModel({
    required this.id,
    this.accountId,
    this.accountName,
    required this.categoryGroup,
    this.categoryDetail,
    required this.transactionDate,
    required this.description,
    this.source = 'manual',
    required this.amount,
  });

  String get categoryLabel => CategoryHelpers.labelForGroup(categoryGroup);

  String get displayTitle {
    if (description.trim().isNotEmpty) return description.trim();
    if (categoryDetail != null && categoryDetail!.trim().isNotEmpty) {
      return categoryDetail!.trim();
    }
    return categoryLabel;
  }

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    final rawGroup = (json['category_group'] ??
            json['categoryGroup'] ??
            json['budget_group'] ??
            json['budgetGroup'] ??
            json['category'])
        ?.toString();
    final rawDetail = (json['category_detail'] ??
            json['categoryDetail'] ??
            json['category_name'] ??
            json['categoryName'])
        ?.toString();
    final rawDate = (json['transaction_date'] ??
            json['transactionDate'] ??
            json['date'] ??
            json['created_at'])
        ?.toString();

    return TransactionModel(
      id: (json['transaction_id'] ?? json['id'] ?? '').toString(),
      accountId: (json['account_id'] ?? json['accountId'])?.toString(),
      accountName: (json['account_name'] ?? json['accountName'])?.toString(),
      categoryGroup: CategoryHelpers.normalizeGroup(rawGroup ?? rawDetail),
      categoryDetail: rawDetail,
      transactionDate: DateTime.tryParse(rawDate ?? '') ?? DateTime.now(),
      description:
          (json['description'] ?? json['name'] ?? json['merchant'] ?? '')
              .toString(),
      source: (json['source'] ?? 'manual').toString(),
      amount: _toDouble(json['amount']),
    );
  }

  Map<String, dynamic> toJson() => {
        'transaction_id': id,
        'account_id': accountId,
        'account_name': accountName,
        'category_group': categoryGroup,
        'category_detail': categoryDetail,
        'transaction_date': transactionDate.toIso8601String(),
        'description': description,
        'source': source,
        'amount': amount,
      };

  static double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}
