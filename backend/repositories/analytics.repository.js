/**
 * Analytics Repository — Data access for budget, insight, alert, score tables.
 * Matches ERD tables: budgets, insights, alerts, scores
 */

const { query } = require('../config/database');

class AnalyticsRepository {
  // ── Budget ────────────────────────────────────────────────
  async createBudget(userId, data) {
    const result = await query(
      `INSERT INTO budgets (
         user_id, income_id,
         needs_budget, wants_budget, investment_budget,
         income_amount, budget_limit, source, income_date,
         needs_amount, wants_amount, savings_amount, investment_amount,
         percentage, limit_amount
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $3, $4, $5, $5, $10, $7)
       RETURNING *`,
      [
        userId,
        data.incomeId || null,
        data.needsBudget,
        data.wantsBudget,
        data.investmentBudget,
        data.incomeAmount,
        data.budgetLimit,
        data.source || null,
        data.incomeDate || null,
        data.percentage || null,
      ]
    );
    return this._normalizeBudget(result.rows[0]);
  }

  async getLatestBudget(userId) {
    const result = await query(
      `SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return this._normalizeBudget(result.rows[0] || null);
  }

  async getBudgetHistory(userId, limit = 10) {
    const result = await query(
      `SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map((row) => this._normalizeBudget(row));
  }

  _normalizeBudget(row) {
    if (!row) return row;

    const needsBudget = row.needs_budget ?? row.needs_amount ?? '0';
    const wantsBudget = row.wants_budget ?? row.wants_amount ?? '0';
    const investmentBudget = row.investment_budget ?? row.investment_amount ?? row.savings_amount ?? '0';
    const budgetLimit = row.budget_limit ?? row.limit_amount ?? String(Number(needsBudget) + Number(wantsBudget) + Number(investmentBudget));

    return {
      ...row,
      needs_budget: needsBudget,
      wants_budget: wantsBudget,
      investment_budget: investmentBudget,
      investment_amount: row.investment_amount ?? investmentBudget,
      budget_limit: budgetLimit,
      needs_amount: row.needs_amount ?? needsBudget,
      wants_amount: row.wants_amount ?? wantsBudget,
      savings_amount: row.savings_amount ?? investmentBudget,
      limit_amount: row.limit_amount ?? budgetLimit,
      needsBudget,
      wantsBudget,
      investmentBudget,
      savingsAmount: row.savings_amount ?? investmentBudget,
      budgetLimit,
      limitAmount: row.limit_amount ?? budgetLimit,
      incomeId: row.income_id,
      incomeAmount: row.income_amount,
      incomeDate: row.income_date,
    };
  }

  // ── Insight ───────────────────────────────────────────────
  async createInsight(userId, { title, description }) {
    const result = await query(
      `INSERT INTO insights (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, title, description]
    );
    return result.rows[0];
  }

  async createManyInsights(userId, insights) {
    const results = [];
    for (const insight of insights) {
      const result = await query(
        `INSERT INTO insights (user_id, title, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, insight.title, insight.description]
      );
      results.push(result.rows[0]);
    }
    return results;
  }

  async getInsights(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countResult = await query(`SELECT COUNT(*) as total FROM insights WHERE user_id = $1`, [userId]);
    const dataResult = await query(
      `SELECT * FROM insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return { data: dataResult.rows, total: parseInt(countResult.rows[0].total, 10) };
  }

  // ── Alert ─────────────────────────────────────────────────
  async createAlert(userId, { message, alertType }) {
    const result = await query(
      `INSERT INTO alerts (user_id, message, alert_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, message, alertType || 'info']
    );
    return result.rows[0];
  }

  async createManyAlerts(userId, alerts) {
    const results = [];
    for (const alert of alerts) {
      const result = await query(
        `INSERT INTO alerts (user_id, message, alert_type)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, alert.message, alert.alertType || 'info']
      );
      results.push(result.rows[0]);
    }
    return results;
  }

  async getAlerts(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countResult = await query(`SELECT COUNT(*) as total FROM alerts WHERE user_id = $1`, [userId]);
    const dataResult = await query(
      `SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return { data: dataResult.rows, total: parseInt(countResult.rows[0].total, 10) };
  }

  // ── Score ─────────────────────────────────────────────────
  async createScore(userId, score) {
    const result = await query(
      `INSERT INTO scores (user_id, score)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, score]
    );
    return result.rows[0];
  }

  async getLatestScore(userId) {
    const result = await query(
      `SELECT * FROM scores WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async getScoreHistory(userId, limit = 10) {
    const result = await query(
      `SELECT * FROM scores WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

module.exports = new AnalyticsRepository();
