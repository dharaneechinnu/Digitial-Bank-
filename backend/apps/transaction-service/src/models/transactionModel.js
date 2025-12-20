/**
 * Transaction Model using Mongoose
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  fromAccountId: {
    type: String,
    required: true,
    ref: 'Account'
  },
  toAccountId: {
    type: String,
    required: true,
    ref: 'Account'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  type: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal', 'payment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    unique: true,
    default: uuidv4
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Transaction = mongoose.model('Transaction', transactionSchema);

class TransactionModel {
  static async create(transactionData) {
    try {
      const transaction = new Transaction({
        ...transactionData,
        _id: uuidv4()
      });
      const savedTransaction = await transaction.save();
      const result = savedTransaction.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const transaction = await Transaction.findById(id).lean();
      if (!transaction) return null;
      transaction.id = transaction._id;
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async findByAccountId(accountId) {
    try {
      const transactions = await Transaction.find({
        $or: [
          { fromAccountId: accountId },
          { toAccountId: accountId }
        ]
      }).lean();
      return transactions.map(transaction => {
        transaction.id = transaction._id;
        return transaction;
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean();
      if (!transaction) return null;
      transaction.id = transaction._id;
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      const result = await Transaction.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransactionModel;