/**
 * Joi validation schemas for Analytics endpoints.
 * Matches ERD tables: budgets, insights, alerts, scores
 */

const Joi = require('joi');

// AI Categorization input
const categorizeSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required()
    .messages({ 'string.empty': 'Transaction description text is required' }),
  transactionId: Joi.string().uuid().optional(),
});

// Behavior analysis input
const behaviorAnalysisSchema = Joi.object({
  periodStart: Joi.date().iso().required(),
  periodEnd: Joi.date().iso().greater(Joi.ref('periodStart')).required()
    .messages({ 'date.greater': 'periodEnd must be after periodStart' }),
});

// Overspending prediction input
const overspendingSchema = Joi.object({
  month: Joi.date().iso().required()
    .messages({ 'date.base': 'Provide a valid month date (YYYY-MM-DD)' }),
  budgetLimit: Joi.number().positive().optional(),
});

// Financial health score input
const healthScoreSchema = Joi.object({
  periodMonths: Joi.number().integer().min(1).max(24).default(3),
});

// Budget input (50/30/20 rule)
const createBudgetSchema = Joi.object({
  needsAmount: Joi.number().precision(2).min(0).required(),
  wantsAmount: Joi.number().precision(2).min(0).required(),
  savingsAmount: Joi.number().precision(2).min(0).required(),
  percentage: Joi.number().precision(2).min(0).max(100).optional(),
  limitAmount: Joi.number().precision(2).min(0).required(),
});

module.exports = {
  categorizeSchema,
  behaviorAnalysisSchema,
  overspendingSchema,
  healthScoreSchema,
  createBudgetSchema,
};
