/**
 * Account Service Server
 */

require('dotenv').config();

const app = require('./app');
const config = require('../../shared/config');
const db = require('../../shared/db');

const PORT = process.env.PORT || config.app.ports.accountService;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);
  
  try {
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
    await db.connectAll();
    
    const server = app.listen(PORT, () => {
      console.log(`🏦 Account Service running on port ${PORT}`);
      console.log(`📋 Environment: ${config.app.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start Account Service:', error.message);
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

startServer();