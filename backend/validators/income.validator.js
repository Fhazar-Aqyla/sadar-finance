/**
 * Joi validation schemas for Income endpoints.
 * Matches ERD: income_id, user_id, account_id, amount, income_date, source
 */

const Joi = require('joi');

const createIncomeSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  amount: Joi.number().positive().precision(2).required(),
  incomeDate: Joi.date().iso().default(() => new Date()),
  source: Joi.string().max(100).optional().allow(''),
});

const updateIncomeSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  amount: Joi.number().positive().precision(2).optional(),
  incomeDate: Joi.date().iso().optional(),
  source: Joi.string().max(100).optional().allow(''),
}).min(1);

const queryIncomeSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  accountId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  source: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('income_date', 'amount', 'created_at').default('income_date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const monthlyTrendQuerySchema = Joi.object({
  months: Joi.number().integer().min(1).max(24).default(6),
});

module.exports = {
  createIncomeSchema,
  updateIncomeSchema,
  queryIncomeSchema,
  monthlyTrendQuerySchema,
};
