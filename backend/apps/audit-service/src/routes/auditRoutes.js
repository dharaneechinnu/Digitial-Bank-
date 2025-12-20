/**
 * Audit Routes
 */
const express = require('express');
const AuditController = require('../controllers/auditController');

const router = express.Router();

// Audit routes
router.post('/audit-logs', AuditController.createAuditLog);
router.get('/audit-logs/:id', AuditController.getAuditLog);
router.get('/users/:userId/audit-logs', AuditController.getUserAuditLogs);
router.get('/resources/:resource/:resourceId/audit-logs', AuditController.getResourceAuditLogs);

// Health check route
router.get('/health', (req, res) => {
  console.log('🏥 Audit Service health check requested');
  res.status(200).json({
    success: true,
    service: 'Audit Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;