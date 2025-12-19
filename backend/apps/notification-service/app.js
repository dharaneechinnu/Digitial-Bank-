/**
 * Notification Service Express Application  
 * Email, SMS, and push notification management
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
      service: 'notification-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.nodeEnv,
      databases: dbHealth,
    };

    res.json(createResponse(health, 'Notification Service is healthy'));
  } catch (error) {
    res.status(503).json({
      service: 'notification-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json(createResponse({
    service: 'Notification Service',
    version: '1.0.0',
    endpoints: {
      '/health': 'Health check endpoint',
      '/notifications': 'Get all notifications (GET)',
      '/notifications/:id': 'Get notification by ID (GET)',
      '/notifications/send': 'Send notification (POST)',
      '/notifications/email': 'Send email notification (POST)',
      '/notifications/sms': 'Send SMS notification (POST)',
      '/notifications/push': 'Send push notification (POST)',
      '/templates': 'Get notification templates (GET)',
      '/preferences/:userId': 'Get/Update user preferences (GET/PUT)',
    },
  }, 'Notification Service Information'));
});

// Notification routes placeholder (business logic will be added later)
app.get('/notifications', (req, res) => {
  // TODO: Implement get all notifications logic with pagination and filtering
  res.json(createResponse([], 'Get notifications endpoint - implementation pending'));
});

app.get('/notifications/:id', (req, res) => {
  // TODO: Implement get notification by ID logic
  res.json(createResponse(null, 'Get notification by ID endpoint - implementation pending'));
});

app.post('/notifications/send', (req, res) => {
  // TODO: Implement send notification logic (generic)
  res.json(createResponse(null, 'Send notification endpoint - implementation pending'));
});

app.post('/notifications/email', (req, res) => {
  // TODO: Implement send email notification logic
  res.json(createResponse(null, 'Send email notification endpoint - implementation pending'));
});

app.post('/notifications/sms', (req, res) => {
  // TODO: Implement send SMS notification logic
  res.json(createResponse(null, 'Send SMS notification endpoint - implementation pending'));
});

app.post('/notifications/push', (req, res) => {
  // TODO: Implement send push notification logic
  res.json(createResponse(null, 'Send push notification endpoint - implementation pending'));
});

// Template management
app.get('/templates', (req, res) => {
  // TODO: Implement get notification templates logic
  res.json(createResponse([], 'Get notification templates endpoint - implementation pending'));
});

app.post('/templates', (req, res) => {
  // TODO: Implement create notification template logic
  res.json(createResponse(null, 'Create notification template endpoint - implementation pending'));
});

// User preference management
app.get('/preferences/:userId', (req, res) => {
  // TODO: Implement get user notification preferences logic
  res.json(createResponse(null, 'Get user preferences endpoint - implementation pending'));
});

app.put('/preferences/:userId', (req, res) => {
  // TODO: Implement update user notification preferences logic
  res.json(createResponse(null, 'Update user preferences endpoint - implementation pending'));
});

// Bulk notification endpoints
app.post('/notifications/bulk/email', (req, res) => {
  // TODO: Implement bulk email sending logic
  res.json(createResponse(null, 'Bulk email sending endpoint - implementation pending'));
});

app.post('/notifications/bulk/sms', (req, res) => {
  // TODO: Implement bulk SMS sending logic
  res.json(createResponse(null, 'Bulk SMS sending endpoint - implementation pending'));
});

// Notification status tracking
app.get('/notifications/:id/status', (req, res) => {
  // TODO: Implement notification status tracking logic
  res.json(createResponse(null, 'Get notification status endpoint - implementation pending'));
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