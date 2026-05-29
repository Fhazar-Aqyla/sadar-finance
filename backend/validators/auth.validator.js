/**
 * Joi validation schemas for Authentication endpoints.
 * Matches ERD: first_name, last_name, gender, email, password_hash,
 *              phone_number, date_of_birth, address, occupation
 */

const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).trim().required(),
  lastName: Joi.string().min(2).max(100).trim().required(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  email: Joi.string().email().lowercase().trim().required()
    .messages({ 'string.email': 'Please provide a valid email address' }),
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
      'string.min': 'Password must be at least 8 characters',
    }),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-]{10,20}$/).optional()
    .messages({ 'string.pattern.base': 'Please provide a valid phone number' }),
  dateOfBirth: Joi.date().iso().optional(),
  address: Joi.string().max(500).optional().allow(''),
  occupation: Joi.string().max(100).optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).trim().optional(),
  lastName: Joi.string().min(2).max(100).trim().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional().allow(null, ''),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-]{10,20}$/).optional().allow(null, ''),
  dateOfBirth: Joi.date().iso().optional().allow(null, ''),
  address: Joi.string().max(500).optional().allow(null, ''),
  profilePicture: Joi.string().uri().max(1000).optional().allow(null, ''),
  occupation: Joi.string().max(100).optional().allow(null, ''),
}).min(1);

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, updateProfileSchema };
