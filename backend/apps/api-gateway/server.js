/**
 * API Gateway Server
 * Entry point for the API Gateway service
 */

// Ensure modules installed in /app/node_modules are resolvable
const path = require('path');
const Module = require('module');
if (!Module.globalPaths.includes('/app/node_modules')) {
  Module.globalPaths.push('/app/node_modules');
}

require('dotenv').config();

const app = require('./app');
const config = require('../../shared/config');
const db = require('../../shared/db');

const PORT = process.env.PORT || config.services.apiGateway.port;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close database connections
    await db.disconnectAll();
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Initialize database connections
    await db.connectAll();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(`📋 Environment: ${config.app.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start API Gateway:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();