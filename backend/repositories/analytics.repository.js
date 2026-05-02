/**
 * Analytics Repository — Data access for budget, insight, alert, score tables.
 * Matches ERD tables: budgets, insights, alerts, scores
 */

const { query } = require('../config/database');

class AnalyticsRepository {
  // ── Budget ────────────────────────────────────────────────
  async createBudget(userId, data) {
    const result = await query(
      `INSERT INTO budgets (user_id, needs_amount, wants_amount, savings_amount, percentage, limit_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, data.needsAmount, data.wantsAmount, data.savingsAmount, data.percentage || null, data.limitAmount]
    );
    return result.rows[0];
  }

  async getLatestBudget(userId) {
    const result = await query(
      `SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async getBudgetHistory(userId, limit = 10) {
    const result = await query(
      `SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
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
