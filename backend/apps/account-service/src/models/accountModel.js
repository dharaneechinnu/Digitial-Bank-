/**
 * Account Model using Mongoose
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Account Schema
const accountSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    enum: ['savings', 'checking', 'business'],
    default: 'savings'
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'frozen', 'closed'],
    default: 'active'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Account = mongoose.model('Account', accountSchema);

class AccountModel {
  static async create(accountData) {
    try {
      const account = new Account({
        ...accountData,
        _id: uuidv4()
      });
      const savedAccount = await account.save();
      const result = savedAccount.toObject();
      result.id = result._id;
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const account = await Account.findById(id).lean();
      if (!account) return null;
      account.id = account._id;
      return account;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const accounts = await Account.find({ userId }).lean();
      return accounts.map(account => {
        account.id = account._id;
        return account;
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      const account = await Account.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean();
      if (!account) return null;
      account.id = account._id;
      return account;
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      const result = await Account.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AccountModel;