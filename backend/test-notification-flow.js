/**
 * End-to-End Test Script
 * Demonstrates the complete notification flow
 */

const axios = require('axios');

// Configuration
const AUTH_SERVICE_URL = 'http://localhost:8001/api/auth';
const NOTIFICATION_SERVICE_URL = 'http://localhost:8009/api/notifications';

// Test user data
const testUser = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  mobile_number: '+919876543210',
  date_of_birth: '1990-05-15',
  password: 'SecurePass123!',
  address: {
    street: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400001',
    country: 'India'
  }
};

/**
 * Test user registration (triggers notification)
 */
async function testUserRegistration() {
  console.log('🧪 Testing User Registration Flow...\n');
  
  try {
    console.log('📝 Registering new user...');
    const response = await axios.post(`${AUTH_SERVICE_URL}/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ User registered successfully!');
      console.log('📧 Registration notification should be queued for:', testUser.email);
      console.log('🔑 User ID:', response.data.user.id);
      return response.data.user.id;
    } else {
      console.log('❌ Registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test user login (triggers login alert notification)
 */
async function testUserLogin() {
  console.log('\n🧪 Testing User Login Flow...\n');
  
  try {
    console.log('🔐 Logging in user...');
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, {
      login: testUser.email,
      password: testUser.password
    });
    
    if (response.data.success) {
      console.log('✅ User logged in successfully!');
      console.log('🔔 Login alert notification should be queued for:', testUser.email);
      console.log('🎫 JWT Token received:', response.data.token ? 'Yes' : 'No');
      return response.data.token;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Check notification worker status
 */
async function checkWorkerStatus() {
  console.log('\n🧪 Checking Notification Worker Status...\n');
  
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/worker/status`);
    
    if (response.data.success) {
      console.log('✅ Worker Status Retrieved:');
      console.log('   Status:', response.data.worker.worker_status);
      console.log('   Queue Length:', response.data.worker.queue_length);
      console.log('   Process Interval:', response.data.worker.process_interval_ms, 'ms');
      return true;
    } else {
      console.log('❌ Failed to get worker status');
      return false;
    }
  } catch (error) {
    console.log('❌ Worker status error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Check notification service health
 */
async function checkServiceHealth() {
  console.log('\n🧪 Checking Notification Service Health...\n');
  
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/health`);
    
    console.log('✅ Notification Service Health:');
    console.log('   Service Status:', response.data.status);
    console.log('   Worker Status:', response.data.worker.worker_status);
    console.log('   Email Service:', response.data.email_service.status);
    console.log('   Environment:', response.data.environment);
    
    return response.data.status === 'healthy';
  } catch (error) {
    console.log('❌ Health check error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Get notification statistics
 */
async function getNotificationStats() {
  console.log('\n🧪 Getting Notification Statistics...\n');
  
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/stats`);
    
    if (response.data.success) {
      console.log('📊 Notification Statistics:');
      console.log('   Period:', response.data.period.days, 'days');
      console.log('   Status Distribution:', response.data.statistics.by_status);
      console.log('   Type Distribution:', response.data.statistics.by_type);
      return true;
    } else {
      console.log('❌ Failed to get statistics');
      return false;
    }
  } catch (error) {
    console.log('❌ Statistics error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting End-to-End Notification Flow Test\n');
  console.log('='.repeat(50));
  
  // Check service health first
  const healthOk = await checkServiceHealth();
  if (!healthOk) {
    console.log('\n❌ Notification service is not healthy. Aborting tests.');
    return;
  }
  
  // Check worker status
  await checkWorkerStatus();
  
  // Test user registration (triggers email)
  const userId = await testUserRegistration();
  
  if (userId) {
    // Wait a moment for notification processing
    console.log('\n⏳ Waiting 3 seconds for notification processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test user login (triggers login alert)
    await testUserLogin();
    
    // Wait a moment for notification processing
    console.log('\n⏳ Waiting 3 seconds for notification processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check statistics
    await getNotificationStats();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 End-to-End Test Complete');
  console.log('\n📝 Test Summary:');
  console.log('   1. User Registration → Triggers welcome email notification');
  console.log('   2. User Login → Triggers login alert notification');
  console.log('   3. Notifications are queued in Redis');
  console.log('   4. Worker processes queue and sends emails');
  console.log('   5. Notification records tracked in MongoDB');
  console.log('\n💡 Check your email to verify delivery!');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});

module.exports = {
  testUserRegistration,
  testUserLogin,
  checkWorkerStatus,
  checkServiceHealth,
  getNotificationStats
};