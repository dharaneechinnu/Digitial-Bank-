/**
 * Simple test script to verify MongoDB connection and user model
 * Run this with: node test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./shared/config');

async function testConnection() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    // Connect to MongoDB
    let mongoUri = config.database.mongoUri;
    if (mongoUri.includes('<db_password>')) {
      mongoUri = mongoUri.replace('<db_password>', config.database.password);
    }
    await mongoose.connect(mongoUri, {
      dbName: config.database.name,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Test the User model
    const UserModel = require('./apps/auth-service/src/models/userModel');
    
    console.log('🧪 Testing User model...');
    
    // Create a test user
    const testUser = {
      email: 'test@example.com',
      password: 'hashedpassword123',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890'
    };
    
    console.log('📝 Creating test user...');
    const createdUser = await UserModel.create(testUser);
    console.log('✅ User created successfully:', {
      id: createdUser.id,
      email: createdUser.email,
      first_name: createdUser.first_name,
      last_name: createdUser.last_name
    });
    
    // Find user by email
    console.log('🔍 Finding user by email...');
    const foundUser = await UserModel.findByEmail(testUser.email);
    console.log('✅ User found by email:', {
      id: foundUser.id,
      email: foundUser.email
    });
    
    // Find user by ID
    console.log('🔍 Finding user by ID...');
    const foundUserById = await UserModel.findById(createdUser.id);
    console.log('✅ User found by ID:', {
      id: foundUserById.id,
      email: foundUserById.email
    });
    
    // Clean up - remove test user
    console.log('🧹 Cleaning up test user...');
    const deleted = await UserModel.deleteById(createdUser.id);
    console.log('✅ Test user deleted:', deleted);
    
    console.log('🎉 All tests passed! MongoDB integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testConnection();