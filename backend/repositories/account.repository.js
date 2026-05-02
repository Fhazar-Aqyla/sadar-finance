/**
 * Account Repository — Data access layer for accounts table.
 * Matches ERD: account_id, user_id, account_name, account_number, balance
 */

const { query } = require('../config/database');

class AccountRepository {
  async findById(accountId, userId) {
    const result = await query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [accountId, userId]
    );
    return result.rows[0] || null;
  }

  async findByUser(userId) {
    const result = await query(
      `SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at ASC`,
      [userId]
    );
    return result.rows;
  }

  async create(userId, { accountName, accountNumber, balance }) {
    const result = await query(
      `INSERT INTO accounts (user_id, account_name, account_number, balance)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, accountName, accountNumber || null, balance || 0]
    );
    return result.rows[0];
  }

  async update(accountId, userId, data) {
    const fields = [];
    const params = [accountId, userId];
    let paramIndex = 3;

    const fieldMap = {
      accountName: 'account_name',
      accountNumber: 'account_number',
      balance: 'balance',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');

    const result = await query(
      `UPDATE accounts SET ${fields.join(', ')}
       WHERE account_id = $1 AND user_id = $2
       RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async delete(accountId, userId) {
    const result = await query(
      `DELETE FROM accounts WHERE account_id = $1 AND user_id = $2 RETURNING account_id`,
      [accountId, userId]
    );
    return result.rowCount > 0;
  }

  async updateBalance(accountId, amount) {
    const result = await query(
      `UPDATE accounts SET balance = balance + $2, updated_at = NOW()
       WHERE account_id = $1
       RETURNING *`,
      [accountId, amount]
    );
    return result.rows[0] || null;
  }
}

module.exports = new AccountRepository();
