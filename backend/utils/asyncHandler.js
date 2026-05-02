/**
 * Wraps an async route handler to catch errors and pass them to next().
 * Eliminates the need for try/catch in every controller method.
 *
 * @param {Function} fn - Async express route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
