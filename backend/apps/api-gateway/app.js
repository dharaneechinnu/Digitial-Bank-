/**
 * API Gateway Express Application
 * Routes requests to appropriate microservices
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import shared modules
const config = require('../../shared/config');
const { errorHandler, requestLogger } = require('../../shared/middlewares');
const { createResponse } = require('../../shared/utils');
const db = require('../../shared/db');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      status: 429,
    },
  },
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheckAll();
    
    const health = {
      service: 'api-gateway',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'API Gateway is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'api-gateway',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Proxy routes are now mounted from ./src/routes/proxyRoutes.js

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json(createResponse({
    service: 'API Gateway',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/api/auth/*': 'Authentication and authorization services',
      '/api/accounts/*': 'Account management services',
      '/api/transactions/*': 'Transaction processing services',
      '/api/ledger/*': 'Ledger and double-entry bookkeeping services',
      '/api/settlements/*': 'Payment settlement and clearing services',
      '/api/disputes/*': 'Transaction dispute and chargeback management',
      '/api/audit/*': 'Audit logging and compliance services',
      '/api/notifications/*': 'Email, SMS, and push notification services',
    },
    documentation: 'https://docs.your-company.com/api',
  }, 'API Gateway Information'));
});

// Register local src routes
try {
  require('./src')(app);
} catch (e) {
  // If src isn't present or errors during load, log but don't crash here.
  console.warn('⚠️  Could not register local src routes:', e.message);
}

// Catch-all for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      status: 404,
      path: req.originalUrl,
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;