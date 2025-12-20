/**
 * Settlement Model using Mongoose
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const settlementSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  transactionIds: [{
    type: String,
    ref: 'Transaction'
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  bankReference: {
    type: String
  },
  settlementDate: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Settlement = mongoose.model('Settlement', settlementSchema);

class SettlementModel {
  static async create(data) {
    try {
      const settlement = new Settlement({...data, _id: uuidv4()});
      const saved = await settlement.save();
      const result = saved.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const settlement = await Settlement.findById(id).lean();
      if (!settlement) return null;
      settlement.id = settlement._id;
      return settlement;
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const settlement = await Settlement.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean();
      if (!settlement) return null;
      settlement.id = settlement._id;
      return settlement;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SettlementModel;