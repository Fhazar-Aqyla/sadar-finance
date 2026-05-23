/**
 * Centralized Error Handler Middleware
 * Catches all errors from controllers/services and returns a consistent response.
 */

const config = require('../config');
const { error: errorResponse } = require('../utils/response');
const { getDatabaseErrorResponse } = require('../utils/dbError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Log the error in development
  if (config.env === 'development') {
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });
  }

  // Operational errors (thrown intentionally)
  if (err.isOperational) {
    return errorResponse(res, {
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      details: err.details || null,
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return errorResponse(res, {
      message: 'A resource with that value already exists',
      statusCode: 409,
      errorCode: 'CONFLICT',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return errorResponse(res, {
      message: 'Referenced resource does not exist',
      statusCode: 400,
      errorCode: 'FOREIGN_KEY_VIOLATION',
    });
  }

  const dbError = getDatabaseErrorResponse(err);
  if (dbError) {
    return errorResponse(res, dbError);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, {
      message: `File size exceeds the ${config.upload.maxFileSizeMB}MB limit`,
      statusCode: 400,
      errorCode: 'FILE_TOO_LARGE',
    });
  }

  // Default: Internal server error (don't leak details in production)
  return errorResponse(res, {
    message: config.env === 'production' ? 'Internal server error' : err.message,
    statusCode: 500,
    errorCode: 'INTERNAL_ERROR',
  });
};

module.exports = errorHandler;
