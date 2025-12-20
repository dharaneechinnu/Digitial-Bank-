/**
 * Email Service - Bank Grade Email Sending
 * Handles all email sending using nodemailer with professional templates
 */

const nodemailer = require('nodemailer');
const Notification = require('../models/notification');

class EmailService {
  
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }
  
  /**
   * Initialize nodemailer transporter
   */
  initializeTransporter() {
    try {
      // SMTP configuration from environment variables
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      // Create transporter using correct nodemailer API
      this.transporter = nodemailer.createTransport(smtpConfig);

      // Only verify SMTP connection if credentials are provided
      const hasAuth = smtpConfig.auth && smtpConfig.auth.user && smtpConfig.auth.pass;
      if (hasAuth) {
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ SMTP connection failed:', error.message);
            this.isConfigured = false;
          } else {
            console.log('✅ SMTP connection verified successfully');
            this.isConfigured = true;
          }
        });
      } else {
        console.warn('⚠️ SMTP credentials not provided; email sending disabled in this environment');
        this.isConfigured = false;
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error.message);
      this.isConfigured = false;
    }
  }
  
  /**
   * Send email and save notification record
   * @param {Object} emailData - Email data
   * @param {String} emailData.to - Recipient email
   * @param {String} emailData.subject - Email subject
   * @param {String} emailData.body - Email body (HTML)
   * @param {String} emailData.type - Notification type
   * @param {String} emailData.user_id - User ID
   * @param {Object} emailData.metadata - Additional metadata
   */
  async sendEmail(emailData) {
    let notification;
    try {
      if (!this.isConfigured) {
        throw new Error('Email service is not configured properly');
      }
      
      // Create notification record first
      notification = new Notification({
        user_id: emailData.user_id,
        email: emailData.to,
        type: emailData.type,
        subject: emailData.subject,
        body: emailData.body,
        metadata: emailData.metadata || {},
        template_used: emailData.template_used || null,
        event_id: emailData.event_id || null
      });
      
      await notification.save();
      
      // Prepare email options
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME || 'FinTech Bank'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.body,
        // Add text version for better deliverability
        text: this.htmlToText(emailData.body)
      };
      
      console.log(`📧 Sending email: ${emailData.type} to ${emailData.to}`);
      
      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      
      // Mark notification as sent
      await notification.markAsSent({
        messageId: result.messageId,
        response: result.response || 'Email sent successfully'
      });
      
      // If using Ethereal in development, log the preview URL
      try {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        if (previewUrl) {
          console.log(`✅ Email sent (preview): ${previewUrl}`);
        } else {
          console.log(`✅ Email sent successfully: ${result.messageId}`);
        }
      } catch (e) {
        console.log(`✅ Email sent successfully: ${result.messageId}`);
      }
      
      return {
        success: true,
        messageId: result.messageId,
        notificationId: notification._id
      };
      
    } catch (error) {
      console.error(`❌ Email sending failed: ${error.message}`);
      
      // Mark notification as failed if it exists
      if (notification && notification._id) {
        const shouldRetry = this.shouldRetryError(error);
        await notification.markAsFailed(error.message, shouldRetry);
      }
      
      throw error;
    }
  }
  
  /**
   * Determine if error should trigger retry
   * @param {Error} error - The error object
   * @returns {Boolean} - Should retry
   */
  shouldRetryError(error) {
    const retryableErrors = [
      'ECONNREFUSED',
      'ENOTFOUND', 
      'ETIMEOUT',
      'Network',
      'timeout',
      'connection'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryError => 
      errorMessage.includes(retryError.toLowerCase())
    );
  }
  
  /**
   * Convert HTML to plain text (basic implementation)
   * @param {String} html - HTML content
   * @returns {String} - Plain text
   */
  htmlToText(html) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .trim();
  }
  
  /**
   * Get email service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      smtp_host: process.env.SMTP_HOST || 'not configured',
      smtp_port: process.env.SMTP_PORT || 'not configured',
      from_email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'not configured'
    };
  }
  
  /**
   * Test email configuration by sending test email
   */
  async testConfiguration() {
    try {
      if (!this.isConfigured) {
        throw new Error('Email service not configured');
      }
      
      const testEmail = {
        from: `${process.env.SMTP_FROM_NAME || 'FinTech Bank'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: process.env.TEST_EMAIL || process.env.SMTP_USER,
        subject: 'FinTech Bank - Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email from FinTech Bank notification service.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        text: 'Email Service Test - This is a test email from FinTech Bank notification service.'
      };
      
      const result = await this.transporter.sendMail(testEmail);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Test email sent successfully'
      };
      
    } catch (error) {
      throw new Error(`Test email failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;