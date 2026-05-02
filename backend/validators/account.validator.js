/**
 * Joi validation schemas for Account endpoints.
 * Matches ERD: account_id, user_id, account_name, account_number, balance
 */

const Joi = require('joi');

const createAccountSchema = Joi.object({
  accountName: Joi.string().min(1).max(100).trim().required(),
  accountNumber: Joi.string().max(50).optional().allow(''),
  balance: Joi.number().precision(2).default(0),
});

const updateAccountSchema = Joi.object({
  accountName: Joi.string().min(1).max(100).trim().optional(),
  accountNumber: Joi.string().max(50).optional().allow(''),
  balance: Joi.number().precision(2).optional(),
}).min(1);

module.exports = { createAccountSchema, updateAccountSchema };
