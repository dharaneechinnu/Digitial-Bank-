/**
 * Ledger Controller
 */
const LedgerModel = require('../models/ledgerModel');

class LedgerController {
  
  static async createEntry(req, res) {
    try {
      console.log('📖 Creating new ledger entry:', req.body);
      const entry = await LedgerModel.create(req.body);
      console.log('✅ Ledger entry created successfully:', entry.id);
      res.status(201).json({
        success: true,
        message: 'Ledger entry created successfully',
        data: entry
      });
    } catch (error) {
      console.error('❌ Error creating ledger entry:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create ledger entry',
        error: error.message
      });
    }
  }

  static async getEntry(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Fetching ledger entry:', id);
      const entry = await LedgerModel.findById(id);
      if (!entry) {
        console.log('❌ Ledger entry not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Ledger entry not found'
        });
      }
      console.log('✅ Ledger entry fetched successfully:', entry.id);
      res.status(200).json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('❌ Error fetching ledger entry:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ledger entry',
        error: error.message
      });
    }
  }

  static async getAccountEntries(req, res) {
    try {
      const { accountId } = req.params;
      console.log('🔍 Fetching ledger entries for account:', accountId);
      const entries = await LedgerModel.findByAccountId(accountId);
      console.log('✅ Found', entries.length, 'ledger entries for account:', accountId);
      res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      console.error('❌ Error fetching account ledger entries:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account ledger entries',
        error: error.message
      });
    }
  }

  static async getTransactionEntries(req, res) {
    try {
      const { transactionId } = req.params;
      console.log('🔍 Fetching ledger entries for transaction:', transactionId);
      const entries = await LedgerModel.findByTransactionId(transactionId);
      console.log('✅ Found', entries.length, 'ledger entries for transaction:', transactionId);
      res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      console.error('❌ Error fetching transaction ledger entries:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction ledger entries',
        error: error.message
      });
    }
  }

  static async getAccountBalance(req, res) {
    try {
      const { accountId } = req.params;
      console.log('💰 Getting balance for account:', accountId);
      const balance = await LedgerModel.getAccountBalance(accountId);
      console.log('✅ Account balance retrieved:', accountId, '- Balance:', balance);
      res.status(200).json({
        success: true,
        data: { accountId, balance }
      });
    } catch (error) {
      console.error('❌ Error getting account balance:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get account balance',
        error: error.message
      });
    }
  }

}

module.exports = LedgerController;