const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require('../validators/transaction.validator');

test('accepts an empty category detail sent by the transaction form', () => {
  const payload = {
    accountId: '11111111-1111-4111-8111-111111111111',
    categoryGroup: 'needs',
    categoryDetail: null,
    transactionDate: '2026-08-14T12:00:00.000Z',
    description: 'makan kue',
    source: 'manual',
    amount: 1000,
  };

  const result = createTransactionSchema.validate(payload);

  assert.equal(result.error, undefined);
  assert.equal(result.value.categoryDetail, null);
});

test('accepts clearing category detail when updating a transaction', () => {
  const result = updateTransactionSchema.validate({ categoryDetail: null });

  assert.equal(result.error, undefined);
  assert.equal(result.value.categoryDetail, null);
});
