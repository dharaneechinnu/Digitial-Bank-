/**
 * Settlement Routes
 */
const express = require('express');
const SettlementController = require('../controllers/settlementController');

const router = express.Router();

// Settlement routes
router.post('/settlements', SettlementController.createSettlement);
router.get('/settlements/:id', SettlementController.getSettlement);
router.patch('/settlements/:id/process', SettlementController.processSettlement);

// Health check route
router.get('/health', (req, res) => {
  console.log('🏥 Settlement Service health check requested');
  res.status(200).json({
    success: true,
    service: 'Settlement Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;