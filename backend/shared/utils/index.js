/**
 * Utility functions
 */

/**
 * Generate unique idempotency key
 */
function generateIdempotencyKey() {
  return `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format currency amount
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize input string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Create standardized API response
 */
function createResponse(data = null, message = 'Success', status = 200) {
  return {
    success: status < 400,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create error response
 */
function createErrorResponse(message = 'Error', status = 500, details = null) {
  return {
    success: false,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sleep for given milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  generateIdempotencyKey,
  generateRequestId,
  formatCurrency,
  isValidEmail,
  sanitizeString,
  createResponse,
  createErrorResponse,
  sleep,
};