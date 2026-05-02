/**
 * Joi Validation Middleware Factory
 * Validates request body, query, or params against a Joi schema.
 *
 * @param {import('joi').Schema} schema - Joi validation schema
 * @param {'body'|'query'|'params'} source - Request property to validate
 * @returns {Function} Express middleware
 */
const { ValidationError } = require('../utils/errors');

const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));

      return next(new ValidationError('Validation failed', details));
    }

    // Replace with sanitized/validated values
    req[source] = value;
    next();
  };
};

module.exports = validate;
