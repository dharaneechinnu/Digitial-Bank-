/**
 * Settlement Service Express Application
 * Payment settlement and clearing operations
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
      service: 'settlement-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Settlement Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'settlement-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Settlement Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/settlements': 'Get all settlements (GET)',
      '/settlements/:id': 'Get settlement by ID (GET)',
      '/settlements': 'Create new settlement (POST)',
      '/settlements/:id/process': 'Process settlement (POST)',
      '/settlements/status/:status': 'Get settlements by status (GET)',
    },
  }, 'Settlement Service Information'));
});

// Settlement routes placeholder (business logic will be added later)
app.get('/settlements', (req, res) => {
  // TODO: Implement get all settlements logic
  res.json(createResponse([], 'Get settlements endpoint - implementation pending'));
});

app.get('/settlements/:id', (req, res) => {
  // TODO: Implement get settlement by ID logic
  res.json(createResponse(null, 'Get settlement by ID endpoint - implementation pending'));
});

app.post('/settlements', (req, res) => {
  // TODO: Implement create settlement logic
  res.json(createResponse(null, 'Create settlement endpoint - implementation pending'));
});

app.post('/settlements/:id/process', (req, res) => {
  // TODO: Implement process settlement logic
  res.json(createResponse(null, 'Process settlement endpoint - implementation pending'));
});

app.get('/settlements/status/:status', (req, res) => {
  // TODO: Implement get settlements by status logic
  res.json(createResponse([], 'Get settlements by status endpoint - implementation pending'));
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