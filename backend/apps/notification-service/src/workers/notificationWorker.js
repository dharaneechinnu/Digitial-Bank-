/**
 * Notification Queue Worker - Redis Event Consumer
 * Processes notification events from Redis queue and sends emails
 */

console.log('DEBUG: Starting notificationWorker.js');
console.log('DEBUG: Current working directory:', process.cwd());
console.log('DEBUG: __dirname:', __dirname);

let redis;
try {
  console.log('DEBUG: Attempting to require redis...');
  redis = require('/shared/db/redis');
  console.log('DEBUG: Redis required successfully');
} catch (error) {
  console.log('DEBUG: Redis require failed:', error.message);
  console.log('DEBUG: Error stack:', error.stack);
  throw error;
}
const EmailService = require('../services/emailService');
const EmailTemplates = require('../services/emailTemplates');
const Notification = require('../models/notification');

class NotificationWorker {
  
  constructor() {
    this.isRunning = false;
    this.processingInterval = null;
    this.queueKey = 'notification_queue';
    this.processIntervalMs = 5000; // Process every 5 seconds
    this.maxBatchSize = 5; // Process up to 5 notifications at a time
  }
  
  /**
   * Start the notification worker
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Notification worker is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Starting notification worker...');
    
    // Start processing loop
    this.processingInterval = setInterval(() => {
      this.processNotificationQueue();
    }, this.processIntervalMs);
    
    // Process immediately on start
    this.processNotificationQueue();
  }
  
  /**
   * Stop the notification worker
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Notification worker is not running');
      return;
    }
    
    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    console.log('📴 Notification worker stopped');
  }
  
  /**
   * Process notification queue from Redis
   */
  async processNotificationQueue() {
    if (!this.isRunning) return;
    
    try {
      // Get multiple notifications from queue (batch processing)
      const notifications = [];
      
      for (let i = 0; i < this.maxBatchSize; i++) {
        const notificationData = await redis.client.rpop(this.queueKey);
        
        if (!notificationData) {
          break; // Queue is empty
        }
        
        try {
          const notification = JSON.parse(notificationData);
          notifications.push(notification);
        } catch (parseError) {
          console.error('❌ Failed to parse notification data:', parseError.message);
          console.error('Invalid data:', notificationData);
        }
      }
      
      if (notifications.length === 0) {
        return; // No notifications to process
      }
      
      console.log(`📥 Processing ${notifications.length} notifications from queue`);
      
      // Process each notification
      for (const notification of notifications) {
        await this.processNotification(notification);
      }
      
    } catch (error) {
      console.error('❌ Error processing notification queue:', error.message);
    }
  }
  
  /**
   * Process a single notification
   * @param {Object} notification - Notification event data
   */
  async processNotification(notification) {
    try {
      console.log(`📧 Processing ${notification.type} notification for user ${notification.user_id}`);
      
      // Check for duplicate processing
      const existingNotification = await Notification.findOne({
        event_id: notification.id
      });
      
      if (existingNotification) {
        console.log(`⚠️ Notification ${notification.id} already processed, skipping...`);
        return;
      }
      
      // Generate email template
      const templateData = this.prepareTemplateData(notification);
      const emailTemplate = EmailTemplates.getTemplate(notification.type, templateData);
      
      // Prepare email data
      const emailData = {
        to: notification.email,
        subject: emailTemplate.subject,
        body: emailTemplate.body,
        type: notification.type,
        user_id: notification.user_id,
        metadata: notification.metadata,
        template_used: notification.type.toLowerCase(),
        event_id: notification.id
      };
      
      // Send email
      const result = await EmailService.sendEmail(emailData);
      
      console.log(`✅ Email sent successfully: ${notification.type} to ${notification.email}`);
      
    } catch (error) {
      console.error(`❌ Failed to process notification ${notification.id}:`, error.message);
      
      // Handle retryable errors - put back in queue with delay
      if (this.isRetryableError(error) && notification.retry_count < 3) {
        await this.scheduleRetry(notification);
      }
    }
  }
  
  /**
   * Prepare template data from notification
   * @param {Object} notification - Notification event
   * @returns {Object} - Template data
   */
  prepareTemplateData(notification) {
    const baseData = {
      full_name: notification.full_name,
      email: notification.email,
      timestamp: notification.timestamp
    };
    
    // Add type-specific data
    switch (notification.type) {
      case 'USER_REGISTRATION':
        return {
          ...baseData,
          registration_date: new Date(notification.metadata.registration_date).toLocaleDateString('en-IN')
        };
        
      case 'LOGIN_ALERT':
        return {
          ...baseData,
          login_time: new Date(notification.metadata.login_time).toLocaleString('en-IN'),
          ip_address: notification.metadata.ip_address,
          user_agent: notification.metadata.user_agent
        };
        
      case 'KYC_PENDING':
        return {
          ...baseData,
          registration_date: new Date(notification.metadata.registration_date).toLocaleDateString('en-IN')
        };
        
      case 'KYC_VERIFIED':
      case 'KYC_REJECTED':
        return {
          ...baseData,
          reason: notification.metadata.reason || ''
        };
        
      default:
        return baseData;
    }
  }
  
  /**
   * Check if error is retryable
   * @param {Error} error - Error object
   * @returns {Boolean} - Is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEOUT',
      'Network',
      'timeout',
      'connection',
      'rate limit'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryError => 
      errorMessage.includes(retryError.toLowerCase())
    );
  }
  
  /**
   * Schedule notification retry
   * @param {Object} notification - Notification to retry
   */
  async scheduleRetry(notification) {
    try {
      notification.retry_count = (notification.retry_count || 0) + 1;
      
      // Exponential backoff: 5min, 15min, 30min
      const delayMinutes = [5, 15, 30][notification.retry_count - 1] || 30;
      const delayMs = delayMinutes * 60 * 1000;
      
      console.log(`⏰ Scheduling retry ${notification.retry_count}/3 for ${notification.id} in ${delayMinutes} minutes`);
      
      // Put back in queue after delay
      setTimeout(async () => {
        try {
          await redis.client.lpush(this.queueKey, JSON.stringify(notification));
          console.log(`🔄 Notification ${notification.id} queued for retry`);
        } catch (retryError) {
          console.error('❌ Failed to schedule retry:', retryError.message);
        }
      }, delayMs);
      
    } catch (error) {
      console.error('❌ Failed to schedule retry:', error.message);
    }
  }
  
  /**
   * Get worker status and statistics
   */
  async getStatus() {
    try {
      const queueLength = await redis.client.llen(this.queueKey);
      
      // Get recent notification stats
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const dailyStats = await Notification.aggregate([
        {
          $match: {
            createdAt: { $gte: oneDayAgo }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        worker_status: this.isRunning ? 'running' : 'stopped',
        queue_length: queueLength,
        process_interval_ms: this.processIntervalMs,
        max_batch_size: this.maxBatchSize,
        daily_stats: dailyStats
      };
      
    } catch (error) {
      console.error('❌ Failed to get worker status:', error.message);
      return {
        worker_status: this.isRunning ? 'running' : 'stopped',
        error: error.message
      };
    }
  }
  
  /**
   * Process retry notifications (for failed notifications)
   */
  async processRetries() {
    try {
      console.log('🔄 Processing retry notifications...');
      
      const retryNotifications = await Notification.find({
        status: 'RETRYING',
        retry_after: { $lte: new Date() },
        retry_count: { $lt: 3 }
      }).limit(this.maxBatchSize);
      
      for (const notification of retryNotifications) {
        // Convert to queue format and reprocess
        const queueData = {
          id: notification.event_id,
          type: notification.type,
          user_id: notification.user_id,
          email: notification.email,
          full_name: notification.metadata.full_name || 'User',
          metadata: notification.metadata,
          retry_count: notification.retry_count
        };
        
        await this.processNotification(queueData);
      }
      
    } catch (error) {
      console.error('❌ Error processing retries:', error.message);
    }
  }
}

// Create singleton worker instance
const notificationWorker = new NotificationWorker();

module.exports = notificationWorker;