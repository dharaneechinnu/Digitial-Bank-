/**
 * Notification Service Server
 * Email notification service with Redis queue worker
 */

// Ensure shared and service node_modules are resolvable from shared code
{
  const Module = require('module');
  Module.globalPaths.push('/app/node_modules');
  Module.globalPaths.push('/app/apps/notification-service/node_modules');
}

const app = require('./app');
const config = require('/shared/config');
const db = require('/shared/db');
const notificationWorker = require('./src/workers/notificationWorker');

const PORT = config.app.ports.notificationService || 8009;

// Initialize database connections
async function initializeDatabase() {
  try {
    console.log('📡 Connecting to databases...');
    await db.connectAll();
    console.log('✅ All databases connected successfully');

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\n📴 Received ${signal}. Graceful shutdown initiated...`);
  
  try {
    // Stop notification worker
    notificationWorker.stop();
    console.log('🛑 Notification worker stopped');
    
    // Close HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('🛑 HTTP server closed');
    }
    
    // Close database connections
    if (typeof db.disconnectAll === 'function') {
      await db.disconnectAll();
      console.log('🛑 Database connections closed');
    } else if (typeof db.disconnect === 'function') {
      await db.disconnect();
      console.log('🛑 Database connections closed');
    }
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Start the server
async function startServer() {
  try {
    // Initialize database connections
    const dbConnected = await initializeDatabase();
    if (!dbConnected) {
      console.error('❌ Failed to connect to databases. Exiting...');
      process.exit(1);
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Notification Service running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.app.nodeEnv}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Admin API: http://localhost:${PORT}/api/notifications`);
    });
    
    // Start notification worker
    console.log('🔄 Starting notification worker...');
    notificationWorker.start();
    console.log('✅ Notification worker started');
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start server
const server = startServer();

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = server;