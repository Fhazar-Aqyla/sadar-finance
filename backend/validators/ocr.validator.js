/**
 * Joi validation schemas for OCR endpoints.
 */

const Joi = require('joi');

const confirmOcrTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().optional().allow(null),
  categoryGroup: Joi.string().max(100).optional().allow('', null),
  transactionDate: Joi.date().iso().optional(),
  description: Joi.string().max(500).optional().allow('', null),
  source: Joi.string().max(100).default('ocr'),
  amount: Joi.number().positive().precision(2).optional(),
});

module.exports = { confirmOcrTransactionSchema };
