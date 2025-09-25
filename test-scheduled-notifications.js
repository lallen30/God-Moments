#!/usr/bin/env node

/**
 * Test script for Scheduled Notifications Integration
 * 
 * This script tests the Laravel backend API endpoints to ensure
 * the scheduled notification system is working correctly.
 * 
 * Usage: node test-scheduled-notifications.js
 */

const https = require('https');

const BASE_URL = 'https://godmoments.betaplanets.com';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testDevice = {
  anon_user_id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  onesignal_player_id: `test_player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  tz: 'America/New_York',
  start_time: '09:00',
  end_time: '21:00',
  notifications_enabled: true,
};

console.log('🔔 Testing Scheduled Notifications Integration');
console.log('=' .repeat(50));

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ScheduledNotifications-Test/1.0',
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test device registration
 */
async function testDeviceRegistration() {
  console.log('\n📱 Testing Device Registration...');
  
  try {
    const response = await makeRequest(`${API_BASE}/devices/register`, {
      method: 'POST',
      body: testDevice,
    });

    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Device registration successful!');
      console.log(`Device ID: ${response.data.data?.device?.id}`);
      console.log(`Scheduled notifications: ${response.data.data?.next_schedule?.length || 0}`);
      
      if (response.data.data?.next_schedule?.length > 0) {
        console.log('📅 Next notifications:');
        response.data.data.next_schedule.forEach((notification, index) => {
          console.log(`  ${index + 1}. ${notification.scheduled_at_local} (${notification.status})`);
        });
      }
      
      return response.data.data?.device?.id;
    } else {
      console.log('❌ Device registration failed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.log('❌ Device registration error:', error.message);
    return null;
  }
}

/**
 * Test settings update
 */
async function testSettingsUpdate(deviceId) {
  if (!deviceId) {
    console.log('\n⚠️ Skipping settings update test (no device ID)');
    return;
  }

  console.log('\n⚙️ Testing Settings Update...');
  
  try {
    const updateData = {
      start_time: '08:00',
      end_time: '22:00',
      notifications_enabled: true,
    };

    const response = await makeRequest(`${API_BASE}/devices/${deviceId}/settings`, {
      method: 'PATCH',
      body: updateData,
    });

    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Settings update successful!');
      console.log(`Rescheduled: ${response.data.data?.rescheduled ? 'Yes' : 'No'}`);
      
      if (response.data.data?.next_schedule?.length > 0) {
        console.log('📅 Updated schedule:');
        response.data.data.next_schedule.forEach((notification, index) => {
          console.log(`  ${index + 1}. ${notification.scheduled_at_local} (${notification.status})`);
        });
      }
    } else {
      console.log('❌ Settings update failed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Settings update error:', error.message);
  }
}

/**
 * Test schedule retrieval
 */
async function testScheduleRetrieval(deviceId) {
  if (!deviceId) {
    console.log('\n⚠️ Skipping schedule retrieval test (no device ID)');
    return;
  }

  console.log('\n📅 Testing Schedule Retrieval...');
  
  try {
    const response = await makeRequest(`${API_BASE}/devices/${deviceId}/schedule?days=3`);

    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Schedule retrieval successful!');
      console.log(`Notifications found: ${response.data.data?.schedule?.length || 0}`);
      
      if (response.data.data?.schedule?.length > 0) {
        console.log('📋 Schedule details:');
        response.data.data.schedule.forEach((notification, index) => {
          console.log(`  ${index + 1}. ${notification.scheduled_at_local} (${notification.status})`);
        });
      }
    } else {
      console.log('❌ Schedule retrieval failed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Schedule retrieval error:', error.message);
  }
}

/**
 * Test API health
 */
async function testApiHealth() {
  console.log('\n🏥 Testing API Health...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ API is healthy');
    } else {
      console.log('⚠️ API health check returned non-200 status');
    }
  } catch (error) {
    console.log('❌ API health check error:', error.message);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`🎯 Target API: ${API_BASE}`);
  console.log(`📱 Test Device: ${testDevice.anon_user_id}`);
  
  // Test API health first
  await testApiHealth();
  
  // Test device registration
  const deviceId = await testDeviceRegistration();
  
  // Test settings update
  await testSettingsUpdate(deviceId);
  
  // Test schedule retrieval
  await testScheduleRetrieval(deviceId);
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Test completed!');
  
  if (deviceId) {
    console.log(`✅ Integration appears to be working correctly`);
    console.log(`📝 Device ID for manual testing: ${deviceId}`);
  } else {
    console.log(`❌ Integration has issues - check Laravel backend`);
  }
}

// Run the tests
runTests().catch(console.error);
