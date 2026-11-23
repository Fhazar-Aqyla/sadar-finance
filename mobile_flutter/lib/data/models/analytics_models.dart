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
      title: (json['title'] ?? 'Insight Keuangan').toString(),
      description: (json['description'] ?? '').toString(),
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
      message: (json['message'] ?? '').toString(),
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
      return v.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
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
      recommendation: (json['recommendation'] ??
              json['message'] ??
              json['insight'] ??
              'Pantau pola pengeluaran mingguan agar tetap seimbang.')
          .toString(),
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
