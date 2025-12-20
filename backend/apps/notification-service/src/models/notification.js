/**
 * Notification Model - Email Notification Tracking
 * Tracks all email notifications sent by the system
 */

const mongoose = require('mongoose');

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    index: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'USER_REGISTRATION',
      'LOGIN_ALERT',
      'KYC_PENDING',
      'KYC_VERIFIED',
      'KYC_REJECTED',
      'ACCOUNT_ACTIVATED',
      'ACCOUNT_BLOCKED',
      'PASSWORD_RESET',
      'SECURITY_ALERT',
      'TRANSACTION_ALERT'
    ],
    uppercase: true,
    index: true
  },
  
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  body: {
    type: String,
    required: [true, 'Email body is required'],
    maxlength: [10000, 'Email body cannot exceed 10,000 characters']
  },
  
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED', 'RETRYING'],
    default: 'PENDING',
    uppercase: true,
    index: true
  },
  
  // Email provider response
  provider_response: {
    message_id: {
      type: String,
      default: null
    },
    response: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  },
  
  // Retry mechanism
  retry_count: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  
  retry_after: {
    type: Date,
    default: null
  },
  
  // Metadata for personalization
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Email details
  template_used: {
    type: String,
    trim: true,
    default: null
  },
  
  sent_at: {
    type: Date,
    default: null
  },
  
  failed_at: {
    type: Date,
    default: null
  },
  
  // Event tracking ID for deduplication
  event_id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'notifications'
});

// Indexes for performance
notificationSchema.index({ user_id: 1, type: 1 });
notificationSchema.index({ status: 1, createdAt: 1 });
notificationSchema.index({ type: 1, createdAt: 1 });
notificationSchema.index({ sent_at: 1 });
notificationSchema.index({ retry_after: 1 });

// Instance method to mark as sent
notificationSchema.methods.markAsSent = function(providerResponse = {}) {
  this.status = 'SENT';
  this.sent_at = new Date();
  this.provider_response = {
    message_id: providerResponse.messageId || null,
    response: providerResponse.response || null,
    error: null
  };
  return this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = function(error, shouldRetry = false) {
  this.status = shouldRetry ? 'RETRYING' : 'FAILED';
  this.failed_at = new Date();
  this.provider_response.error = error;
  
  if (shouldRetry) {
    this.retry_count += 1;
    // Exponential backoff: 5min, 15min, 30min
    const backoffMinutes = [5, 15, 30][this.retry_count - 1] || 30;
    this.retry_after = new Date(Date.now() + backoffMinutes * 60 * 1000);
  }
  
  return this.save();
};

// Static method to get pending notifications for processing
notificationSchema.statics.getPendingNotifications = function(limit = 10) {
  return this.find({
    $or: [
      { status: 'PENDING' },
      { 
        status: 'RETRYING',
        retry_after: { $lte: new Date() }
      }
    ]
  })
  .sort({ createdAt: 1 })
  .limit(limit);
};

// Pre-save middleware for event deduplication
notificationSchema.pre('save', function(next) {
  // Generate event_id if not provided (for deduplication)
  if (this.isNew && !this.event_id) {
    this.event_id = `${this.type}_${this.user_id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

// Export the Notification model
module.exports = mongoose.model('Notification', notificationSchema);