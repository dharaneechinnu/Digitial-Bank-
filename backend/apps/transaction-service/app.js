/**
 * Transaction Service Express Application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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
      service: 'transaction-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Transaction Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'transaction-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Transaction Processing Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/transactions': 'Get all transactions (GET)',
      '/transactions/:id': 'Get transaction by ID (GET)',
      '/transactions/transfer': 'Create transfer transaction (POST)',
      '/transactions/deposit': 'Create deposit transaction (POST)',
      '/transactions/withdraw': 'Create withdrawal transaction (POST)',
      '/transactions/:id/status': 'Get transaction status (GET)',
    },
  }, 'Transaction Service Information'));
});

// Transaction routes placeholder (business logic will be added later)
app.get('/transactions', (req, res) => {
  // TODO: Implement get all transactions logic
  res.json(createResponse([], 'Get transactions endpoint - implementation pending'));
});

app.get('/transactions/:id', (req, res) => {
  // TODO: Implement get transaction by ID logic
  res.json(createResponse(null, 'Get transaction by ID endpoint - implementation pending'));
});

app.post('/transactions/transfer', (req, res) => {
  // TODO: Implement transfer logic
  res.json(createResponse(null, 'Transfer endpoint - implementation pending'));
});

app.post('/transactions/deposit', (req, res) => {
  // TODO: Implement deposit logic
  res.json(createResponse(null, 'Deposit endpoint - implementation pending'));
});

app.post('/transactions/withdraw', (req, res) => {
  // TODO: Implement withdrawal logic
  res.json(createResponse(null, 'Withdrawal endpoint - implementation pending'));
});

app.get('/transactions/:id/status', (req, res) => {
  // TODO: Implement transaction status logic
  res.json(createResponse(null, 'Transaction status endpoint - implementation pending'));
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