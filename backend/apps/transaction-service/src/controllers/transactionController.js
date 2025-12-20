/**
 * Transaction Controller
 */
const TransactionModel = require('../models/transactionModel');

class TransactionController {
  
  static async createTransaction(req, res) {
    try {
      console.log('💸 Creating new transaction:', req.body);
      const transaction = await TransactionModel.create(req.body);
      console.log('✅ Transaction created successfully:', transaction.id);
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      console.error('❌ Error creating transaction:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message
      });
    }
  }

  static async getTransaction(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Fetching transaction:', id);
      const transaction = await TransactionModel.findById(id);
      if (!transaction) {
        console.log('❌ Transaction not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      console.log('✅ Transaction fetched successfully:', transaction.id);
      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('❌ Error fetching transaction:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
        error: error.message
      });
    }
  }

  static async getAccountTransactions(req, res) {
    try {
      const { accountId } = req.params;
      console.log('🔍 Fetching transactions for account:', accountId);
      const transactions = await TransactionModel.findByAccountId(accountId);
      console.log('✅ Found', transactions.length, 'transactions for account:', accountId);
      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('❌ Error fetching account transactions:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account transactions',
        error: error.message
      });
    }
  }

  static async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      console.log('📝 Updating transaction:', id, req.body);
      const transaction = await TransactionModel.updateById(id, req.body);
      if (!transaction) {
        console.log('❌ Transaction not found for update:', id);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      console.log('✅ Transaction updated successfully:', transaction.id);
      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction
      });
    } catch (error) {
      console.error('❌ Error updating transaction:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
        error: error.message
      });
    }
  }

  static async processTransaction(req, res) {
    try {
      const { id } = req.params;
      console.log('⚡ Processing transaction:', id);
      const transaction = await TransactionModel.updateById(id, { status: 'processing' });
      if (!transaction) {
        console.log('❌ Transaction not found for processing:', id);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      console.log('✅ Transaction processing initiated:', transaction.id);
      res.status(200).json({
        success: true,
        message: 'Transaction processing initiated',
        data: transaction
      });
    } catch (error) {
      console.error('❌ Error processing transaction:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to process transaction',
        error: error.message
      });
    }
  }

}

module.exports = TransactionController;