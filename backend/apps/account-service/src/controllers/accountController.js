/**
 * Account Controller
 */
const AccountModel = require('../models/accountModel');

class AccountController {
  
  static async createAccount(req, res) {
    try {
      console.log('🏦 Creating new account:', req.body);
      const account = await AccountModel.create(req.body);
      console.log('✅ Account created successfully:', account.id);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account
      });
    } catch (error) {
      console.error('❌ Error creating account:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create account',
        error: error.message
      });
    }
  }

  static async getAccount(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Fetching account:', id);
      const account = await AccountModel.findById(id);
      if (!account) {
        console.log('❌ Account not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }
      console.log('✅ Account fetched successfully:', account.id);
      res.status(200).json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('❌ Error fetching account:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account',
        error: error.message
      });
    }
  }

  static async getUserAccounts(req, res) {
    try {
      const { userId } = req.params;
      console.log('🔍 Fetching accounts for user:', userId);
      const accounts = await AccountModel.findByUserId(userId);
      console.log('✅ Found', accounts.length, 'accounts for user:', userId);
      res.status(200).json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('❌ Error fetching user accounts:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user accounts',
        error: error.message
      });
    }
  }

  static async updateAccount(req, res) {
    try {
      const { id } = req.params;
      console.log('📝 Updating account:', id, req.body);
      const account = await AccountModel.updateById(id, req.body);
      if (!account) {
        console.log('❌ Account not found for update:', id);
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }
      console.log('✅ Account updated successfully:', account.id);
      res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: account
      });
    } catch (error) {
      console.error('❌ Error updating account:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update account',
        error: error.message
      });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Deleting account:', id);
      const deleted = await AccountModel.deleteById(id);
      if (!deleted) {
        console.log('❌ Account not found for deletion:', id);
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }
      console.log('✅ Account deleted successfully:', id);
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting account:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: error.message
      });
    }
  }

}

module.exports = AccountController;