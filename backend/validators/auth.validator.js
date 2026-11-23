/**
 * Joi validation schemas for Authentication endpoints.
 * Matches ERD: first_name, last_name, gender, email, password_hash,
 *              phone_number, date_of_birth, address, occupation
 */

const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).trim().required(),
  middleName: Joi.string().max(100).trim().optional().allow(null, ''),
  lastName: Joi.string().min(1).max(100).trim().required(),
  username: Joi.string().max(60).trim().optional().allow(null, ''),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  email: Joi.string().email().lowercase().trim().required()
    .messages({ 'string.email': 'Please provide a valid email address' }),
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
      'string.min': 'Password must be at least 8 characters',
    }),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-]{8,20}$/).optional().allow(null, '')
    .messages({ 'string.pattern.base': 'Please provide a valid phone number' }),
  dateOfBirth: Joi.date().iso().optional().allow(null, ''),
  address: Joi.string().max(500).optional().allow(null, ''),
  city: Joi.string().max(120).optional().allow(null, ''),
  province: Joi.string().max(120).optional().allow(null, ''),
  postalCode: Joi.string().max(20).optional().allow(null, ''),
  occupation: Joi.string().max(100).optional().allow(null, ''),
  financialGoal: Joi.string().max(160).optional().allow(null, ''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const passwordValue = Joi.string().min(8).max(128)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .messages({
    'string.pattern.base': 'Password must contain letters and numbers',
    'string.min': 'Password must be at least 8 characters',
  });

const passwordAliasFields = {
  currentPassword: Joi.string().max(128).optional().allow(''),
  current_password: Joi.string().max(128).optional().allow(''),
  oldPassword: Joi.string().max(128).optional().allow(''),
  old_password: Joi.string().max(128).optional().allow(''),
  passwordCurrent: Joi.string().max(128).optional().allow(''),
  newPassword: passwordValue.optional().allow(''),
  new_password: passwordValue.optional().allow(''),
  passwordNew: passwordValue.optional().allow(''),
  password_new: passwordValue.optional().allow(''),
  password: passwordValue.optional().allow(''),
  confirmPassword: Joi.string().max(128).optional().allow(''),
  confirm_password: Joi.string().max(128).optional().allow(''),
  passwordConfirmation: Joi.string().max(128).optional().allow(''),
  password_confirmation: Joi.string().max(128).optional().allow(''),
  newPasswordConfirm: Joi.string().max(128).optional().allow(''),
  new_password_confirm: Joi.string().max(128).optional().allow(''),
};

const changePasswordSchema = Joi.object(passwordAliasFields).min(1);

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).trim().optional(),
  middleName: Joi.string().max(100).trim().optional().allow(null, ''),
  lastName: Joi.string().min(1).max(100).trim().optional().allow(null, ''),
  username: Joi.string().max(60).trim().optional().allow(null, ''),
  gender: Joi.string().valid('male', 'female', 'other').optional().allow(null, ''),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-]{8,20}$/).optional().allow(null, ''),
  dateOfBirth: Joi.date().iso().optional().allow(null, ''),
  address: Joi.string().max(500).optional().allow(null, ''),
  city: Joi.string().max(120).optional().allow(null, ''),
  province: Joi.string().max(120).optional().allow(null, ''),
  postalCode: Joi.string().max(20).optional().allow(null, ''),
  profilePicture: Joi.string().max(2000000).optional().allow(null, ''),
  occupation: Joi.string().max(100).optional().allow(null, ''),
  financialGoal: Joi.string().max(160).optional().allow(null, ''),
  streakDays: Joi.number().integer().min(0).max(10000).optional(),
  xpPoints: Joi.number().integer().min(0).max(10000000).optional(),
  financialLevel: Joi.number().integer().min(1).max(10).optional(),
  ...passwordAliasFields,
}).min(1);

const sendOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().optional(),
  purpose: Joi.string().valid('verify', 'reset').default('verify'),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().optional(),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Kode OTP harus terdiri dari 6 angka',
  }),
});

const resetPasswordOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Kode OTP harus terdiri dari 6 angka',
  }),
  newPassword: Joi.string().min(8).max(128).required(),
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().optional().allow(''),
  accessToken: Joi.string().optional().allow(''),
  googleId: Joi.string().max(255).optional().allow(''),
  email: Joi.string().email().lowercase().trim().required(),
  displayName: Joi.string().max(200).optional().allow(''),
  photoUrl: Joi.string().max(2000).optional().allow(null, ''),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordOtpSchema,
  googleAuthSchema,
};
