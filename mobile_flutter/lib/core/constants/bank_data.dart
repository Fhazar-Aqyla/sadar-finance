import 'package:flutter/material.dart';

class FinancialInstitution {
  final String id;
  final String name;
  final String shortName;
  final String type; // 'Bank' | 'E-wallet' | 'Cash'
  final bool featured;

  const FinancialInstitution({
    required this.id,
    required this.name,
    required this.shortName,
    required this.type,
    this.featured = false,
  });

  IconData get icon {
    switch (type) {
      case 'E-wallet':
        return Icons.account_balance_wallet_rounded;
      case 'Cash':
        return Icons.payments_rounded;
      default:
        return Icons.account_balance_rounded;
    }
  }
}

class BankData {
  static const String typeBank = 'Bank';
  static const String typeEWallet = 'E-wallet';
  static const String typeCash = 'Cash';

  static const List<FinancialInstitution> institutions = [
    FinancialInstitution(
      id: 'dbs',
      name: 'Bank DBS Indonesia',
      shortName: 'DBS',
      type: typeBank,
      featured: true,
    ),
    FinancialInstitution(
      id: 'bca',
      name: 'Bank Central Asia (BCA)',
      shortName: 'BCA',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'mandiri',
      name: 'Bank Mandiri',
      shortName: 'Mandiri',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'bri',
      name: 'Bank Rakyat Indonesia (BRI)',
      shortName: 'BRI',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'bni',
      name: 'Bank Negara Indonesia (BNI)',
      shortName: 'BNI',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'bsi',
      name: 'Bank Syariah Indonesia (BSI)',
      shortName: 'BSI',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'cimb',
      name: 'CIMB Niaga',
      shortName: 'CIMB Niaga',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'btn',
      name: 'BTN',
      shortName: 'BTN',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'permata',
      name: 'Permata Bank',
      shortName: 'Permata',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'danamon',
      name: 'Danamon',
      shortName: 'Danamon',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'jago',
      name: 'Bank Jago',
      shortName: 'Jago',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'seabank',
      name: 'SeaBank',
      shortName: 'SeaBank',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'neobank',
      name: 'Neo Bank',
      shortName: 'Neo Bank',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'maybank',
      name: 'Maybank',
      shortName: 'Maybank',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'ocbc',
      name: 'OCBC',
      shortName: 'OCBC',
      type: typeBank,
    ),
    FinancialInstitution(
      id: 'gopay',
      name: 'GoPay',
      shortName: 'GoPay',
      type: typeEWallet,
    ),
    FinancialInstitution(
      id: 'ovo',
      name: 'OVO',
      shortName: 'OVO',
      type: typeEWallet,
    ),
    FinancialInstitution(
      id: 'dana',
      name: 'DANA',
      shortName: 'DANA',
      type: typeEWallet,
    ),
    FinancialInstitution(
      id: 'shopeepay',
      name: 'ShopeePay',
      shortName: 'ShopeePay',
      type: typeEWallet,
    ),
    FinancialInstitution(
      id: 'linkaja',
      name: 'LinkAja',
      shortName: 'LinkAja',
      type: typeEWallet,
    ),
    FinancialInstitution(
      id: 'cash',
      name: 'Tunai / Dompet Fisik',
      shortName: 'Tunai',
      type: typeCash,
    ),
  ];

  static String inferAccountType(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('tunai') ||
        lower.contains('cash') ||
        lower.contains('kas')) {
      return typeCash;
    }
    if (lower.contains('gopay') ||
        lower.contains('ovo') ||
        lower.contains('dana') ||
        lower.contains('shopee') ||
        lower.contains('linkaja') ||
        lower.contains('wallet')) {
      return typeEWallet;
    }
    return typeBank;
  }

  static IconData iconForAccount(String name, [String? explicitType]) {
    final type = explicitType ?? inferAccountType(name);
    switch (type) {
      case typeEWallet:
        return Icons.account_balance_wallet_rounded;
      case typeCash:
        return Icons.payments_rounded;
      default:
        return Icons.account_balance_rounded;
    }
  }
}
