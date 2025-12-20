/**
 * MongoDB database connection manager using Mongoose
 */

const mongoose = require('mongoose');
const config = require('../config');

class MongoDBManager {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  /**
   * Initialize MongoDB connection
   */
  async connect() {
    try {
      // Use the MongoDB URI directly if it doesn't contain placeholder
      let mongoUri = config.database.mongoUri;
      if (mongoUri.includes('<db_password>')) {
        mongoUri = mongoUri.replace('<db_password>', config.database.password);
      }
      
      const options = {
        dbName: config.database.name,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📴 MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Get mongoose instance for model definitions
   */
  getConnection() {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }
    return mongoose;
  }

  /**
   * Close MongoDB connection
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('📴 MongoDB disconnected');
      }
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error.message);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'unhealthy', database: 'MongoDB', error: 'Not connected' };
      }
      
      // Simple ping to check connection
      const adminDb = mongoose.connection.db.admin();
      await adminDb.ping();
      
      return { status: 'healthy', database: 'MongoDB' };
    } catch (error) {
      return { status: 'unhealthy', database: 'MongoDB', error: error.message };
    }
  }
}

// Export singleton instance
const mongoManager = new MongoDBManager();
module.exports = mongoManager;