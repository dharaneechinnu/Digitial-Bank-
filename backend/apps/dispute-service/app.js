/**
 * Dispute Service Express Application
 * Transaction dispute and chargeback management
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
      service: 'dispute-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Dispute Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'dispute-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Dispute Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/disputes': 'Get all disputes (GET)',
      '/disputes/:id': 'Get dispute by ID (GET)',
      '/disputes': 'Create new dispute (POST)',
      '/disputes/:id/resolve': 'Resolve dispute (POST)',
      '/disputes/:id/escalate': 'Escalate dispute (POST)',
      '/chargebacks': 'Get all chargebacks (GET)',
    },
  }, 'Dispute Service Information'));
});

// Dispute routes placeholder (business logic will be added later)
app.get('/disputes', (req, res) => {
  // TODO: Implement get all disputes logic
  res.json(createResponse([], 'Get disputes endpoint - implementation pending'));
});

app.get('/disputes/:id', (req, res) => {
  // TODO: Implement get dispute by ID logic
  res.json(createResponse(null, 'Get dispute by ID endpoint - implementation pending'));
});

app.post('/disputes', (req, res) => {
  // TODO: Implement create dispute logic
  res.json(createResponse(null, 'Create dispute endpoint - implementation pending'));
});

app.post('/disputes/:id/resolve', (req, res) => {
  // TODO: Implement resolve dispute logic
  res.json(createResponse(null, 'Resolve dispute endpoint - implementation pending'));
});

app.post('/disputes/:id/escalate', (req, res) => {
  // TODO: Implement escalate dispute logic
  res.json(createResponse(null, 'Escalate dispute endpoint - implementation pending'));
});

app.get('/chargebacks', (req, res) => {
  // TODO: Implement get all chargebacks logic
  res.json(createResponse([], 'Get chargebacks endpoint - implementation pending'));
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