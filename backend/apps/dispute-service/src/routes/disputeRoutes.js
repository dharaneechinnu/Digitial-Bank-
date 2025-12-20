/**
 * Dispute Routes
 */
const express = require('express');
const DisputeController = require('../controllers/disputeController');

const router = express.Router();

// Dispute routes
router.post('/disputes', DisputeController.createDispute);
router.get('/disputes/:id', DisputeController.getDispute);
router.get('/users/:userId/disputes', DisputeController.getUserDisputes);
router.put('/disputes/:id', DisputeController.updateDispute);
router.patch('/disputes/:id/resolve', DisputeController.resolveDispute);

// Health check route
router.get('/health', (req, res) => {
  console.log('🏥 Dispute Service health check requested');
  res.status(200).json({
    success: true,
    service: 'Dispute Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;