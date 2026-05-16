/**
 * Analytics Service — Business logic for AI-powered analytics.
 * Writes results to ERD tables: budgets, insights, alerts, scores
 */

const transactionRepository = require('../repositories/transaction.repository');
const incomeRepository = require('../repositories/income.repository');
const analyticsRepository = require('../repositories/analytics.repository');
const aiClient = require('./aiClient.service');

class AnalyticsService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AI Categorization
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Categorize a transaction description using AI.
   */
  async categorize(userId, { text, transactionId }) {
    try {
      const result = await aiClient.categorize({ text, transactionId });
      return {
        ...result,
        source: 'ai-service',
      };
    } catch (err) {
      return {
        ...this._categorizeWithRules(text, transactionId),
        source: 'rule-based-fallback',
        fallbackReason: err.message,
      };
    }
  }

  _categorizeWithRules(text, transactionId) {
    // Simulated AI categorization based on keywords
    const categoryMap = {
      'food|makan|resto|cafe|coffee|indomaret|alfamart|warung': 'Food & Dining',
      'grab|gojek|uber|taxi|bensin|fuel|parkir|toll|ojol': 'Transportation',
      'beli|shop|toko|mall|online|shopee|tokopedia': 'Shopping',
      'movie|bioskop|netflix|spotify|game|hiburan': 'Entertainment',
      'listrik|air|internet|pulsa|token|wifi|pdam': 'Bills & Utilities',
      'rumah sakit|dokter|obat|apotek|health|klinik': 'Healthcare',
      'kuliah|buku|course|sekolah|kursus|udemy': 'Education',
      'gaji|salary|freelance|bonus|transfer masuk': 'Salary',
      'invest|saham|reksadana|crypto|deposito': 'Investment',
    };

    let predictedCategory = 'Other';
    let confidence = 0.5;
    const lowerText = text.toLowerCase();

    for (const [keywords, category] of Object.entries(categoryMap)) {
      const pattern = new RegExp(keywords, 'i');
      if (pattern.test(lowerText)) {
        predictedCategory = category;
        confidence = 0.85 + Math.random() * 0.1;
        break;
      }
    }

    return {
      inputText: text,
      predictedCategory,
      confidence: parseFloat(confidence.toFixed(4)),
      modelVersion: 'v1.0-keyword-baseline',
      transactionId: transactionId || null,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Behavior Analysis → writes to insights table
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async analyzeBehavior(userId, { periodStart, periodEnd }) {
    const [expenseSummary, totalExpenseData, totalIncomeData] = await Promise.all([
      transactionRepository.getSummary(userId, periodStart, periodEnd),
      transactionRepository.getTotalExpense(userId, periodStart, periodEnd),
      incomeRepository.getTotalIncome(userId, periodStart, periodEnd),
    ]);

    const totalIncome = parseFloat(totalIncomeData.total);
    const totalExpense = parseFloat(totalExpenseData.total);

    const savingsRate = totalIncome > 0
      ? parseFloat(((totalIncome - totalExpense) / totalIncome * 100).toFixed(2))
      : 0;

    // Determine spending trend
    let spendingTrend = 'stable';
    if (savingsRate > 30) spendingTrend = 'frugal';
    else if (savingsRate > 10) spendingTrend = 'balanced';
    else if (savingsRate > 0) spendingTrend = 'moderate';
    else spendingTrend = 'overspending';

    // Generate insights and save to insights table
    const insightEntries = [];

    insightEntries.push({
      title: `Spending Trend: ${spendingTrend.charAt(0).toUpperCase() + spendingTrend.slice(1)}`,
      description: `During ${periodStart} to ${periodEnd}, your savings rate was ${savingsRate}%. Total income: Rp ${totalIncome.toLocaleString()}, Total expenses: Rp ${totalExpense.toLocaleString()}.`,
    });

    if (expenseSummary.length > 0) {
      const topCategory = expenseSummary[0];
      const percentage = totalExpense > 0
        ? ((parseFloat(topCategory.total) / totalExpense) * 100).toFixed(1)
        : 0;
      insightEntries.push({
        title: `Top Category: ${topCategory.category_group || 'Uncategorized'}`,
        description: `${topCategory.category_group || 'Uncategorized'} accounts for ${percentage}% of your total expenses (Rp ${parseFloat(topCategory.total).toLocaleString()}).`,
      });
    }

    if (spendingTrend === 'overspending') {
      insightEntries.push({
        title: 'Overspending Detected',
        description: 'Your expenses exceed your income. Consider reviewing non-essential spending.',
      });
    } else if (savingsRate > 30) {
      insightEntries.push({
        title: 'Excellent Savings Rate',
        description: `You saved ${savingsRate}% of your income. Great financial discipline!`,
      });
    }

    const topCategories = expenseSummary.slice(0, 5).map((c) => ({
      categoryGroup: c.category_group || 'Uncategorized',
      total: parseFloat(c.total),
      count: c.count,
      percentage: totalExpense > 0
        ? parseFloat((parseFloat(c.total) / totalExpense * 100).toFixed(1))
        : 0,
    }));

    let insightsToSave = insightEntries;
    let insightSource = 'rule-based';
    let insightModelVersion = 'v1.0-rule-based';
    let insightFallbackReason = null;

    try {
      const aiInsights = await aiClient.generateInsights({
        periodStart,
        periodEnd,
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        savingsRate,
        spendingTrend,
        topCategories,
      });

      if (aiInsights.insights.length > 0) {
        insightsToSave = aiInsights.insights;
        insightSource = 'ai-service';
        insightModelVersion = aiInsights.modelVersion;
      }
    } catch (err) {
      insightSource = 'rule-based-fallback';
      insightFallbackReason = err.message;
    }

    // Save insights to DB
    const savedInsights = await analyticsRepository.createManyInsights(userId, insightsToSave);

    return {
      periodStart,
      periodEnd,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate,
      spendingTrend,
      topCategories,
      insights: savedInsights,
      insightSource,
      insightModelVersion,
      ...(insightFallbackReason ? { insightFallbackReason } : {}),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Overspending Prediction → writes to alerts table
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async predictOverspending(userId, { month, budgetLimit }) {
    // Get last 3 months expense trend
    const trend = await transactionRepository.getMonthlyExpenseTrend(userId, 3);
    const categorySummary = await transactionRepository.getSummary(
      userId,
      new Date(new Date(month).setMonth(new Date(month).getMonth() - 3)).toISOString(),
      new Date(month).toISOString()
    );

    // Calculate average monthly expense
    const avgExpense = trend.length > 0
      ? trend.reduce((sum, t) => sum + parseFloat(t.total), 0) / trend.length
      : 0;

    // Simple prediction: average + 10% growth factor
    const predictedAmount = parseFloat((avgExpense * 1.1).toFixed(2));

    // Get budget limit from parameter or latest budget
    let effectiveBudget = budgetLimit;
    if (!effectiveBudget) {
      const latestBudget = await analyticsRepository.getLatestBudget(userId);
      effectiveBudget = latestBudget ? parseFloat(latestBudget.limit_amount) : avgExpense;
    }

    // Determine risk level
    let riskLevel = 'low';
    const ratio = effectiveBudget > 0 ? predictedAmount / effectiveBudget : 0;
    if (ratio > 1.3) riskLevel = 'critical';
    else if (ratio > 1.1) riskLevel = 'high';
    else if (ratio > 0.9) riskLevel = 'medium';

    // Generate alerts and save to alerts table
    const alertEntries = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      alertEntries.push({
        message: `⚠️ Predicted spending for ${month} is Rp ${predictedAmount.toLocaleString()}, which exceeds your budget of Rp ${effectiveBudget.toLocaleString()} by ${((ratio - 1) * 100).toFixed(0)}%.`,
        alertType: 'overspending',
      });
    }

    // Category-level risks
    const categoryRisks = categorySummary.slice(0, 5).map((c) => {
      const catTotal = parseFloat(c.total);
      const isHigh = catTotal > (effectiveBudget * 0.3);
      if (isHigh) {
        alertEntries.push({
          message: `${c.category_group || 'Uncategorized'} spending (Rp ${catTotal.toLocaleString()}) exceeds 30% of your budget.`,
          alertType: 'budget_exceeded',
        });
      }
      return {
        categoryGroup: c.category_group || 'Uncategorized',
        currentSpending: catTotal,
        riskLevel: isHigh ? 'high' : 'low',
      };
    });

    if (riskLevel === 'medium') {
      alertEntries.push({
        message: `You are approaching your budget limit for ${month}. Predicted: Rp ${predictedAmount.toLocaleString()}, Budget: Rp ${effectiveBudget.toLocaleString()}.`,
        alertType: 'reminder',
      });
    }

    // Save alerts to DB
    const savedAlerts = alertEntries.length > 0
      ? await analyticsRepository.createManyAlerts(userId, alertEntries)
      : [];

    return {
      predictedMonth: month,
      predictedAmount,
      budgetLimit: effectiveBudget,
      riskLevel,
      categoryRisks,
      alerts: savedAlerts,
      modelVersion: 'v1.0-moving-average',
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Financial Health Score → writes to scores table
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async calculateHealthScore(userId, { periodMonths = 3 }) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodMonths);

    const [totalExpenseData, totalIncomeData, expenseTrend, incomeTrend] = await Promise.all([
      transactionRepository.getTotalExpense(userId, startDate.toISOString(), endDate.toISOString()),
      incomeRepository.getTotalIncome(userId, startDate.toISOString(), endDate.toISOString()),
      transactionRepository.getMonthlyExpenseTrend(userId, periodMonths),
      incomeRepository.getMonthlyIncomeTrend(userId, periodMonths),
    ]);

    const totalIncome = parseFloat(totalIncomeData.total);
    const totalExpense = parseFloat(totalExpenseData.total);

    // Expense ratio score: lower expenses relative to income = better
    const expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 1;
    const expenseScore = Math.max(0, Math.min(100, Math.round((1 - expenseRatio) * 100 + 50)));

    // Savings rate score
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
    const savingsScore = Math.max(0, Math.min(100, Math.round(savingsRate * 200)));

    // Income consistency score
    const incomeScore = Math.min(100, incomeTrend.length > 0
      ? Math.round((incomeTrend.length / periodMonths) * 100)
      : 0);

    // Tracking consistency score
    const monthsWithData = new Set([
      ...expenseTrend.map((t) => new Date(t.month).toISOString().slice(0, 7)),
      ...incomeTrend.map((t) => new Date(t.month).toISOString().slice(0, 7)),
    ]).size;
    const consistencyScore = Math.min(100, Math.round((monthsWithData / periodMonths) * 100));

    // Weighted overall score
    const overallScore = Math.round(
      incomeScore * 0.25 +
      expenseScore * 0.25 +
      savingsScore * 0.30 +
      consistencyScore * 0.20
    );

    // Save to scores table
    const savedScore = await analyticsRepository.createScore(userId, overallScore);

    // Generate insight for the score
    const recommendations = [];
    if (overallScore < 50) {
      recommendations.push('Your financial health needs attention. Focus on building an emergency fund.');
    }
    if (savingsScore < 40) {
      recommendations.push('Try to save at least 20% of your income. Start with small, consistent amounts.');
    }
    if (consistencyScore < 60) {
      recommendations.push('Track your transactions more regularly for better insights.');
    }
    if (savingsRate > 0.3) {
      recommendations.push('Great savings rate! Consider investing surplus funds for long-term growth.');
    }

    return {
      score: savedScore,
      breakdown: {
        overallScore,
        incomeScore,
        expenseScore,
        savingsScore,
        consistencyScore,
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        months: periodMonths,
      },
      financials: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        savingsRate: parseFloat((savingsRate * 100).toFixed(2)),
      },
      recommendations,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Budget Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async createBudget(userId, data) {
    return analyticsRepository.createBudget(userId, data);
  }

  async getLatestBudget(userId) {
    return analyticsRepository.getLatestBudget(userId);
  }

  async getBudgetHistory(userId, limit) {
    return analyticsRepository.getBudgetHistory(userId, limit);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Read Operations
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getInsights(userId, pagination) {
    return analyticsRepository.getInsights(userId, pagination);
  }

  async getAlerts(userId, pagination) {
    return analyticsRepository.getAlerts(userId, pagination);
  }

  async getScoreHistory(userId, limit) {
    return analyticsRepository.getScoreHistory(userId, limit);
  }

  async getLatestScore(userId) {
    return analyticsRepository.getLatestScore(userId);
  }
}

module.exports = new AnalyticsService();
