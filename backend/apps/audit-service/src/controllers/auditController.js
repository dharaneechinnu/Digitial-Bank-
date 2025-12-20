/**
 * Audit Controller
 */
const AuditModel = require('../models/auditModel');

class AuditController {
  
  static async createAuditLog(req, res) {
    try {
      console.log('📋 Creating audit log:', req.body);
      const auditLog = await AuditModel.create(req.body);
      console.log('✅ Audit log created:', auditLog.id);
      res.status(201).json({
        success: true,
        message: 'Audit log created successfully',
        data: auditLog
      });
    } catch (error) {
      console.error('❌ Error creating audit log:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create audit log',
        error: error.message
      });
    }
  }

  static async getAuditLog(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 Fetching audit log:', id);
      const auditLog = await AuditModel.findById(id);
      if (!auditLog) {
        console.log('❌ Audit log not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        });
      }
      console.log('✅ Audit log fetched:', auditLog.id);
      res.status(200).json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      console.error('❌ Error fetching audit log:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log',
        error: error.message
      });
    }
  }

  static async getUserAuditLogs(req, res) {
    try {
      const { userId } = req.params;
      console.log('🔍 Fetching audit logs for user:', userId);
      const logs = await AuditModel.findByUserId(userId);
      console.log('✅ Found', logs.length, 'audit logs for user:', userId);
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('❌ Error fetching user audit logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user audit logs',
        error: error.message
      });
    }
  }

  static async getResourceAuditLogs(req, res) {
    try {
      const { resource, resourceId } = req.params;
      console.log('🔍 Fetching audit logs for resource:', resource, resourceId);
      const logs = await AuditModel.findByResource(resource, resourceId);
      console.log('✅ Found', logs.length, 'audit logs for resource:', resource, resourceId);
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('❌ Error fetching resource audit logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resource audit logs',
        error: error.message
      });
    }
  }

}

module.exports = AuditController;