/**
 * Notification Queue Service - Redis Event Publisher
 * Publishes notification events to Redis for async processing
 */

const redis = require('../../../shared/db/redis');

class NotificationQueueService {
  
  /**
   * Send notification event to Redis queue
   * @param {Object} eventData - Notification event data
   * @param {String} eventData.type - Type of notification (registration, login, kyc_pending, etc.)
   * @param {String} eventData.user_id - User ID
   * @param {String} eventData.email - User email
   * @param {String} eventData.full_name - User full name
   * @param {Object} eventData.metadata - Additional event metadata
   */
  static async publishNotificationEvent(eventData) {
    try {
      // Create notification event with timestamp and unique ID
      const notificationEvent = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: eventData.type,
        user_id: eventData.user_id,
        email: eventData.email,
        full_name: eventData.full_name,
        metadata: eventData.metadata || {},
        timestamp: new Date().toISOString(),
        status: 'PENDING'
      };
      
      // Add to Redis list (queue) for processing
      const queueKey = 'notification_queue';
      await redis.client.lpush(queueKey, JSON.stringify(notificationEvent));
      
      console.log(`📩 Notification event published: ${eventData.type} for user ${eventData.user_id}`);
      
      return notificationEvent.id;
    } catch (error) {
      console.error('❌ Failed to publish notification event:', error.message);
      throw new Error('Notification publishing failed');
    }
  }
  
  /**
   * Send user registration notification
   * @param {Object} user - User object
   */
  static async sendRegistrationNotification(user) {
    try {
      await this.publishNotificationEvent({
        type: 'USER_REGISTRATION',
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        metadata: {
          registration_date: user.createdAt,
          kyc_status: user.kyc_status
        }
      });
    } catch (error) {
      console.error('❌ Failed to send registration notification:', error.message);
    }
  }
  
  /**
   * Send login alert notification
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information (IP, user agent, etc.)
   */
  static async sendLoginAlert(user, loginInfo = {}) {
    try {
      await this.publishNotificationEvent({
        type: 'LOGIN_ALERT',
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        metadata: {
          login_time: new Date().toISOString(),
          ip_address: loginInfo.ip_address,
          user_agent: loginInfo.user_agent,
          device_type: loginInfo.device_type || 'unknown'
        }
      });
    } catch (error) {
      console.error('❌ Failed to send login alert:', error.message);
    }
  }
  
  /**
   * Send KYC pending reminder notification
   * @param {Object} user - User object
   */
  static async sendKycPendingNotification(user) {
    try {
      await this.publishNotificationEvent({
        type: 'KYC_PENDING',
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        metadata: {
          kyc_status: user.kyc_status,
          account_status: user.account_status,
          registration_date: user.createdAt
        }
      });
    } catch (error) {
      console.error('❌ Failed to send KYC pending notification:', error.message);
    }
  }
  
  /**
   * Send KYC status update notification (future ready)
   * @param {Object} user - User object
   * @param {String} newStatus - New KYC status (VERIFIED/REJECTED)
   * @param {String} reason - Reason for status change
   */
  static async sendKycStatusUpdate(user, newStatus, reason = '') {
    try {
      await this.publishNotificationEvent({
        type: `KYC_${newStatus}`,
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        metadata: {
          old_status: user.kyc_status,
          new_status: newStatus,
          reason: reason,
          updated_date: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Failed to send KYC status update notification:', error.message);
    }
  }
  
  /**
   * Send account activation notification (future ready)
   * @param {Object} user - User object
   */
  static async sendAccountActivationNotification(user) {
    try {
      await this.publishNotificationEvent({
        type: 'ACCOUNT_ACTIVATED',
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        metadata: {
          activation_date: new Date().toISOString(),
          account_status: user.account_status,
          kyc_status: user.kyc_status
        }
      });
    } catch (error) {
      console.error('❌ Failed to send account activation notification:', error.message);
    }
  }
  
  /**
   * Send security alert notification
   * @param {Object} user - User object
   * @param {String} alertType - Type of security alert
   * @param {Object} details - Alert details
   */
  static async sendSecurityAlert(user, alertType, details = {}) {
    try {
      await this.publishNotificationEvent({
        type: 'SECURITY_ALERT',
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        metadata: {
          alert_type: alertType,
          details: details,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Failed to send security alert:', error.message);
    }
  }
  
  /**
   * Get queue length (monitoring)
   * @returns {Number} - Number of pending notifications
   */
  static async getQueueLength() {
    try {
      const queueKey = 'notification_queue';
      return await redis.client.llen(queueKey);
    } catch (error) {
      console.error('❌ Failed to get queue length:', error.message);
      return 0;
    }
  }
  
  /**
   * Clear all notifications from queue (admin operation)
   */
  static async clearQueue() {
    try {
      const queueKey = 'notification_queue';
      const cleared = await redis.client.del(queueKey);
      console.log(`🗑️ Notification queue cleared. Removed ${cleared} items`);
      return cleared;
    } catch (error) {
      console.error('❌ Failed to clear queue:', error.message);
      throw new Error('Queue clear operation failed');
    }
  }
}

module.exports = NotificationQueueService;