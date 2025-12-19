/**
 * Settlement Service Server
 * Payment settlement and clearing service
 */

// Ensure shared and service node_modules are resolvable from shared code
{
  const Module = require('module');
  Module.globalPaths.push('/app/node_modules');
  Module.globalPaths.push('/app/apps/settlement-service/node_modules');
}

const app = require('./app');
const config = require('../../shared/config');

const PORT = config.app.ports.settlementService || 8006;

// Graceful shutdown function
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Graceful shutdown initiated...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    const db = require('../../shared/db');
    db.closeAll()
      .then(() => {
        console.log('Database connections closed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Error closing database connections:', error);
        process.exit(1);
      });
  });
};

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Settlement Service running on port ${PORT}`);
  console.log(`Environment: ${config.app.nodeEnv}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = server;