#!/usr/bin/env node

/**
 * Test API with proper UUIDs
 * This should now work since we're sending valid UUIDs
 */

const https = require('https');

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const testData = {
  anon_user_id: generateUUID(),
  onesignal_player_id: generateUUID(),
  tz: "America/New_York",
  start_time: "09:00",
  end_time: "21:00",
  notifications_enabled: true
};

console.log('🧪 Testing Laravel API with proper UUIDs...');
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
      console.log('✅ API is working with UUIDs!');
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Registration successful:', jsonData);
        if (jsonData.data && jsonData.data.device) {
          console.log('✅ Device registered with ID:', jsonData.data.device.id);
        }
        if (jsonData.data && jsonData.data.next_schedule) {
          console.log('✅ Next notifications scheduled:', jsonData.data.next_schedule.length);
        }
      } catch (e) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else if (res.statusCode === 422) {
      console.log('❌ Still getting validation errors - check the response for details');
      try {
        const errorData = JSON.parse(data);
        console.log('❌ Validation errors:', errorData.errors);
      } catch (e) {
        console.log('❌ Could not parse error response');
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
