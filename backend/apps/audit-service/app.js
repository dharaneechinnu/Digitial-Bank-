/**
 * Audit Service Express Application
 * Audit logging and financial compliance tracking
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
      service: 'audit-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Audit Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'audit-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Audit Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/audit-logs': 'Get audit logs (GET)',
      '/audit-logs/:id': 'Get audit log by ID (GET)',
      '/audit-logs': 'Create audit log entry (POST)',
      '/compliance-reports': 'Generate compliance reports (GET)',
      '/user-activity/:userId': 'Get user activity logs (GET)',
      '/system-events': 'Get system event logs (GET)',
    },
  }, 'Audit Service Information'));
});

// Audit log routes placeholder (business logic will be added later)
app.get('/audit-logs', (req, res) => {
  // TODO: Implement get all audit logs logic with filtering/pagination
  res.json(createResponse([], 'Get audit logs endpoint - implementation pending'));
});

app.get('/audit-logs/:id', (req, res) => {
  // TODO: Implement get audit log by ID logic
  res.json(createResponse(null, 'Get audit log by ID endpoint - implementation pending'));
});

app.post('/audit-logs', (req, res) => {
  // TODO: Implement create audit log entry logic
  res.json(createResponse(null, 'Create audit log endpoint - implementation pending'));
});

app.get('/compliance-reports', (req, res) => {
  // TODO: Implement compliance report generation logic
  res.json(createResponse(null, 'Generate compliance reports endpoint - implementation pending'));
});

app.get('/user-activity/:userId', (req, res) => {
  // TODO: Implement user activity tracking logic
  res.json(createResponse([], 'Get user activity logs endpoint - implementation pending'));
});

app.get('/system-events', (req, res) => {
  // TODO: Implement system event logging logic
  res.json(createResponse([], 'Get system events endpoint - implementation pending'));
});

// Transaction audit specific endpoints
app.get('/transaction-audit/:transactionId', (req, res) => {
  // TODO: Implement transaction audit trail logic
  res.json(createResponse(null, 'Get transaction audit trail endpoint - implementation pending'));
});

app.post('/transaction-audit', (req, res) => {
  // TODO: Implement transaction audit logging logic
  res.json(createResponse(null, 'Create transaction audit entry endpoint - implementation pending'));
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