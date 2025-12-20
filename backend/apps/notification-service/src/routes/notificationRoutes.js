/**
 * Notification Service Routes
 * Defines API endpoints for notification service
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * Health check route
 */
router.get('/health', notificationController.getHealth);

/**
 * User notification routes
 */
router.get('/user/:userId', notificationController.getUserNotifications);

/**
 * Statistics and monitoring
 */
router.get('/stats', notificationController.getNotificationStats);

/**
 * Notification management
 */
router.post('/:notificationId/retry', notificationController.retryNotification);

/**
 * Worker management routes
 */
router.post('/worker/start', notificationController.startWorker);
router.post('/worker/stop', notificationController.stopWorker);
router.get('/worker/status', notificationController.getWorkerStatus);

module.exports = router;