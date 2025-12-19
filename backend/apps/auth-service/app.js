/**
 * Authentication Service Express Application
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
      service: 'auth-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Auth Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'auth-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Authentication Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/login': 'User login (POST)',
      '/register': 'User registration (POST)',
      '/logout': 'User logout (POST)',
      '/refresh': 'Refresh access token (POST)',
      '/verify': 'Verify token (POST)',
    },
  }, 'Authentication Service Information'));
});

// Auth routes placeholder (business logic will be added later)
app.post('/login', (req, res) => {
  // TODO: Implement login logic
  res.json(createResponse(null, 'Login endpoint - implementation pending'));
});

app.post('/register', (req, res) => {
  // TODO: Implement registration logic
  res.json(createResponse(null, 'Register endpoint - implementation pending'));
});

app.post('/logout', (req, res) => {
  // TODO: Implement logout logic
  res.json(createResponse(null, 'Logout endpoint - implementation pending'));
});

app.post('/refresh', (req, res) => {
  // TODO: Implement token refresh logic
  res.json(createResponse(null, 'Token refresh endpoint - implementation pending'));
});

app.post('/verify', (req, res) => {
  // TODO: Implement token verification logic
  res.json(createResponse(null, 'Token verification endpoint - implementation pending'));
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