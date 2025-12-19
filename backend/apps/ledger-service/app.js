/**
 * Ledger Service Express Application
 * Critical financial recording and double-entry bookkeeping
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
      service: 'ledger-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Ledger Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'ledger-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Ledger Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/entries': 'Get all ledger entries (GET)',
      '/entries/:id': 'Get ledger entry by ID (GET)',
      '/entries': 'Create new ledger entry (POST)',
      '/balance/:account': 'Get account balance (GET)',
      '/trial-balance': 'Get trial balance report (GET)',
    },
  }, 'Ledger Service Information'));
});

// Ledger routes placeholder (business logic will be added later)
app.get('/entries', (req, res) => {
  // TODO: Implement get all ledger entries logic
  res.json(createResponse([], 'Get ledger entries endpoint - implementation pending'));
});

app.get('/entries/:id', (req, res) => {
  // TODO: Implement get ledger entry by ID logic
  res.json(createResponse(null, 'Get ledger entry by ID endpoint - implementation pending'));
});

app.post('/entries', (req, res) => {
  // TODO: Implement create ledger entry logic
  res.json(createResponse(null, 'Create ledger entry endpoint - implementation pending'));
});

app.get('/balance/:account', (req, res) => {
  // TODO: Implement get account balance logic
  res.json(createResponse(null, 'Get account balance endpoint - implementation pending'));
});

app.get('/trial-balance', (req, res) => {
  // TODO: Implement trial balance report logic
  res.json(createResponse(null, 'Trial balance report endpoint - implementation pending'));
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