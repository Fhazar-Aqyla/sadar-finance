/// Normalizes Indonesian Rupiah strings and translates legacy English/GMT alert text
String sanitizeIndonesianFinanceText(String raw) {
  if (raw.trim().isEmpty) return raw;
  var text = raw.trim();

  // Fix legacy English overspending alert with raw JS Date ("Sun Nov 01 2026 00:00:00 GMT+0000...")
  final approachingMatch = RegExp(
    r'You are approaching your budget limit for .*?Predicted:\s*Rp\s*([0-9.,]+),\s*Budget:\s*Rp\s*([0-9.,]+)',
    caseSensitive: false,
  ).firstMatch(text);
  if (approachingMatch != null) {
    final pred = approachingMatch
        .group(1)!
        .replaceAll(RegExp(r'[.,]+$'), '')
        .replaceAll(',', '.');
    final bud = approachingMatch
        .group(2)!
        .replaceAll(RegExp(r'[.,]+$'), '')
        .replaceAll(',', '.');
    return 'Pengeluaran bulan ini diprediksi mendekati batas anggaran. Prediksi: Rp $pred dari anggaran Rp $bud.';
  }

  final exceededMatch = RegExp(
    r'Predicted spending for .*?is\s*Rp\s*([0-9.,]+),\s*which exceeds your budget of\s*Rp\s*([0-9.,]+)\s*by\s*([0-9.]+)%',
    caseSensitive: false,
  ).firstMatch(text);
  if (exceededMatch != null) {
    final pred = exceededMatch.group(1)!.replaceAll(',', '.');
    final bud = exceededMatch.group(2)!.replaceAll(',', '.');
    final pct = exceededMatch.group(3)!;
    return 'Prediksi pengeluaran bulan ini sebesar Rp $pred melampaui target anggaran Rp $bud (+$pct%).';
  }

  final catExceedMatch = RegExp(
    r'^([A-Za-z &]+)\s+spending\s*\(Rp\s*([0-9.,]+)\)\s*exceeds 30% of your budget',
    caseSensitive: false,
  ).firstMatch(text);
  if (catExceedMatch != null) {
    final cat = catExceedMatch.group(1)!.trim();
    final amt = catExceedMatch.group(2)!.replaceAll(',', '.');
    return 'Pengeluaran kategori $cat (Rp $amt) melewati 30% dari batas anggaran bulanan Anda.';
  }

  // Strip any leftover raw JS GMT timezone dump if present
  text = text.replaceAll(
    RegExp(r'\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+[A-Za-z]{3}\s+\d{2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT[^\s.]*\s*(\([^)]*\))?'),
    'periode ini',
  );

  // Normalize "Rp28,000" or "Rp 123,200" (comma thousand separator) into "Rp 28.000" / "Rp 123.200"
  text = text.replaceAllMapped(
    RegExp(r'Rp\s?(\d{1,3}(?:,\d{3})+)'),
    (m) => 'Rp ${m.group(1)!.replaceAll(',', '.')}',
  );

  return text;
}

class InsightModel {
  final String id;
  final String title;
  final String description;
  final DateTime createdAt;

  const InsightModel({
    required this.id,
    required this.title,
    required this.description,
    required this.createdAt,
  });

  factory InsightModel.fromJson(Map<String, dynamic> json) {
    return InsightModel(
      id: (json['insight_id'] ?? json['id'] ?? '').toString(),
      title: sanitizeIndonesianFinanceText(
        (json['title'] ?? 'Insight Keuangan').toString(),
      ),
      description: sanitizeIndonesianFinanceText(
        (json['description'] ?? '').toString(),
      ),
      createdAt:
          DateTime.tryParse((json['created_at'] ?? '').toString()) ??
              DateTime.now(),
    );
  }
  Map<String, dynamic> toJson() => {
        'insight_id': id,
        'title': title,
        'description': description,
        'created_at': createdAt.toIso8601String(),
      };
}

class AlertModel {
  final String id;
  final String message;
  final String alertType; // overspending | budget_exceeded | anomaly | reminder | info
  final DateTime createdAt;

  const AlertModel({
    required this.id,
    required this.message,
    required this.alertType,
    required this.createdAt,
  });

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: (json['alert_id'] ?? json['id'] ?? '').toString(),
      message: sanitizeIndonesianFinanceText(
        (json['message'] ?? '').toString(),
      ),
      alertType:
          (json['alert_type'] ?? json['level'] ?? json['alertType'] ?? 'info')
              .toString(),
      createdAt:
          DateTime.tryParse((json['created_at'] ?? '').toString()) ??
              DateTime.now(),
    );
  }
  Map<String, dynamic> toJson() => {
        'alert_id': id,
        'message': message,
        'alert_type': alertType,
        'created_at': createdAt.toIso8601String(),
      };
}

class ScoreHistoryItem {
  final String id;
  final int score;
  final DateTime createdAt;

  const ScoreHistoryItem({
    required this.id,
    required this.score,
    required this.createdAt,
  });

  factory ScoreHistoryItem.fromJson(Map<String, dynamic> json) {
    return ScoreHistoryItem(
      id: (json['score_id'] ?? json['id'] ?? '').toString(),
      score: int.tryParse((json['score'] ?? '0').toString()) ?? 0,
      createdAt:
          DateTime.tryParse((json['created_at'] ?? '').toString()) ??
              DateTime.now(),
    );
  }
  Map<String, dynamic> toJson() => {
        'score_id': id,
        'score': score,
        'created_at': createdAt.toIso8601String(),
      };
}

class HealthScoreResult {
  final int overallScore;
  final String status;
  final int savingsScore;
  final int expenseScore;
  final int budgetScore;
  final int consistencyScore;
  final double savingsRate;
  final double expenseRatio;
  final double budgetUsage;
  final double needsRatio;
  final double wantsRatio;
  final double savingsRatio;
  final double totalIncome;
  final double totalExpense;
  final double budgetLimit;
  final List<String> insights;
  final List<String> recommendations;

  const HealthScoreResult({
    required this.overallScore,
    required this.status,
    required this.savingsScore,
    required this.expenseScore,
    required this.budgetScore,
    required this.consistencyScore,
    required this.savingsRate,
    required this.expenseRatio,
    required this.budgetUsage,
    required this.needsRatio,
    required this.wantsRatio,
    required this.savingsRatio,
    required this.totalIncome,
    required this.totalExpense,
    required this.budgetLimit,
    required this.insights,
    required this.recommendations,
  });

  static String statusForScore(int score) {
    if (score <= 40) return 'Perlu Perhatian';
    if (score <= 70) return 'Cukup Sehat';
    return 'Sehat';
  }

  factory HealthScoreResult.fromJson(Map<String, dynamic> json) {
    final breakdown = (json['breakdown'] is Map<String, dynamic>)
        ? json['breakdown'] as Map<String, dynamic>
        : <String, dynamic>{};
    final ratios = (json['ratios'] is Map<String, dynamic>)
        ? json['ratios'] as Map<String, dynamic>
        : <String, dynamic>{};
    final financials = (json['financials'] is Map<String, dynamic>)
        ? json['financials'] as Map<String, dynamic>
        : <String, dynamic>{};
    final scoreObj = json['score'];

    final overall = _toInt(
      breakdown['overallScore'] ??
          (scoreObj is Map ? scoreObj['score'] : scoreObj) ??
          0,
    );

    return HealthScoreResult(
      overallScore: overall,
      status: (json['status'] ?? statusForScore(overall)).toString(),
      savingsScore: _toInt(breakdown['savingsScore']),
      expenseScore: _toInt(breakdown['expenseScore']),
      budgetScore: _toInt(breakdown['budgetScore']),
      consistencyScore: _toInt(breakdown['consistencyScore']),
      savingsRate: _toDouble(ratios['savingsRate']),
      expenseRatio: _toDouble(ratios['expenseRatio']),
      budgetUsage: _toDouble(ratios['budgetUsage']),
      needsRatio: _toDouble(ratios['needsRatio']),
      wantsRatio: _toDouble(ratios['wantsRatio']),
      savingsRatio: _toDouble(ratios['savingsRatio']),
      totalIncome: _toDouble(financials['totalIncome']),
      totalExpense: _toDouble(financials['totalExpense']),
      budgetLimit: _toDouble(financials['budgetLimit']),
      insights: _toStringList(json['insights']),
      recommendations: _toStringList(json['recommendations']),
    );
  }

  Map<String, dynamic> toJson() => {
        'status': status,
        'breakdown': {
          'overallScore': overallScore,
          'savingsScore': savingsScore,
          'expenseScore': expenseScore,
          'budgetScore': budgetScore,
          'consistencyScore': consistencyScore,
        },
        'ratios': {
          'savingsRate': savingsRate,
          'expenseRatio': expenseRatio,
          'budgetUsage': budgetUsage,
          'needsRatio': needsRatio,
          'wantsRatio': wantsRatio,
          'savingsRatio': savingsRatio,
        },
        'financials': {
          'totalIncome': totalIncome,
          'totalExpense': totalExpense,
          'budgetLimit': budgetLimit,
        },
        'insights': insights,
        'recommendations': recommendations,
      };

  static int _toInt(dynamic v) {
    if (v is num) return v.round();
    return double.tryParse(v?.toString() ?? '')?.round() ?? 0;
  }

  static double _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    return double.tryParse(v?.toString() ?? '') ?? 0;
  }

  static List<String> _toStringList(dynamic v) {
    if (v is List) {
      return v
          .map((e) => sanitizeIndonesianFinanceText(e.toString()))
          .where((s) => s.isNotEmpty)
          .toList();
    }
    return const [];
  }
}

class BehaviorPredictionModel {
  final String riskLevel; // low | medium | high
  final double? spikeProbability;
  final String recommendation;
  final String source;

  const BehaviorPredictionModel({
    required this.riskLevel,
    this.spikeProbability,
    required this.recommendation,
    this.source = 'auto',
  });

  factory BehaviorPredictionModel.fromJson(Map<String, dynamic> json) {
    final rawProb = json['spikeProbability'] ??
        json['spike_probability'] ??
        json['probability'];
    double? prob;
    if (rawProb is num) {
      prob = rawProb > 1 ? rawProb / 100.0 : rawProb.toDouble();
    } else if (rawProb != null) {
      final parsed = double.tryParse(rawProb.toString());
      if (parsed != null) prob = parsed > 1 ? parsed / 100.0 : parsed;
    }

    return BehaviorPredictionModel(
      riskLevel:
          (json['riskLevel'] ?? json['risk_level'] ?? json['risk'] ?? 'medium')
              .toString()
              .toLowerCase(),
      spikeProbability: prob,
      recommendation: sanitizeIndonesianFinanceText(
        (json['recommendation'] ??
                json['message'] ??
                json['insight'] ??
                'Pantau pola pengeluaran mingguan agar tetap seimbang.')
            .toString(),
      ),
      source: (json['source'] ?? 'ai-service').toString(),
    );
  }
  Map<String, dynamic> toJson() => {
        'riskLevel': riskLevel,
        'spikeProbability': spikeProbability,
        'recommendation': recommendation,
        'source': source,
      };
}

class OverspendingForecastModel {
  final String riskLevel;
  final double predictedAmount;
  final double budgetLimit;

  const OverspendingForecastModel({
    required this.riskLevel,
    required this.predictedAmount,
    required this.budgetLimit,
  });

  factory OverspendingForecastModel.fromJson(Map<String, dynamic> json) {
    return OverspendingForecastModel(
      riskLevel: (json['riskLevel'] ?? json['risk_level'] ?? 'low')
          .toString()
          .toLowerCase(),
      predictedAmount: _toDouble(json['predictedAmount'] ?? json['predicted_amount']),
      budgetLimit: _toDouble(json['budgetLimit'] ?? json['budget_limit']),
    );
  }

  Map<String, dynamic> toJson() => {
        'riskLevel': riskLevel,
        'predictedAmount': predictedAmount,
        'budgetLimit': budgetLimit,
      };

  static double _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    return double.tryParse(v?.toString() ?? '') ?? 0;
  }
}
