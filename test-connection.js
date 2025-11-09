// Quick test to verify frontend-backend connection
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  // Test 1: Backend Health
  try {
    console.log('1️⃣ Testing Backend Health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }

  // Test 2: Database Connection
  try {
    console.log('\n2️⃣ Testing Database Connection...');
    const dbResponse = await axios.get(`${BACKEND_URL}/api/test-db`);
    console.log('✅ Database connected:', dbResponse.data);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return;
  }

  // Test 3: Frontend Server
  try {
    console.log('\n3️⃣ Testing Frontend Server...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend is running on port 3000');
  } catch (error) {
    console.log('❌ Frontend server not responding:', error.message);
    return;
  }

  // Test 4: API Endpoints
  try {
    console.log('\n4️⃣ Testing API Endpoints...');
    
    // Test users endpoint
    const usersResponse = await axios.get(`${BACKEND_URL}/api/users`);
    console.log(`✅ Users API: ${usersResponse.data.data.length} users found`);
    
    // Test attendance endpoint
    const attendanceResponse = await axios.get(`${BACKEND_URL}/api/attendance`);
    console.log(`✅ Attendance API: ${attendanceResponse.data.data.length} records found`);
    
    // Test leaves endpoint
    const leavesResponse = await axios.get(`${BACKEND_URL}/api/leaves`);
    console.log(`✅ Leaves API: ${leavesResponse.data.data.length} requests found`);
    
  } catch (error) {
    console.log('❌ API endpoint test failed:', error.message);
    return;
  }

  console.log('\n✅ All tests passed! Frontend and Backend are properly connected! 🎉');
}

testConnection();
