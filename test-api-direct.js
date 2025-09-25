#!/usr/bin/env node

/**
 * Direct API Test Script
 * Tests the Laravel API directly to see if it's working
 */

const https = require('https');

const testData = {
  anon_user_id: "test_user_" + Date.now(),
  onesignal_player_id: "test_player_" + Date.now(),
  tz: "America/New_York",
  start_time: "09:00",
  end_time: "21:00",
  notifications_enabled: true
};

console.log('🧪 Testing Laravel API directly...');
console.log('📤 Test data:', testData);

const postData = JSON.stringify(testData);

const options = {
  hostname: 'godmoments.betaplanets.com',
  port: 443,
  path: '/api/devices/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔗 Request URL:', `https://${options.hostname}${options.path}`);
console.log('📋 Request headers:', options.headers);

const req = https.request(options, (res) => {
  console.log('📥 Response status:', res.statusCode);
  console.log('📥 Response headers:', res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response body:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ API is working!');
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Parsed JSON:', jsonData);
      } catch (e) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else {
      console.log('❌ API returned error status:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e);
});

// Write data to request body
req.write(postData);
req.end();
