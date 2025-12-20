/**
 * Account Routes
 */
const express = require('express');
const AccountController = require('../controllers/accountController');

const router = express.Router();

// Account routes
router.post('/accounts', AccountController.createAccount);
router.get('/accounts/:id', AccountController.getAccount);
router.get('/users/:userId/accounts', AccountController.getUserAccounts);
router.put('/accounts/:id', AccountController.updateAccount);
router.delete('/accounts/:id', AccountController.deleteAccount);

// Health check route
router.get('/health', (req, res) => {
  console.log('🏥 Account Service health check requested');
  res.status(200).json({
    success: true,
    service: 'Account Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;