import 'package:flutter/material.dart';

class CategoryHelpers {
  static const List<String> groups = ['Needs', 'Wants', 'Savings'];

  static const Map<String, String> groupLabels = {
    'Needs': 'Kebutuhan',
    'Wants': 'Keinginan',
    'Savings': 'Tabungan',
    'Other': 'Lainnya',
  };

  static const List<String> detailSuggestions = [
    'Makanan & Minuman',
    'Belanja Harian',
    'Transportasi',
    'Tagihan & Utilitas',
    'Kesehatan',
    'Pendidikan',
    'Hiburan',
    'Belanja Gaya Hidup',
    'Kopi & Nongkrong',
    'Tabungan',
    'Dana Darurat',
    'Investasi',
    'Lainnya',
  ];

  static const List<String> incomeSources = [
    'Gaji',
    'Freelance',
    'Bonus',
    'Usaha Sampingan',
    'Dividen / Bunga',
    'Hadiah',
    'Lainnya',
  ];

  static String normalizeGroup(String? raw) {
    final text = (raw ?? '').trim().toLowerCase();
    if (RegExp(r'tabungan|saving|savings|invest|dana darurat').hasMatch(text)) {
      return 'Savings';
    }
    if (RegExp(
      r'keinginan|wants|want|hiburan|entertainment|belanja|shopping|game|nonton|bioskop|liburan|travel|cafe|kopi|nongkrong|fashion',
    ).hasMatch(text)) {
      return 'Wants';
    }
    if (RegExp(
      r'kebutuhan|needs|need|makan|food|beverage|groceries|sembako|transport|tagihan|utilit|kesehatan|health|pendidikan|education|bills|listrik|parkir',
    ).hasMatch(text)) {
      return 'Needs';
    }
    if (text == 'other' || text == 'lainnya') return 'Other';
    return 'Needs';
  }

  static String labelForGroup(String? raw) {
    final normalized = normalizeGroup(raw);
    return groupLabels[normalized] ?? 'Kebutuhan';
  }

  static Color colorForGroup(String? raw) {
    switch (normalizeGroup(raw)) {
      case 'Needs':
        return const Color(0xFF2563EB);
      case 'Wants':
        return const Color(0xFF8B5CF6);
      case 'Savings':
        return const Color(0xFF10B981);
      default:
        return const Color(0xFF64748B);
    }
  }

  static IconData iconForGroup(String? raw) {
    switch (normalizeGroup(raw)) {
      case 'Needs':
        return Icons.shopping_bag_rounded;
      case 'Wants':
        return Icons.auto_awesome_rounded;
      case 'Savings':
        return Icons.savings_rounded;
      default:
        return Icons.receipt_long_rounded;
    }
  }
}
