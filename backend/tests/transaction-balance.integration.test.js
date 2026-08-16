const test = require('node:test');
const assert = require('node:assert/strict');

if (process.env.RUN_DB_INTEGRATION_TESTS !== 'true') {
  test.skip('transaction create/update/delete changes balance exactly once (set RUN_DB_INTEGRATION_TESTS=true)', () => {});
} else {
  test('transaction create/update/delete changes balance exactly once', async (t) => {
    const { query, pool } = require('../config/database');
    const transactionService = require('../services/transaction.service');
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = (await query(
      `INSERT INTO users (first_name, last_name, email, password_hash) VALUES ('OCR', 'Test', $1, 'test') RETURNING users_id`,
      [`ocr-balance-${suffix}@example.invalid`],
    )).rows[0];
    t.after(async () => {
      await query('DELETE FROM users WHERE users_id = $1', [user.users_id]);
      await pool.end();
    });
    const account = (await query(
      `INSERT INTO accounts (user_id, account_name, balance) VALUES ($1, 'Kas test', 100000) RETURNING account_id`,
      [user.users_id],
    )).rows[0];

    const created = await transactionService.create(user.users_id, { accountId: account.account_id, categoryGroup: 'needs', amount: 10000 });
    assert.equal(Number((await query('SELECT balance FROM accounts WHERE account_id = $1', [account.account_id])).rows[0].balance), 90000);

    await transactionService.update(created.transaction_id, user.users_id, { amount: 15000 });
    assert.equal(Number((await query('SELECT balance FROM accounts WHERE account_id = $1', [account.account_id])).rows[0].balance), 85000);

    await transactionService.delete(created.transaction_id, user.users_id);
    assert.equal(Number((await query('SELECT balance FROM accounts WHERE account_id = $1', [account.account_id])).rows[0].balance), 100000);
  });
}
