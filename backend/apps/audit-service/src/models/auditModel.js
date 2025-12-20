/**
 * Audit Model using Mongoose
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const auditSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: String,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const AuditLog = mongoose.model('AuditLog', auditSchema);

class AuditModel {
  static async create(data) {
    try {
      const auditLog = new AuditLog({...data, _id: uuidv4()});
      const saved = await auditLog.save();
      const result = saved.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const auditLog = await AuditLog.findById(id).lean();
      if (!auditLog) return null;
      auditLog.id = auditLog._id;
      return auditLog;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const logs = await AuditLog.find({ userId }).sort({ created_at: -1 }).lean();
      return logs.map(log => {
        log.id = log._id;
        return log;
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByResource(resource, resourceId) {
    try {
      const logs = await AuditLog.find({ resource, resourceId }).sort({ created_at: -1 }).lean();
      return logs.map(log => {
        log.id = log._id;
        return log;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuditModel;