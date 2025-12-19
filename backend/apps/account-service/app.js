/**
 * Account Service Express Application
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
      service: 'account-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Account Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'account-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Account Management Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/accounts': 'Get all accounts (GET)',
      '/accounts/:id': 'Get account by ID (GET)',
      '/accounts': 'Create new account (POST)',
      '/accounts/:id': 'Update account (PUT)',
      '/accounts/:id/balance': 'Get account balance (GET)',
    },
  }, 'Account Service Information'));
});

// Account routes placeholder (business logic will be added later)
app.get('/accounts', (req, res) => {
  // TODO: Implement get all accounts logic
  res.json(createResponse([], 'Get accounts endpoint - implementation pending'));
});

app.get('/accounts/:id', (req, res) => {
  // TODO: Implement get account by ID logic
  res.json(createResponse(null, 'Get account by ID endpoint - implementation pending'));
});

app.post('/accounts', (req, res) => {
  // TODO: Implement create account logic
  res.json(createResponse(null, 'Create account endpoint - implementation pending'));
});

app.put('/accounts/:id', (req, res) => {
  // TODO: Implement update account logic
  res.json(createResponse(null, 'Update account endpoint - implementation pending'));
});

app.get('/accounts/:id/balance', (req, res) => {
  // TODO: Implement get balance logic
  res.json(createResponse(null, 'Get balance endpoint - implementation pending'));
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