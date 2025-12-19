/**
 * PostgreSQL database connection manager
 * Uses connection pooling for better performance
 */

const { Pool } = require('pg');
const config = require('../config');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Initialize database connection pool
   */
  async connect() {
    try {
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.username,
        password: config.database.password,
        min: config.database.pool.min,
        max: config.database.pool.max,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.isConnected = true;
      console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute a query
   */
  async query(text, params) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  /**
   * Get a client from the pool (for transactions)
   */
  async getClient() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    
    return await this.pool.connect();
  }

  /**
   * Close database connection
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('📴 PostgreSQL disconnected');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return { status: 'healthy', database: 'PostgreSQL' };
    } catch (error) {
      return { status: 'unhealthy', database: 'PostgreSQL', error: error.message };
    }
  }
}

// Export singleton instance
const dbManager = new DatabaseManager();
module.exports = dbManager;