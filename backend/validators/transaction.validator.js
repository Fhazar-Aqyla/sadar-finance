/**
 * Joi validation schemas for Transaction (expense) endpoints.
 * Matches ERD: transaction_id, user_id, account_id, category_group,
 *              transaction_date, description, source, amount
 */

const Joi = require('joi');

const createTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  categoryGroup: Joi.string().max(100).optional().allow(''),
  transactionDate: Joi.date().iso().default(() => new Date()),
  description: Joi.string().max(500).optional().allow(''),
  source: Joi.string().max(100).default('manual'),
  amount: Joi.number().positive().precision(2).required(),
});

const updateTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  categoryGroup: Joi.string().max(100).optional().allow(''),
  transactionDate: Joi.date().iso().optional(),
  description: Joi.string().max(500).optional().allow(''),
  source: Joi.string().max(100).optional(),
  amount: Joi.number().positive().precision(2).optional(),
}).min(1);

const queryTransactionSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  categoryGroup: Joi.string().max(100).optional(),
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
