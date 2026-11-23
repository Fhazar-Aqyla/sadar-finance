class BudgetModel {
  final String id;
  final double needsAmount;
  final double wantsAmount;
  final double savingsAmount;
  final double needsUsed;
  final double wantsUsed;
  final double savingsUsed;
  final double limitAmount;

  const BudgetModel({
    required this.id,
    required this.needsAmount,
    required this.wantsAmount,
    required this.savingsAmount,
    this.needsUsed = 0,
    this.wantsUsed = 0,
    this.savingsUsed = 0,
    required this.limitAmount,
  });

  double get totalLimit =>
      limitAmount > 0 ? limitAmount : (needsAmount + wantsAmount + savingsAmount);

  double get totalUsed => needsUsed + wantsUsed + savingsUsed;

  double get remaining => totalLimit - totalUsed;

  double get usagePercent =>
      totalLimit > 0 ? (totalUsed / totalLimit * 100) : 0;

  factory BudgetModel.fromJson(Map<String, dynamic> json) {
    final needs = _firstNum([
      json['needs_budget'],
      json['needs_amount'],
      json['needsBudget'],
      json['needsAmount'],
    ]);
    final wants = _firstNum([
      json['wants_budget'],
      json['wants_amount'],
      json['wantsBudget'],
      json['wantsAmount'],
    ]);
    final savings = _firstNum([
      json['investment_budget'],
      json['savings_amount'],
      json['investment_amount'],
      json['savingsAmount'],
      json['investmentBudget'],
    ]);
    final limit = _firstNum([
      json['budget_limit'],
      json['limit_amount'],
      json['budgetLimit'],
      json['limitAmount'],
    ]);

    return BudgetModel(
      id: (json['budget_id'] ?? json['id'] ?? '').toString(),
      needsAmount: needs,
      wantsAmount: wants,
      savingsAmount: savings,
      needsUsed: _firstNum([json['needs_used'], json['needsUsed']]),
      wantsUsed: _firstNum([json['wants_used'], json['wantsUsed']]),
      savingsUsed: _firstNum([
        json['savings_used'],
        json['investment_used'],
        json['savingsUsed'],
      ]),
      limitAmount: limit > 0 ? limit : (needs + wants + savings),
    );
  }

  Map<String, dynamic> toJson() => {
        'budget_id': id,
        'needs_amount': needsAmount,
        'wants_amount': wantsAmount,
        'savings_amount': savingsAmount,
        'needs_used': needsUsed,
        'wants_used': wantsUsed,
        'savings_used': savingsUsed,
        'limit_amount': limitAmount,
      };

  static double _firstNum(List<dynamic> values) {
    for (final v in values) {
      if (v is num && v > 0) return v.toDouble();
      if (v != null) {
        final parsed = double.tryParse(v.toString());
        if (parsed != null && parsed > 0) return parsed;
      }
    }
    return 0;
  }
}
