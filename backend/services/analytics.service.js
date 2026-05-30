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
  async categorize(userId, { text, transactionId, merchant, amount, items }) {
    try {
      const result = await aiClient.categorize({ text, transactionId, merchant, amount, items });
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

  async predictBehavior(_userId, payload) {
    try {
      const result = await aiClient.predictBehavior(payload);
      return {
        ...result,
        source: 'ai-service',
      };
    } catch (err) {
      return {
        ...this._predictBehaviorWithRules(payload),
        source: 'rule-based-fallback',
        fallbackReason: err.message,
      };
    }
  }

  _predictBehaviorWithRules(payload) {
    const amount = Number(payload.amount || 0);
    const categoryPrimary = payload.categoryPrimary || payload.categoryGroup || 'Wants';
    const rolling7dSpending = Number(payload.rolling7dSpending || amount);
    const ratio = rolling7dSpending > 0 ? amount / rolling7dSpending : 0;
    const spikeProbability = Math.max(
      0.1,
      Math.min(0.9, amount >= 1000000 ? 0.78 : amount >= 500000 || ratio >= 0.5 ? 0.55 : 0.24)
    );
    const riskLevel = spikeProbability >= 0.7 ? 'high' : spikeProbability >= 0.4 ? 'medium' : 'low';

    return {
      spikeProbability: parseFloat(spikeProbability.toFixed(4)),
      predictedSpike: spikeProbability >= 0.5,
      riskLevel,
      categoryPrimary,
      budgetBucket: {
        name: categoryPrimary,
        recommendedAllocation: categoryPrimary === 'Needs' ? 0.5 : categoryPrimary === 'Investment' ? 0.2 : 0.3,
      },
      modelName: 'rule-based-behavior',
      modelVersion: 'v1.0-behavior-fallback',
      recommendation:
        riskLevel === 'high'
          ? 'Transaksi ini terlihat lebih tinggi dari pola normal. Cek ulang prioritas dan sisa budget sebelum melanjutkan.'
          : 'Risiko transaksi masih terkendali. Tetap pantau pola harian agar pengeluaran tidak melonjak.',
    };
  }

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

    let aiPrediction = null;
    try {
      aiPrediction = await aiClient.predictOverspending({
        month,
        budgetLimit: effectiveBudget,
        predictedAmount,
        expenseTrend: trend,
        categorySummary,
      });
    } catch (_err) {
      aiPrediction = null;
    }

    const finalPredictedAmount = aiPrediction?.predictedAmount || predictedAmount;

    // Determine risk level
    let riskLevel = aiPrediction?.riskLevel || 'low';
    const ratio = effectiveBudget > 0 ? finalPredictedAmount / effectiveBudget : 0;
    if (!aiPrediction) {
      if (ratio > 1.3) riskLevel = 'critical';
      else if (ratio > 1.1) riskLevel = 'high';
      else if (ratio > 0.9) riskLevel = 'medium';
    }

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
        message: `You are approaching your budget limit for ${month}. Predicted: Rp ${finalPredictedAmount.toLocaleString()}, Budget: Rp ${effectiveBudget.toLocaleString()}.`,
        alertType: 'reminder',
      });
    }

    // Save alerts to DB
    const savedAlerts = alertEntries.length > 0
      ? await analyticsRepository.createManyAlerts(userId, alertEntries)
      : [];

    return {
      predictedMonth: month,
      predictedAmount: finalPredictedAmount,
      budgetLimit: effectiveBudget,
      riskLevel,
      willOverspend: aiPrediction?.willOverspend ?? finalPredictedAmount > effectiveBudget,
      overspendingProbability: aiPrediction?.overspendingProbability ?? Math.min(Math.max(ratio - 0.5, 0), 1),
      estimatedOverspendingAmount:
        aiPrediction?.estimatedOverspendingAmount ?? Math.max(finalPredictedAmount - effectiveBudget, 0),
      recommendation: aiPrediction?.recommendation || null,
      categoryRisks,
      alerts: savedAlerts,
      modelName: aiPrediction?.modelName || 'moving-average-fallback',
      modelVersion: aiPrediction?.modelVersion || 'v1.0-moving-average',
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Financial Health Score → writes to scores table
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async calculateHealthScore(userId, { periodMonths = 3, period = '3m' }) {
    const endDate = new Date();
    const periodConfig = this._resolveHealthScorePeriod(period, periodMonths);
    const startDate = new Date(endDate);
    if (periodConfig.isAllTime) {
      startDate.setFullYear(1970, 0, 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (periodConfig.days) {
      startDate.setDate(startDate.getDate() - periodConfig.days);
    } else {
      startDate.setMonth(startDate.getMonth() - periodConfig.months);
    }

    const [totalExpenseData, totalIncomeData, expenseTrend, incomeTrend, latestBudget, expenseSummary] = await Promise.all([
      transactionRepository.getTotalExpense(userId, startDate.toISOString(), endDate.toISOString()),
      incomeRepository.getTotalIncome(userId, startDate.toISOString(), endDate.toISOString()),
      transactionRepository.getMonthlyExpenseTrend(userId, periodConfig.trendMonths),
      incomeRepository.getMonthlyIncomeTrend(userId, periodConfig.trendMonths),
      analyticsRepository.getLatestBudget(userId),
      transactionRepository.getSummary(userId, startDate.toISOString(), endDate.toISOString()),
    ]);

    const totalIncome = parseFloat(totalIncomeData.total);
    const totalExpense = parseFloat(totalExpenseData.total);
    const transactionCount = parseInt(totalExpenseData.count || 0, 10);
    const incomeCount = parseInt(totalIncomeData.count || 0, 10);
    const netSavings = totalIncome - totalExpense;
    const budgetLimit = latestBudget
      ? parseFloat(latestBudget.limit_amount || 0)
      : totalIncome;

    const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

    const getStatus = (score) => {
      if (score <= 40) return 'Perlu Perhatian';
      if (score <= 70) return 'Cukup Sehat';
      return 'Sehat';
    };

    const toPrimaryBucket = (categoryGroup) => {
      const text = String(categoryGroup || '').toLowerCase();
      if (/tagihan|makanan|transport|kesehatan|pendidikan|sewa|listrik|air|internet|obat|pulsa|food|dining|groceries|beverage|utility|utilities|bill|health|education/.test(text)) return 'needs';
      if (/tabungan|invest|dana darurat|saving|saham|reksadana|deposito|investment/.test(text)) return 'savings';
      return 'wants';
    };

    const hasIncome = totalIncome > 0;
    const expenseRatio = hasIncome ? totalExpense / totalIncome : totalExpense > 0 ? 1.2 : 0;
    const savingsRate = hasIncome ? netSavings / totalIncome : 0;
    const budgetUsage = budgetLimit > 0 ? totalExpense / budgetLimit : 0;

    const expenseScore = !hasIncome
      ? 0
      : expenseRatio <= 0.7
      ? 100
      : expenseRatio <= 1
        ? clampScore(100 - ((expenseRatio - 0.7) / 0.3) * 50)
        : clampScore(50 - ((expenseRatio - 1) / 0.3) * 50);

    const savingsScore = !hasIncome
      ? 0
      : savingsRate >= 0.2
      ? 100
      : clampScore((Math.max(savingsRate, 0) / 0.2) * 100);

    const budgetScore = budgetLimit <= 0
      ? 0
      : budgetUsage <= 0.8
      ? 100
      : budgetUsage <= 1
        ? clampScore(100 - ((budgetUsage - 0.8) / 0.2) * 40)
        : clampScore(60 - ((budgetUsage - 1) / 0.3) * 60);

    const monthsWithData = new Set([
      ...expenseTrend.map((t) => new Date(t.month).toISOString().slice(0, 7)),
      ...incomeTrend.map((t) => new Date(t.month).toISOString().slice(0, 7)),
    ]).size;
    const consistencyScore = Math.min(100, Math.round((monthsWithData / periodConfig.consistencyMonths) * 100));

    const overallScore = Math.round(
      savingsScore * 0.35 +
      expenseScore * 0.30 +
      budgetScore * 0.25 +
      consistencyScore * 0.10
    );

    const savedScore = await analyticsRepository.createScore(userId, overallScore);

    const allocationTotals = expenseSummary.reduce((result, row) => {
      const bucket = toPrimaryBucket(row.category_group);
      result[bucket] += parseFloat(row.total || 0);
      return result;
    }, { needs: 0, wants: 0, savings: 0 });

    const needsRatio = totalIncome > 0 ? allocationTotals.needs / totalIncome : 0;
    const wantsRatio = totalIncome > 0 ? allocationTotals.wants / totalIncome : 0;
    const savingsRatio = totalIncome > 0
      ? Math.max(allocationTotals.savings, Math.max(netSavings, 0)) / totalIncome
      : 0;

    const insights = [
      totalIncome > 0
        ? `Pengeluaran memakai ${(expenseRatio * 100).toFixed(1)}% dari pemasukan pada periode ini.`
        : 'Belum ada pemasukan tercatat pada periode ini, jadi skor belum bisa membaca rasio pemasukan secara penuh.',
      budgetLimit > 0
        ? `Anggaran terpakai ${(budgetUsage * 100).toFixed(1)}% dari batas yang tersedia.`
        : 'Anggaran belum tersedia, skor memakai pemasukan sebagai batas pembanding sementara.',
      savingsRate >= 0.2
        ? 'Rasio tabungan sudah memenuhi target minimal 20%.'
        : 'Rasio tabungan belum mencapai target 20%.',
    ];

    const recommendations = [];
    if (overallScore <= 40) recommendations.push('Prioritaskan kebutuhan utama dan tunda pengeluaran keinginan sampai rasio pengeluaran turun.');
    if (expenseRatio > 0.7) recommendations.push('Usahakan total pengeluaran berada di bawah 70% dari pemasukan agar ruang tabungan lebih aman.');
    if (budgetUsage >= 0.8) recommendations.push('Anggaran sudah mendekati batas, cek kategori terbesar sebelum menambah transaksi baru.');
    if (savingsScore < 100) recommendations.push('Sisihkan minimal 20% pemasukan untuk tabungan, dana darurat, atau investasi.');
    if (consistencyScore < 60) {
      recommendations.push('Catat transaksi dan pemasukan lebih rutin agar skor makin akurat.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Kondisi keuangan cukup sehat. Pertahankan alokasi 50/30/20 dan tinjau anggaran mingguan.');
    }

    return {
      score: savedScore,
      status: getStatus(overallScore),
      breakdown: {
        overallScore,
        savingsScore,
        expenseScore,
        budgetScore,
        consistencyScore,
      },
      ratios: {
        savingsRate: parseFloat(savingsRate.toFixed(4)),
        expenseRatio: parseFloat(expenseRatio.toFixed(4)),
        budgetUsage: parseFloat(budgetUsage.toFixed(4)),
        needsRatio: parseFloat(needsRatio.toFixed(4)),
        wantsRatio: parseFloat(wantsRatio.toFixed(4)),
        savingsRatio: parseFloat(savingsRatio.toFixed(4)),
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        key: periodConfig.key,
        label: periodConfig.label,
        months: periodConfig.months,
        days: periodConfig.days,
        isAllTime: periodConfig.isAllTime,
      },
      financials: {
        totalIncome,
        totalExpense,
        netSavings,
        budgetLimit,
        transactionCount,
        incomeCount,
      },
      insights,
      recommendations,
    };
  }

  _resolveHealthScorePeriod(period, periodMonths) {
    const configs = {
      '2w': { key: '2w', label: '2 Minggu', days: 14, months: 1, trendMonths: 1, consistencyMonths: 1 },
      '1m': { key: '1m', label: '1 Bulan', months: 1, trendMonths: 1, consistencyMonths: 1 },
      '3m': { key: '3m', label: '3 Bulan', months: 3, trendMonths: 3, consistencyMonths: 3 },
      '6m': { key: '6m', label: '6 Bulan', months: 6, trendMonths: 6, consistencyMonths: 6 },
      '1y': { key: '1y', label: '1 Tahun', months: 12, trendMonths: 12, consistencyMonths: 12 },
      all: { key: 'all', label: 'Seluruh Data', months: null, trendMonths: 24, consistencyMonths: 12, isAllTime: true },
    };

    if (configs[period]) return configs[period];

    const months = Math.max(1, Math.min(24, parseInt(periodMonths, 10) || 3));
    return {
      key: `${months}m`,
      label: `${months} Bulan`,
      months,
      trendMonths: months,
      consistencyMonths: months,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Budget Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async createBudget(userId, data) {
    return analyticsRepository.createBudget(userId, data);
  }

  async getLatestBudget(userId) {
    const budget = await analyticsRepository.getLatestBudget(userId);
    if (!budget) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const summary = await transactionRepository.getSummary(userId, startOfMonth, endOfMonth);

    const toPrimaryBucket = (categoryGroup) => {
      const text = String(categoryGroup || '').toLowerCase();
      if (/tagihan|makanan|transport|kesehatan|pendidikan|sewa|listrik|air|internet|obat|pulsa|food|dining|groceries|beverage|utility|utilities|bill|health|education/.test(text)) return 'needs';
      if (/tabungan|invest|dana darurat|saving|saham|reksadana|deposito|investment/.test(text)) return 'savings';
      return 'wants';
    };

    let needsUsed = 0;
    let wantsUsed = 0;
    let savingsUsed = 0;

    for (const row of summary) {
      const bucket = toPrimaryBucket(row.category_group);
      const total = parseFloat(row.total || 0);
      if (bucket === 'needs') {
        needsUsed += total;
      } else if (bucket === 'savings') {
        savingsUsed += total;
      } else {
        wantsUsed += total;
      }
    }

    return {
      ...budget,
      needs_used: needsUsed,
      wants_used: wantsUsed,
      savings_used: savingsUsed,
    };
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
