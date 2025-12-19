/**
 * Redis connection manager
 * Handles caching, session storage, and distributed locks
 */

const Redis = require('ioredis');
const config = require('../config');

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.isConnected = false;
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        this.client.on('ready', resolve);
        this.client.on('error', reject);
      });

    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key, value, expireInSeconds = null) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        return await this.client.setex(key, expireInSeconds, serializedValue);
      }
      return await this.client.set(key, serializedValue);
    } catch (error) {
      console.error('Redis set error:', error.message);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error.message);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async del(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error.message);
      throw error;
    }
  }

  /**
   * Set distributed lock
   */
  async setLock(key, value, expireInSeconds = 30) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const result = await this.client.set(
        `lock:${key}`,
        value,
        'EX',
        expireInSeconds,
        'NX'
      );
      return result === 'OK';
    } catch (error) {
      console.error('Redis lock error:', error.message);
      throw error;
    }
  }

  /**
   * Release distributed lock
   */
  async releaseLock(key, value) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      return await this.client.eval(script, 1, `lock:${key}`, value);
    } catch (error) {
      console.error('Redis unlock error:', error.message);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('📴 Redis disconnected');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.client.ping();
      return { status: 'healthy', cache: 'Redis' };
    } catch (error) {
      return { status: 'unhealthy', cache: 'Redis', error: error.message };
    }
  }
}

// Export singleton instance
const redisManager = new RedisManager();
module.exports = redisManager;