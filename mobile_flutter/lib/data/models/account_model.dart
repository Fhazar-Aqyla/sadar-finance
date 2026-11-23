import '../../core/constants/bank_data.dart';

class AccountModel {
  final String id;
  final String name;
  final String accountNumber;
  final double balance;
  final String type;

  const AccountModel({
    required this.id,
    required this.name,
    required this.accountNumber,
    required this.balance,
    required this.type,
  });

  factory AccountModel.fromJson(Map<String, dynamic> json) {
    final name = (json['account_name'] ??
            json['accountName'] ??
            json['name'] ??
            'Akun')
        .toString();
    final explicitType = (json['account_type'] ?? json['type'])?.toString();
    return AccountModel(
      id: (json['account_id'] ?? json['id'] ?? '').toString(),
      name: name,
      accountNumber:
          (json['account_number'] ?? json['accountNumber'] ?? '').toString(),
      balance: _toDouble(json['balance']),
      type: (explicitType != null && explicitType.isNotEmpty)
          ? explicitType
          : BankData.inferAccountType(name),
    );
  }

  Map<String, dynamic> toJson() => {
        'account_id': id,
        'account_name': name,
        'account_number': accountNumber,
        'balance': balance,
        'type': type,
      };

  AccountModel copyWith({
    String? name,
    String? accountNumber,
    double? balance,
    String? type,
  }) {
    return AccountModel(
      id: id,
      name: name ?? this.name,
      accountNumber: accountNumber ?? this.accountNumber,
      balance: balance ?? this.balance,
      type: type ?? this.type,
    );
  }

  static double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}
