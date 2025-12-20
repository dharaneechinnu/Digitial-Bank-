// Registers API Gateway-specific routes
module.exports = (app) => {
  const gatewayRoutes = require('./routes/gatewayRoutes');
  const proxyRoutes = require('./routes/proxyRoutes');

  // Mount gateway-specific endpoints
  app.use('/api/gateway', gatewayRoutes);

  // Mount proxy routes for microservices (keeps proxy logic modular)
  app.use('/', proxyRoutes);
};
