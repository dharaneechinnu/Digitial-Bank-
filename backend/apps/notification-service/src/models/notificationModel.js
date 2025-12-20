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
 

const Notification = mongoose.model('Notification', notificationSchema);

class NotificationModel {
  static async create(data) {
    try {
      const notification = new Notification({...data, _id: uuidv4()});
      const saved = await notification.save();
      const result = saved.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const notification = await Notification.findById(id).lean();
      if (!notification) return null;
      notification.id = notification._id;
      return notification;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const notifications = await Notification.find({ userId }).sort({ created_at: -1 }).lean();
      return notifications.map(notification => {
        notification.id = notification._id;
        return notification;
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const notification = await Notification.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean();
      if (!notification) return null;
      notification.id = notification._id;
      return notification;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotificationModel;