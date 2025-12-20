/**
 * Notification Controller
 * Handles notification service endpoints
 */

const Notification = require('../models/notification');
const notificationWorker = require('../workers/notificationWorker');
const EmailService = require('../services/emailService');

class NotificationController {
  
  /**
   * Get notification service health and status
   * GET /health
   */
  async getHealth(req, res) {
    try {
      const workerStatus = await notificationWorker.getStatus();
      const emailServiceStatus = await EmailService.testConfiguration();
      
      const health = {
        service: 'notification-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        worker: workerStatus,
        email_service: {
          status: emailServiceStatus.success ? 'ready' : 'error',
          provider: 'smtp',
          last_test: emailServiceStatus.timestamp
        }
      };
      
      const httpStatus = health.worker.worker_status === 'running' && 
                        emailServiceStatus.success ? 200 : 503;
      
      res.status(httpStatus).json(health);
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      
      res.status(503).json({
        service: 'notification-service',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }
  
  /**
   * Get notification history for a user
   * GET /notifications/user/:userId
   */
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        status, 
        type,
        days = 30 
      } = req.query;
      
      // Build filter query
      const filter = {
        user_id: userId
      };
      
      // Filter by status
      if (status) {
        filter.status = status.toUpperCase();
      }
      
      // Filter by type
      if (type) {
        filter.type = type.toUpperCase();
      }
      
      // Filter by date range
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      filter.createdAt = { $gte: daysAgo };
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get notifications with pagination
      const [notifications, totalCount] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-provider_response -metadata.sensitive_data')
          .lean(),
        
        Notification.countDocuments(filter)
      ]);
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;
      
      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_count: totalCount,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          status: status || 'all',
          type: type || 'all',
          days: parseInt(days)
        }
      });
      
    } catch (error) {
      console.error('❌ Error fetching user notifications:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Get notification statistics
   * GET /notifications/stats
   */
  async getNotificationStats(req, res) {
    try {
      const { days = 7 } = req.query;
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      
      // Get aggregated statistics
      const [
        statusStats,
        typeStats,
        dailyStats,
        recentFailures
      ] = await Promise.all([
        // Status distribution
        Notification.aggregate([
          {
            $match: { createdAt: { $gte: daysAgo } }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Type distribution
        Notification.aggregate([
          {
            $match: { createdAt: { $gte: daysAgo } }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Daily volume
        Notification.aggregate([
          {
            $match: { createdAt: { $gte: daysAgo } }
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$createdAt'
                  }
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.date': 1 }
          }
        ]),
        
        // Recent failures
        Notification.find({
          status: 'FAILED',
          createdAt: { $gte: daysAgo }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('type error_message createdAt user_id')
        .lean()
      ]);
      
      // Get worker status
      const workerStatus = await notificationWorker.getStatus();
      
      res.status(200).json({
        success: true,
        period: {
          days: parseInt(days),
          from: daysAgo.toISOString(),
          to: new Date().toISOString()
        },
        statistics: {
          by_status: statusStats,
          by_type: typeStats,
          daily_volume: dailyStats,
          recent_failures: recentFailures
        },
        worker_status: workerStatus
      });
      
    } catch (error) {
      console.error('❌ Error fetching notification stats:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Retry failed notification
   * POST /notifications/:notificationId/retry
   */
  async retryNotification(req, res) {
    try {
      const { notificationId } = req.params;
      
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      
      if (notification.status !== 'FAILED') {
        return res.status(400).json({
          success: false,
          message: 'Only failed notifications can be retried'
        });
      }
      
      if (notification.retry_count >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum retry attempts reached'
        });
      }
      
      // Reset notification for retry
      notification.status = 'PENDING';
      notification.retry_count += 1;
      notification.retry_after = new Date();
      notification.error_message = null;
      
      await notification.save();
      
      res.status(200).json({
        success: true,
        message: 'Notification queued for retry',
        notification_id: notification._id,
        retry_count: notification.retry_count
      });
      
    } catch (error) {
      console.error('❌ Error retrying notification:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retry notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Worker control endpoints
   * POST /worker/start
   */
  async startWorker(req, res) {
    try {
      notificationWorker.start();
      
      res.status(200).json({
        success: true,
        message: 'Notification worker started',
        status: 'running'
      });
      
    } catch (error) {
      console.error('❌ Error starting worker:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to start worker',
        error: error.message
      });
    }
  }
  
  /**
   * POST /worker/stop
   */
  async stopWorker(req, res) {
    try {
      notificationWorker.stop();
      
      res.status(200).json({
        success: true,
        message: 'Notification worker stopped',
        status: 'stopped'
      });
      
    } catch (error) {
      console.error('❌ Error stopping worker:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to stop worker',
        error: error.message
      });
    }
  }
  
  /**
   * GET /worker/status
   */
  async getWorkerStatus(req, res) {
    try {
      const status = await notificationWorker.getStatus();
      
      res.status(200).json({
        success: true,
        worker: status
      });
      
    } catch (error) {
      console.error('❌ Error getting worker status:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get worker status',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();