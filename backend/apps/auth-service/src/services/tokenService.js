/**
 * JWT and Session Service - Bank Grade Token Management
 * Handles JWT token generation, validation, and Redis session management
 */

const jwt = require('jsonwebtoken');
const redis = require('../../../shared/db/redis');

class TokenService {
  
  /**
   * Generate JWT access token with user data
   * @param {Object} user - User object from database
   * @returns {Object} - { token, expiresIn }
   */
  static generateAccessToken(user) {
    const payload = {
      user_id: user._id,
      role: user.role,
      kyc_status: user.kyc_status,
      account_status: user.account_status,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const secret = process.env.JWT_SECRET || 'fintech_bank_secret_key_2024';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(payload, secret, { 
      expiresIn,
      issuer: 'fintech-bank',
      audience: 'fintech-users'
    });
    
    return { token, expiresIn };
  }
  
  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  static verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'fintech_bank_secret_key_2024';
      
      const decoded = jwt.verify(token, secret, {
        issuer: 'fintech-bank',
        audience: 'fintech-users'
      });
      
      return decoded;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      if (error.name === 'NotBeforeError') {
        throw new Error('Token not active');
      }
      throw new Error('Token verification failed');
    }
  }
  
  /**
   * Store session token in Redis with TTL
   * @param {String} userId - User ID
   * @param {String} token - JWT token
   * @param {Number} ttlSeconds - Time to live in seconds (default 24h)
   */
  static async storeSession(userId, token, ttlSeconds = 86400) {
    try {
      const sessionKey = `session:${userId}`;
      
      await redis.client.setex(sessionKey, ttlSeconds, token);
      
      console.log(`✅ Session stored for user ${userId}, expires in ${ttlSeconds}s`);
    } catch (error) {
      console.error('❌ Failed to store session:', error.message);
      throw new Error('Session storage failed');
    }
  }
  
  /**
   * Validate session token from Redis
   * @param {String} userId - User ID
   * @param {String} token - JWT token to validate
   * @returns {Boolean} - True if session is valid
   */
  static async validateSession(userId, token) {
    try {
      const sessionKey = `session:${userId}`;
      const storedToken = await redis.client.get(sessionKey);
      
      // Check if session exists and tokens match
      return storedToken === token;
    } catch (error) {
      console.error('❌ Session validation failed:', error.message);
      return false;
    }
  }
  
  /**
   * Delete session from Redis (logout)
   * @param {String} userId - User ID
   */
  static async deleteSession(userId) {
    try {
      const sessionKey = `session:${userId}`;
      const deleted = await redis.client.del(sessionKey);
      
      console.log(`📴 Session deleted for user ${userId}`);
      return deleted > 0;
    } catch (error) {
      console.error('❌ Failed to delete session:', error.message);
      throw new Error('Session deletion failed');
    }
  }
  
  /**
   * Extend session TTL (optional feature)
   * @param {String} userId - User ID
   * @param {Number} ttlSeconds - New TTL in seconds
   */
  static async extendSession(userId, ttlSeconds = 86400) {
    try {
      const sessionKey = `session:${userId}`;
      const sessionExists = await redis.client.exists(sessionKey);
      
      if (sessionExists) {
        await redis.client.expire(sessionKey, ttlSeconds);
        console.log(`⏰ Session extended for user ${userId}, new TTL: ${ttlSeconds}s`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to extend session:', error.message);
      return false;
    }
  }
  
  /**
   * Get all active sessions count (admin feature)
   * @returns {Number} - Number of active sessions
   */
  static async getActiveSessionsCount() {
    try {
      const keys = await redis.client.keys('session:*');
      return keys.length;
    } catch (error) {
      console.error('❌ Failed to get active sessions count:', error.message);
      return 0;
    }
  }
  
  /**
   * Blacklist a token (security feature)
   * @param {String} token - JWT token to blacklist
   * @param {Number} ttlSeconds - How long to keep in blacklist
   */
  static async blacklistToken(token, ttlSeconds = 86400) {
    try {
      const blacklistKey = `blacklist:${token}`;
      await redis.client.setex(blacklistKey, ttlSeconds, 'blacklisted');
      console.log('🚫 Token blacklisted');
    } catch (error) {
      console.error('❌ Failed to blacklist token:', error.message);
      throw new Error('Token blacklist failed');
    }
  }
  
  /**
   * Check if token is blacklisted
   * @param {String} token - JWT token to check
   * @returns {Boolean} - True if token is blacklisted
   */
  static async isTokenBlacklisted(token) {
    try {
      const blacklistKey = `blacklist:${token}`;
      const isBlacklisted = await redis.client.exists(blacklistKey);
      return isBlacklisted === 1;
    } catch (error) {
      console.error('❌ Failed to check blacklist:', error.message);
      return false;
    }
  }
}

module.exports = TokenService;