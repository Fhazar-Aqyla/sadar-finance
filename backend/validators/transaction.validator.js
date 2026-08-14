/**
 * Joi validation schemas for Transaction (expense) endpoints.
 * Matches ERD: transaction_id, user_id, account_id, category_group,
 *              category_detail, transaction_date, description, source, amount
 */

const Joi = require('joi');

const currencyAmount = Joi.string().custom((value, helpers) => {
  const digits = value.replace(/\D/g, '');
  const amount = Number(digits);

  if (!digits || !Number.isFinite(amount) || amount <= 0) {
    return helpers.error('number.positive');
  }

  return amount;
});

const amountSchema = Joi.alternatives()
  .try(currencyAmount, Joi.number().positive().precision(2))
  .messages({ 'number.positive': 'amount must be greater than 0' });

const createTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  account_id: Joi.string().uuid().optional().allow(null),
  categoryGroup: Joi.string().max(100).optional().allow(''),
  category_group: Joi.string().max(100).optional().allow(''),
  category: Joi.string().max(100).optional().allow(''),
  budgetGroup: Joi.string().max(100).optional().allow(''),
  budget_group: Joi.string().max(100).optional().allow(''),
  categoryDetail: Joi.string().max(100).optional().allow('', null),
  category_detail: Joi.string().max(100).optional().allow('', null),
  transactionDate: Joi.date().iso().optional(),
  transaction_date: Joi.date().iso().optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().max(500).optional().allow(''),
  name: Joi.string().max(500).optional().allow(''),
  merchant: Joi.string().max(500).optional().allow(''),
  note: Joi.string().max(500).optional().allow(''),
  source: Joi.string().max(100).default('manual'),
  amount: amountSchema.required(),
  ocrScanId: Joi.string().uuid().optional(),
  ocr_scan_id: Joi.string().uuid().optional(),
});

const updateTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  account_id: Joi.string().uuid().optional().allow(null),
  categoryGroup: Joi.string().max(100).optional().allow(''),
  category_group: Joi.string().max(100).optional().allow(''),
  category: Joi.string().max(100).optional().allow(''),
  budgetGroup: Joi.string().max(100).optional().allow(''),
  budget_group: Joi.string().max(100).optional().allow(''),
  categoryDetail: Joi.string().max(100).optional().allow('', null),
  category_detail: Joi.string().max(100).optional().allow('', null),
  transactionDate: Joi.date().iso().optional(),
  transaction_date: Joi.date().iso().optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().max(500).optional().allow(''),
  name: Joi.string().max(500).optional().allow(''),
  merchant: Joi.string().max(500).optional().allow(''),
  note: Joi.string().max(500).optional().allow(''),
  source: Joi.string().max(100).optional(),
  amount: amountSchema.optional(),
}).min(1);

const queryTransactionSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  categoryGroup: Joi.string().max(100).optional(),
  categoryDetail: Joi.string().max(100).optional(),
  accountId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  minAmount: Joi.number().positive().optional(),
  maxAmount: Joi.number().positive().optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('transaction_date', 'amount', 'created_at').default('transaction_date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const summaryQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    .messages({ 'date.min': 'endDate must be the same as or after startDate' }),
});

const monthlyTrendQuerySchema = Joi.object({
  months: Joi.number().integer().min(1).max(24).default(6),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionSchema,
  summaryQuerySchema,
  monthlyTrendQuerySchema,
};
