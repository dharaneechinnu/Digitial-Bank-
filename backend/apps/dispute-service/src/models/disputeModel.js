/**
 * Dispute Model using Mongoose
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const disputeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  reason: {
    type: String,
    enum: ['unauthorized', 'fraud', 'duplicate', 'amount_error', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'rejected', 'closed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  resolution: {
    type: String,
    trim: true
  },
  resolvedBy: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Dispute = mongoose.model('Dispute', disputeSchema);

class DisputeModel {
  static async create(data) {
    try {
      const dispute = new Dispute({...data, _id: uuidv4()});
      const saved = await dispute.save();
      const result = saved.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const dispute = await Dispute.findById(id).lean();
      if (!dispute) return null;
      dispute.id = dispute._id;
      return dispute;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const disputes = await Dispute.find({ userId }).lean();
      return disputes.map(dispute => {
        dispute.id = dispute._id;
        return dispute;
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const dispute = await Dispute.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean();
      if (!dispute) return null;
      dispute.id = dispute._id;
      return dispute;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DisputeModel;