/**
 * Transaction Routes
 */
const express = require('express');
const TransactionController = require('../controllers/transactionController');

const router = express.Router();

// Transaction routes
router.post('/transactions', TransactionController.createTransaction);
router.get('/transactions/:id', TransactionController.getTransaction);
router.get('/accounts/:accountId/transactions', TransactionController.getAccountTransactions);
router.put('/transactions/:id', TransactionController.updateTransaction);
router.patch('/transactions/:id/process', TransactionController.processTransaction);

// Health check route
router.get('/health', (req, res) => {
  console.log('🏥 Transaction Service health check requested');
  res.status(200).json({
    success: true,
    service: 'Transaction Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;