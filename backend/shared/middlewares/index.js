/**
 * Middleware exports
 */

const errorHandler = require('./errorHandler');
const requestLogger = require('./requestLogger');

module.exports = {
  errorHandler,
  requestLogger,
};