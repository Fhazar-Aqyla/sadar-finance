/**
 * Standardized API response helpers.
 * Ensures every response follows the same envelope format.
 */

/**
 * Success response
 */
const success = (res, { data = null, message = 'Success', statusCode = 200, meta = null }) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 */
const created = (res, { data = null, message = 'Resource created successfully' }) => {
  return success(res, { data, message, statusCode: 201 });
};

/**
 * No Content response (204)
 */
const noContent = (res) => {
  return res.status(204).end();
};

/**
 * Error response
 */
const error = (res, { message = 'Internal server error', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null }) => {
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };

  if (details) response.error.details = details;

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 */
const paginated = (res, { data, page, limit, total, message = 'Success' }) => {
  return success(res, {
    data,
    message,
    meta: {
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: parseInt(total, 10),
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

module.exports = { success, created, noContent, error, paginated };
