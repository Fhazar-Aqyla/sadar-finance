/**
 * Transaction Repository — Data access layer for transactions table (expenses).
 * Matches ERD: transaction_id, user_id, account_id, category_group,
 *              category_detail, transaction_date, description, source, amount
 */

const { query } = require('../config/database');

class TransactionRepository {
  async findById(transactionId, userId, db = query, { forUpdate = false } = {}) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `SELECT t.*, a.account_name
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.account_id
       WHERE t.transaction_id = $1 AND t.user_id = $2${forUpdate ? ' FOR UPDATE OF t' : ''}`,
      [transactionId, userId]
    );
    return result.rows[0] || null;
  }

  async findAll(userId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      categoryGroup,
      categoryDetail,
      accountId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'transaction_date',
      sortOrder = 'desc',
    } = filters;

    const conditions = ['t.user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (categoryGroup) {
      conditions.push(`t.category_group = $${paramIndex++}`);
      params.push(categoryGroup);
    }
    if (categoryDetail) {
      conditions.push(`t.category_detail = $${paramIndex++}`);
      params.push(categoryDetail);
    }
    if (accountId) {
      conditions.push(`t.account_id = $${paramIndex++}`);
      params.push(accountId);
    }
    if (startDate) {
      conditions.push(`t.transaction_date >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`t.transaction_date <= $${paramIndex++}`);
      params.push(endDate);
    }
    if (minAmount) {
      conditions.push(`t.amount >= $${paramIndex++}`);
      params.push(minAmount);
    }
    if (maxAmount) {
      conditions.push(`t.amount <= $${paramIndex++}`);
      params.push(maxAmount);
    }
    if (search) {
      conditions.push(`(t.description ILIKE $${paramIndex} OR t.source ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const allowedSortColumns = ['transaction_date', 'amount', 'created_at'];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'transaction_date';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM transactions t WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Fetch data
    const dataResult = await query(
      `SELECT t.*, a.account_name
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.account_id
       WHERE ${whereClause}
       ORDER BY t.${safeSort} ${safeSortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return { data: dataResult.rows, total };
  }

  async create(userId, data, db = query) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `INSERT INTO transactions (user_id, account_id, category_group, category_detail, transaction_date, description, source, amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        data.accountId || null,
        data.categoryGroup || null,
        data.categoryDetail || null,
        data.transactionDate || new Date(),
        data.description || null,
        data.source || 'manual',
        data.amount,
      ]
    );
    return result.rows[0];
  }

  async update(transactionId, userId, data, db = query) {
    const fields = [];
    const params = [transactionId, userId];
    let paramIndex = 3;

    const fieldMap = {
      accountId: 'account_id',
      categoryGroup: 'category_group',
      categoryDetail: 'category_detail',
      transactionDate: 'transaction_date',
      description: 'description',
      source: 'source',
      amount: 'amount',
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
      `UPDATE transactions SET ${fields.join(', ')}
       WHERE transaction_id = $1 AND user_id = $2
       RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async delete(transactionId, userId, db = query) {
    const runQuery = typeof db === 'function' ? db : db.query.bind(db);
    const result = await runQuery(
      `DELETE FROM transactions WHERE transaction_id = $1 AND user_id = $2 RETURNING transaction_id`,
      [transactionId, userId]
    );
    return result.rowCount > 0;
  }

  async getSummary(userId, startDate, endDate) {
    const result = await query(
      `SELECT
         category_group,
         category_detail,
         COUNT(*)::integer as count,
         COALESCE(SUM(amount), 0)::numeric as total
       FROM transactions
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3
       GROUP BY category_group, category_detail
       ORDER BY total DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  async getTotalExpense(userId, startDate, endDate) {
    const result = await query(
      `SELECT COALESCE(SUM(amount), 0)::numeric as total, COUNT(*)::integer as count
       FROM transactions
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date <= $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  }

  async getMonthlyExpenseTrend(userId, months = 6) {
    const result = await query(
      `SELECT
         DATE_TRUNC('month', transaction_date) as month,
         COALESCE(SUM(amount), 0)::numeric as total,
         COUNT(*)::integer as count
       FROM transactions
       WHERE user_id = $1
         AND transaction_date >= NOW() - ($2::int * INTERVAL '1 month')
       GROUP BY DATE_TRUNC('month', transaction_date)
       ORDER BY month ASC`,
      [userId, months]
    );
    return result.rows;
  }
}

module.exports = new TransactionRepository();
