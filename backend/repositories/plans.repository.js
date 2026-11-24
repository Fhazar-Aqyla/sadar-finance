/**
 * Financial Plans Repository — Cloud persistence for:
 * - savings_goals (Target Tabungan)
 * - recurring_items (Tagihan & Gaji Rutin)
 * - debts (Catatan Piutang & Utang)
 * - transfers (Riwayat Transfer Antar Akun)
 */

const { query } = require('../config/database');

class PlansRepository {
  constructor() {
    this._initialized = false;
  }

  async ensureTable() {
    if (this._initialized) return;
    await query(`
      CREATE TABLE IF NOT EXISTS user_financial_plans (
        user_id UUID PRIMARY KEY REFERENCES users(users_id) ON DELETE CASCADE,
        savings_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
        recurring_items JSONB NOT NULL DEFAULT '[]'::jsonb,
        debts JSONB NOT NULL DEFAULT '[]'::jsonb,
        transfers JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    this._initialized = true;
  }

  async getByUser(userId) {
    await this.ensureTable();
    const result = await query(
      `SELECT savings_goals, recurring_items, debts, transfers, updated_at
       FROM user_financial_plans
       WHERE user_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return {
        savingsGoals: [],
        recurringItems: [],
        debts: [],
        transfers: [],
        updatedAt: null,
      };
    }
    const row = result.rows[0];
    return {
      savingsGoals: Array.isArray(row.savings_goals) ? row.savings_goals : [],
      recurringItems: Array.isArray(row.recurring_items) ? row.recurring_items : [],
      debts: Array.isArray(row.debts) ? row.debts : [],
      transfers: Array.isArray(row.transfers) ? row.transfers : [],
      updatedAt: row.updated_at,
    };
  }

  async upsertByUser(userId, { savingsGoals, recurringItems, debts, transfers }) {
    await this.ensureTable();
    const current = await this.getByUser(userId);
    const nextSavings = Array.isArray(savingsGoals) ? savingsGoals : current.savingsGoals;
    const nextRecurring = Array.isArray(recurringItems) ? recurringItems : current.recurringItems;
    const nextDebts = Array.isArray(debts) ? debts : current.debts;
    const nextTransfers = Array.isArray(transfers) ? transfers : current.transfers;

    const result = await query(
      `INSERT INTO user_financial_plans (
         user_id, savings_goals, recurring_items, debts, transfers, updated_at
       )
       VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         savings_goals = EXCLUDED.savings_goals,
         recurring_items = EXCLUDED.recurring_items,
         debts = EXCLUDED.debts,
         transfers = EXCLUDED.transfers,
         updated_at = NOW()
       RETURNING savings_goals, recurring_items, debts, transfers, updated_at`,
      [
        userId,
        JSON.stringify(nextSavings),
        JSON.stringify(nextRecurring),
        JSON.stringify(nextDebts),
        JSON.stringify(nextTransfers),
      ]
    );
    const row = result.rows[0];
    return {
      savingsGoals: Array.isArray(row.savings_goals) ? row.savings_goals : [],
      recurringItems: Array.isArray(row.recurring_items) ? row.recurring_items : [],
      debts: Array.isArray(row.debts) ? row.debts : [],
      transfers: Array.isArray(row.transfers) ? row.transfers : [],
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new PlansRepository();
