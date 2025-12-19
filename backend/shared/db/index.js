/**
 * Database connection index
 * Centralizes all database connections
 */

const postgres = require('./postgres');
const redis = require('./redis');

module.exports = {
  postgres,
  redis,
  
  /**
   * Initialize all database connections
   */
  async connectAll() {
    try {
      await postgres.connect();
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
      await postgres.disconnect();
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
      const [pgHealth, redisHealth] = await Promise.all([
        postgres.healthCheck(),
        redis.healthCheck(),
      ]);
      
      return {
        postgres: pgHealth,
        redis: redisHealth,
        overall: pgHealth.status === 'healthy' && redisHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      return {
        postgres: { status: 'unhealthy', error: error.message },
        redis: { status: 'unhealthy', error: error.message },
        overall: 'unhealthy',
      };
    }
  },
};