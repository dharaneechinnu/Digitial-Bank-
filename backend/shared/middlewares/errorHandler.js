/**
 * Global error handler middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error
  let error = {
    message: 'Internal server error',
    status: 500,
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.details = err.details;
    error.status = 400;
  }

  // Database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    error.message = 'Resource already exists';
    error.status = 409;
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    error.message = 'Referenced resource not found';
    error.status = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Custom application errors
  if (err.status) {
    error.status = err.status;
    error.message = err.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Something went wrong';
  }

  res.status(error.status).json({
    error: {
      message: error.message,
      status: error.status,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;