/**
 * Income Repository — Data access layer for incomes table.
 * Matches ERD: income_id, user_id, account_id, amount, income_date, source
 */

const { query } = require('../config/database');

class IncomeRepository {
  async findById(incomeId, userId, db = query, { forUpdate = false } = {}) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `SELECT i.*, a.account_name
       FROM incomes i
       LEFT JOIN accounts a ON i.account_id = a.account_id
       WHERE i.income_id = $1 AND i.user_id = $2${forUpdate ? ' FOR UPDATE OF i' : ''}`,
      [incomeId, userId]
    );
    return result.rows[0] || null;
  }

  async findAll(userId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      accountId,
      startDate,
      endDate,
      source,
      sortBy = 'income_date',
      sortOrder = 'desc',
    } = filters;

    const conditions = ['i.user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (accountId) {
      conditions.push(`i.account_id = $${paramIndex++}`);
      params.push(accountId);
    }
    if (startDate) {
      conditions.push(`i.income_date >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`i.income_date <= $${paramIndex++}`);
      params.push(endDate);
    }
    if (source) {
      conditions.push(`i.source ILIKE $${paramIndex++}`);
      params.push(`%${source}%`);
    }

    const whereClause = conditions.join(' AND ');
    const allowedSortColumns = ['income_date', 'amount', 'created_at'];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'income_date';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM incomes i WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await query(
      `SELECT i.*, a.account_name
       FROM incomes i
       LEFT JOIN accounts a ON i.account_id = a.account_id
       WHERE ${whereClause}
       ORDER BY i.${safeSort} ${safeSortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return { data: dataResult.rows, total };
  }

  async create(userId, data, db = query) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `INSERT INTO incomes (user_id, account_id, amount, income_date, source)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, data.accountId || null, data.amount, data.incomeDate || new Date(), data.source || null]
    );
    return result.rows[0];
  }

  async update(incomeId, userId, data, db = query) {
    const fields = [];
    const params = [incomeId, userId];
    let paramIndex = 3;

    const fieldMap = {
      accountId: 'account_id',
      amount: 'amount',
      incomeDate: 'income_date',
      source: 'source',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `UPDATE incomes SET ${fields.join(', ')}
       WHERE income_id = $1 AND user_id = $2
       RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async delete(incomeId, userId, db = query) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `DELETE FROM incomes WHERE income_id = $1 AND user_id = $2 RETURNING income_id`,
      [incomeId, userId]
    );
    return result.rowCount > 0;
  }

  async getTotalIncome(userId, startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(amount), 0)::numeric as total, COUNT(*)::integer as count
       FROM incomes
       WHERE user_id = $1
         AND income_date >= $2
         AND income_date <= $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  }

  async getMonthlyIncomeTrend(userId, months = 6) {
    const result = await query(
      `SELECT
         DATE_TRUNC('month', income_date) as month,
         COALESCE(SUM(amount), 0)::numeric as total,
         COUNT(*)::integer as count
       FROM incomes
       WHERE user_id = $1
         AND income_date >= NOW() - ($2::int * INTERVAL '1 month')
       GROUP BY DATE_TRUNC('month', income_date)
       ORDER BY month ASC`,
      [userId, months]
    );
    return result.rows;
  }
}

module.exports = new IncomeRepository();
