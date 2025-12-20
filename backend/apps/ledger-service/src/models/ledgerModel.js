/**
 * Ledger Model using Mongoose
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Ledger Entry Schema
const ledgerSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction'
  },
  accountId: {
    type: String,
    required: true,
    ref: 'Account'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  reference: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const LedgerEntry = mongoose.model('LedgerEntry', ledgerSchema);

class LedgerModel {
  static async create(ledgerData) {
    try {
      const entry = new LedgerEntry({
        ...ledgerData,
        _id: uuidv4()
      });
      const savedEntry = await entry.save();
      const result = savedEntry.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const entry = await LedgerEntry.findById(id).lean();
      if (!entry) return null;
      entry.id = entry._id;
      return entry;
    } catch (error) {
      throw error;
    }
  }

  static async findByAccountId(accountId) {
    try {
      const entries = await LedgerEntry.find({ accountId }).sort({ created_at: -1 }).lean();
      return entries.map(entry => {
        entry.id = entry._id;
        return entry;
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByTransactionId(transactionId) {
    try {
      const entries = await LedgerEntry.find({ transactionId }).lean();
      return entries.map(entry => {
        entry.id = entry._id;
        return entry;
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAccountBalance(accountId) {
    try {
      const latestEntry = await LedgerEntry.findOne({ accountId }).sort({ created_at: -1 }).lean();
      return latestEntry ? latestEntry.balance : 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LedgerModel;