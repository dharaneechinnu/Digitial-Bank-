const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const config = require('../../../shared/config');

// Helper to preserve JSON/body when proxying (bodyParser runs in the gateway)
function proxyWithBody(options = {}) {
  return createProxyMiddleware({
    ...options,
    onProxyReq: (proxyReq, req, res) => {
      try {
        if (!req.body || !Object.keys(req.body).length) return;

        const bodyData = JSON.stringify(req.body);
        // Set correct headers
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // Write body to proxy request and end the stream
        proxyReq.end(bodyData);
      } catch (err) {
        // swallow - don't crash proxy on body handling errors
        console.error('Proxy body forwarding error:', err.message);
      }
    }
  });
}

// Auth service
router.use('/api/auth', proxyWithBody({
  target: `http://${config.services.authService.host}:${config.services.authService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
}));

// Accounts
router.use('/api/accounts', proxyWithBody({
  target: `http://${config.services.accountService.host}:${config.services.accountService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/accounts': '' },
}));

// Transactions
router.use('/api/transactions', proxyWithBody({
  target: `http://${config.services.transactionService.host}:${config.services.transactionService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/transactions': '' },
}));

// Ledger
router.use('/api/ledger', proxyWithBody({
  target: `http://${config.services.ledgerService.host}:${config.services.ledgerService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/ledger': '' },
}));

// Settlements
router.use('/api/settlements', proxyWithBody({
  target: `http://${config.services.settlementService.host}:${config.services.settlementService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/settlements': '' },
}));

// Disputes
router.use('/api/disputes', proxyWithBody({
  target: `http://${config.services.disputeService.host}:${config.services.disputeService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/disputes': '' },
}));

// Audit
router.use('/api/audit', proxyWithBody({
  target: `http://${config.services.auditService.host}:${config.services.auditService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/audit': '' },
}));

// Notifications
router.use('/api/notifications', proxyWithBody({
  target: `http://${config.services.notificationService.host}:${config.services.notificationService.port}`,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' },
}));

module.exports = router;
