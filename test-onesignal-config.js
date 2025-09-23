#!/usr/bin/env node

/**
 * OneSignal Configuration Test
 * This script tests if your OneSignal App ID and REST API Key are working
 */

const https = require('https');

// OneSignal Configuration
const ONESIGNAL_APP_ID = '2613c87d-4f81-4094-bd84-08495e68bda0';
const ONESIGNAL_REST_API_KEY = '=os_v2_app_eyj4q7kpqfajjpmebbev42f5ud2jhnlvx4mucwmuqemjempuj7gfl7dguc3y3gltzma6bmyxrhsmja2wbx5yr6q4shsgn4lynomvt4y';

console.log('🔍 Testing OneSignal Configuration...');
console.log(`📱 App ID: ${ONESIGNAL_APP_ID}`);
console.log(`🔑 REST API Key: ${ONESIGNAL_REST_API_KEY.substring(0, 20)}...`);

// Test 1: Get App Info
function testAppInfo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'onesignal.com',
      port: 443,
      path: `/api/v1/apps/${ONESIGNAL_APP_ID}`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('\n📋 Test 1: Getting App Information...');

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (res.statusCode === 200) {
            console.log('✅ App Info Retrieved Successfully!');
            console.log(`📱 App Name: ${response.name}`);
            console.log(`🏢 Organization: ${response.organization_id || 'N/A'}`);
            console.log(`👥 Players: ${response.players || 0}`);
            console.log(`📊 Messageable Players: ${response.messageable_players || 0}`);
            resolve(response);
          } else {
            console.log('❌ Failed to get app info:');
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', response);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', responseData);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test 2: Send Test Notification to All Users
function testBroadcastNotification() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      headings: { en: 'Configuration Test' },
      contents: { en: 'If you see this, your OneSignal configuration is working correctly!' },
      data: { test: true, timestamp: new Date().toISOString() }
    });

    const options = {
      hostname: 'onesignal.com',
      port: 443,
      path: '/api/v1/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Length': data.length
      }
    };

    console.log('\n📤 Test 2: Sending Broadcast Test Notification...');

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);

          if (res.statusCode === 200) {
            console.log('✅ Test notification sent successfully!');
            console.log(`📊 Notification ID: ${response.id}`);
            console.log(`📱 Recipients: ${response.recipients || 0}`);
            
            if (response.recipients === 0) {
              console.log('⚠️  Warning: 0 recipients - no subscribed users found');
              console.log('   This means your device isn\'t registered yet or notifications are disabled');
            } else {
              console.log('🎉 Great! You have subscribed users and notifications should be delivered');
            }
            resolve(response);
          } else {
            console.log('❌ Failed to send notification:');
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', response);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', responseData);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await testAppInfo();
    await testBroadcastNotification();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ OneSignal App ID and REST API Key are valid');
    console.log('✅ You can send notifications via API');
    console.log('\nIf you received 0 recipients, make sure:');
    console.log('1. Your device is registered (check OneSignal dashboard → Audience)');
    console.log('2. Notifications are enabled on your device');
    console.log('3. Your app successfully initialized OneSignal');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if your REST API Key is correct');
    console.log('2. Verify your App ID matches your OneSignal dashboard');
    console.log('3. Make sure your OneSignal account has access to this app');
  }
}

runTests();
