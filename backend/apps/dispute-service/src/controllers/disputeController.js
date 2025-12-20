/**
 * Dispute Controller
 */
const DisputeModel = require('../models/disputeModel');

class DisputeController {
  
  static async createDispute(req, res) {
    try {
      console.log('⚖️ Creating new dispute:', req.body);
      const dispute = await DisputeModel.create(req.body);
      console.log('✅ Dispute created:', dispute.id);
      res.status(201).json({
        success: true,
        message: 'Dispute created successfully',
        data: dispute
      });
    } catch (error) {
      console.error('❌ Error creating dispute:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create dispute',
        error: error.message
      });
    }
  }

  static async getDispute(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Fetching dispute:', id);
      const dispute = await DisputeModel.findById(id);
      if (!dispute) {
        console.log('❌ Dispute not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Dispute not found'
        });
      }
      console.log('✅ Dispute fetched:', dispute.id);
      res.status(200).json({
        success: true,
        data: dispute
      });
    } catch (error) {
      console.error('❌ Error fetching dispute:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dispute',
        error: error.message
      });
    }
  }

  static async getUserDisputes(req, res) {
    try {
      const { userId } = req.params;
      console.log('🔍 Fetching disputes for user:', userId);
      const disputes = await DisputeModel.findByUserId(userId);
      console.log('✅ Found', disputes.length, 'disputes for user:', userId);
      res.status(200).json({
        success: true,
        data: disputes
      });
    } catch (error) {
      console.error('❌ Error fetching user disputes:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user disputes',
        error: error.message
      });
    }
  }

  static async updateDispute(req, res) {
    try {
      const { id } = req.params;
      console.log('📝 Updating dispute:', id, req.body);
      const dispute = await DisputeModel.updateById(id, req.body);
      if (!dispute) {
        console.log('❌ Dispute not found for update:', id);
        return res.status(404).json({
          success: false,
          message: 'Dispute not found'
        });
      }
      console.log('✅ Dispute updated:', dispute.id);
      res.status(200).json({
        success: true,
        message: 'Dispute updated successfully',
        data: dispute
      });
    } catch (error) {
      console.error('❌ Error updating dispute:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update dispute',
        error: error.message
      });
    }
  }

  static async resolveDispute(req, res) {
    try {
      const { id } = req.params;
      const { resolution, resolvedBy } = req.body;
      console.log('✅ Resolving dispute:', id);
      const dispute = await DisputeModel.updateById(id, {
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date()
      });
      console.log('✅ Dispute resolved:', dispute?.id);
      res.status(200).json({
        success: true,
        message: 'Dispute resolved successfully',
        data: dispute
      });
    } catch (error) {
      console.error('❌ Error resolving dispute:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve dispute',
        error: error.message
      });
    }
  }

}

module.exports = DisputeController;