const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const config = require('../../../shared/config');

// Auth service
router.use('/api/auth', createProxyMiddleware({
  target: `http://${config.services.authService.host}:${config.services.authService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
}));

// Accounts
router.use('/api/accounts', createProxyMiddleware({
  target: `http://${config.services.accountService.host}:${config.services.accountService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/accounts': '' },
}));

// Transactions
router.use('/api/transactions', createProxyMiddleware({
  target: `http://${config.services.transactionService.host}:${config.services.transactionService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/transactions': '' },
}));

// Ledger
router.use('/api/ledger', createProxyMiddleware({
  target: `http://${config.services.ledgerService.host}:${config.services.ledgerService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/ledger': '' },
}));

// Settlements
router.use('/api/settlements', createProxyMiddleware({
  target: `http://${config.services.settlementService.host}:${config.services.settlementService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/settlements': '' },
}));

// Disputes
router.use('/api/disputes', createProxyMiddleware({
  target: `http://${config.services.disputeService.host}:${config.services.disputeService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/disputes': '' },
}));

// Audit
router.use('/api/audit', createProxyMiddleware({
  target: `http://${config.services.auditService.host}:${config.services.auditService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/audit': '' },
}));

// Notifications
router.use('/api/notifications', createProxyMiddleware({
  target: `http://${config.services.notificationService.host}:${config.services.notificationService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' },
}));

module.exports = router;
