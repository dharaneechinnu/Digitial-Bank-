/**
 * Database connection index
 * Centralizes all database connections
 */

const mongodb = require('./mongodb');
const redis = require('./redis');

module.exports = {
  mongodb,
  redis,
  
  /**
   * Initialize all database connections
   */
  async connectAll() {
    try {
      await mongodb.connect();
      await redis.connect();
      console.log('✅ All databases connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  },

  /**
   * Disconnect all database connections
   */
  async disconnectAll() {
    try {
      await mongodb.disconnect();
      await redis.disconnect();
      console.log('📴 All databases disconnected');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error.message);
      throw error;
    }
  },

  /**
   * Health check for all databases
   */
  async healthCheckAll() {
    try {
      const [mongoHealth, redisHealth] = await Promise.all([
        mongodb.healthCheck(),
        redis.healthCheck(),
      ]);
      
      return {
        mongodb: mongoHealth,
        redis: redisHealth,
        overall: mongoHealth.status === 'healthy' && redisHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      return {
        mongodb: { status: 'unhealthy', error: error.message },
        redis: { status: 'unhealthy', error: error.message },
        overall: 'unhealthy',
      };
    }
  },
};