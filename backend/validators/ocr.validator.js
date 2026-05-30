/**
 * Joi validation schemas for OCR endpoints.
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

const confirmOcrTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  account_id: Joi.string().uuid().optional().allow(null),
  categoryGroup: Joi.string().max(100).optional().allow('', null),
  category_group: Joi.string().max(100).optional().allow('', null),
  category: Joi.string().max(100).optional().allow('', null),
  budgetGroup: Joi.string().max(100).optional().allow('', null),
  budget_group: Joi.string().max(100).optional().allow('', null),
  categoryDetail: Joi.string().max(100).optional().allow('', null),
  category_detail: Joi.string().max(100).optional().allow('', null),
  transactionDate: Joi.date().iso().optional(),
  transaction_date: Joi.date().iso().optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().max(500).optional().allow('', null),
  name: Joi.string().max(500).optional().allow('', null),
  merchant: Joi.string().max(500).optional().allow('', null),
  note: Joi.string().max(500).optional().allow('', null),
  source: Joi.string().max(100).default('ocr'),
  amount: amountSchema.optional(),
});

module.exports = { confirmOcrTransactionSchema };
