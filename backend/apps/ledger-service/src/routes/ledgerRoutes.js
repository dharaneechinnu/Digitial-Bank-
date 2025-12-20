/**
 * Ledger Routes
 */
const express = require('express');
const LedgerController = require('../controllers/ledgerController');

const router = express.Router();

// Ledger routes
router.post('/entries', LedgerController.createEntry);
router.get('/entries/:id', LedgerController.getEntry);
router.get('/accounts/:accountId/entries', LedgerController.getAccountEntries);
router.get('/transactions/:transactionId/entries', LedgerController.getTransactionEntries);
router.get('/accounts/:accountId/balance', LedgerController.getAccountBalance);

// Health check route
router.get('/health', (req, res) => {
  console.log('🏥 Ledger Service health check requested');
  res.status(200).json({
    success: true,
    service: 'Ledger Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;