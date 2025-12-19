/**
 * API Gateway Express Application
 * Routes requests to appropriate microservices
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

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

// API Gateway routes - Proxy to microservices
app.use('/api/auth', createProxyMiddleware({
  target: `http://${config.services.authService.host}:${config.services.authService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '', // Remove /api/auth prefix when forwarding
  },
}));

app.use('/api/accounts', createProxyMiddleware({
  target: `http://${config.services.accountService.host}:${config.services.accountService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/accounts': '',
  },
}));

app.use('/api/transactions', createProxyMiddleware({
  target: `http://${config.services.transactionService.host}:${config.services.transactionService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '',
  },
}));

// New microservice proxy routes
app.use('/api/ledger', createProxyMiddleware({
  target: `http://${config.services.ledgerService.host}:${config.services.ledgerService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/ledger': '',
  },
}));

app.use('/api/settlements', createProxyMiddleware({
  target: `http://${config.services.settlementService.host}:${config.services.settlementService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/settlements': '',
  },
}));

app.use('/api/disputes', createProxyMiddleware({
  target: `http://${config.services.disputeService.host}:${config.services.disputeService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/disputes': '',
  },
}));

app.use('/api/audit', createProxyMiddleware({
  target: `http://${config.services.auditService.host}:${config.services.auditService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/audit': '',
  },
}));

app.use('/api/notifications', createProxyMiddleware({
  target: `http://${config.services.notificationService.host}:${config.services.notificationService.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '',
  },
}));

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