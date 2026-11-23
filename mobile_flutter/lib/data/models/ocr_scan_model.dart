import 'dart:convert';
import '../../core/constants/category_helpers.dart';

class OcrScanModel {
  final String id;
  final String status; // pending | processing | completed | failed
  final String? imageUrl;
  final String? merchant;
  final double? totalAmount;
  final String? transactionDate;
  final String? categoryGroup;
  final String? categoryDetail;
  final String? description;
  final String? rawText;
  final double? confidence;
  final List<String> warnings;

  const OcrScanModel({
    required this.id,
    required this.status,
    this.imageUrl,
    this.merchant,
    this.totalAmount,
    this.transactionDate,
    this.categoryGroup,
    this.categoryDetail,
    this.description,
    this.rawText,
    this.confidence,
    this.warnings = const [],
  });

  factory OcrScanModel.fromJson(Map<String, dynamic> json) {
    final rawParsed = json['parsed_data'] ?? json['parsedData'] ?? json['data'];
    Map<String, dynamic> parsed = {};
    if (rawParsed is Map<String, dynamic>) {
      parsed = rawParsed;
    } else if (rawParsed is String && rawParsed.isNotEmpty) {
      try {
        final decoded = jsonDecode(rawParsed);
        if (decoded is Map<String, dynamic>) parsed = decoded;
      } catch (_) {}
    }

    final nested = (parsed['data'] is Map<String, dynamic>)
        ? parsed['data'] as Map<String, dynamic>
        : parsed;

    final merchant = (nested['merchant'] ??
            nested['storeName'] ??
            nested['store_name'] ??
            nested['vendor'])
        ?.toString();

    final amountRaw =
        nested['total'] ?? nested['totalAmount'] ?? nested['amount'] ?? nested['grandTotal'];
    double? totalAmount;
    if (amountRaw is num) {
      totalAmount = amountRaw.toDouble();
    } else if (amountRaw != null) {
      final digits = amountRaw.toString().replaceAll(RegExp(r'[^0-9.]'), '');
      totalAmount = double.tryParse(digits);
    }

    final items = nested['items'];
    String? builtDesc;
    if (items is List && items.isNotEmpty) {
      final names = items
          .map((item) => item is Map ? (item['name'] ?? item['title'] ?? '').toString() : item.toString())
          .where((s) => s.isNotEmpty)
          .take(3)
          .toList();
      if (merchant != null && merchant.isNotEmpty && names.isNotEmpty) {
        builtDesc = '$merchant (${names.join(', ')})';
      } else if (names.isNotEmpty) {
        builtDesc = names.join(', ');
      }
    }
    builtDesc ??= (nested['description'] ?? merchant)?.toString();

    final rawCat = (nested['categoryGroup'] ??
            nested['category_group'] ??
            nested['category'])
        ?.toString();

    final warningsList = <String>[];
    if (nested['warnings'] is List) {
      for (final w in nested['warnings'] as List) {
        if (w.toString().isNotEmpty) warningsList.add(w.toString());
      }
    }

    return OcrScanModel(
      id: (json['ocr_id'] ?? json['ocrId'] ?? json['id'] ?? '').toString(),
      status: (json['status'] ?? 'completed').toString(),
      imageUrl: (json['image_url'] ?? json['imageUrl'])?.toString(),
      merchant: merchant,
      totalAmount: totalAmount,
      transactionDate:
          (nested['date'] ?? nested['transactionDate'] ?? nested['transaction_date'])
              ?.toString(),
      categoryGroup: rawCat != null ? CategoryHelpers.normalizeGroup(rawCat) : null,
      categoryDetail: (nested['categoryDetail'] ?? nested['category_detail'])?.toString(),
      description: builtDesc,
      rawText: (json['raw_text'] ?? json['rawText'] ?? parsed['rawText'])?.toString(),
      confidence: _toDouble(json['confidence']),
      warnings: warningsList,
    );
  }

  static double? _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    return double.tryParse(v?.toString() ?? '');
  }
}
