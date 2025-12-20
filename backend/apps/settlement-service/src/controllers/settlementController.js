/**
 * Settlement Controller
 */
const SettlementModel = require('../models/settlementModel');

class SettlementController {
  
  static async createSettlement(req, res) {
    try {
      console.log('🏛️ Creating settlement batch:', req.body);
      const settlement = await SettlementModel.create(req.body);
      console.log('✅ Settlement batch created:', settlement.id);
      res.status(201).json({
        success: true,
        message: 'Settlement batch created successfully',
        data: settlement
      });
    } catch (error) {
      console.error('❌ Error creating settlement:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create settlement',
        error: error.message
      });
    }
  }

  static async getSettlement(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Fetching settlement:', id);
      const settlement = await SettlementModel.findById(id);
      if (!settlement) {
        console.log('❌ Settlement not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Settlement not found'
        });
      }
      console.log('✅ Settlement fetched:', settlement.id);
      res.status(200).json({
        success: true,
        data: settlement
      });
    } catch (error) {
      console.error('❌ Error fetching settlement:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settlement',
        error: error.message
      });
    }
  }

  static async processSettlement(req, res) {
    try {
      const { id } = req.params;
      console.log('⚡ Processing settlement:', id);
      const settlement = await SettlementModel.updateById(id, { 
        status: 'processing',
        settlementDate: new Date()
      });
      console.log('✅ Settlement processing initiated:', settlement?.id);
      res.status(200).json({
        success: true,
        message: 'Settlement processing initiated',
        data: settlement
      });
    } catch (error) {
      console.error('❌ Error processing settlement:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to process settlement',
        error: error.message
      });
    }
  }

}

module.exports = SettlementController;