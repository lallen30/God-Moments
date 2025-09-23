#!/usr/bin/env node

const https = require('https');

const ONESIGNAL_APP_ID = '2613c87d-4f81-4094-bd84-08495e68bda0';
const ONESIGNAL_REST_API_KEY = 'os_v2_app_eyj4q7kpqfajjpmebbev42f5ud2jhnlvx4mucwmuqemjempuj7gfl7dguc3y3gltzma6bmyxrhsmja2wbx5yr6q4shsgn4lynomvt4y';

console.log('🔍 Checking device status in OneSignal...\n');

// Get all players/devices
function getPlayers() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'onesignal.com',
      port: 443,
      path: `/api/v1/players?app_id=${ONESIGNAL_APP_ID}&limit=300`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkDevices() {
  try {
    const data = await getPlayers();
    
    console.log(`📊 Total Players: ${data.total_count}`);
    console.log(`📱 Players in response: ${data.players.length}\n`);
    
    if (data.players.length === 0) {
      console.log('❌ No devices found! This means:');
      console.log('   1. OneSignal initialization is not working');
      console.log('   2. Device registration failed');
      console.log('   3. App is not properly configured');
      return;
    }
    
    console.log('📱 Device Details:');
    console.log('==================');
    
    data.players.forEach((player, index) => {
      console.log(`\n🔹 Device ${index + 1}:`);
      console.log(`   ID: ${player.id}`);
      console.log(`   Type: ${player.device_type} (${getDeviceTypeName(player.device_type)})`);
      console.log(`   Model: ${player.device_model || 'Unknown'}`);
      console.log(`   OS: ${player.device_os || 'Unknown'}`);
      console.log(`   App Version: ${player.game_version || 'Unknown'}`);
      console.log(`   Created: ${new Date(player.created_at * 1000).toLocaleString()}`);
      console.log(`   Last Active: ${new Date(player.last_active * 1000).toLocaleString()}`);
      console.log(`   Valid Player: ${player.valid_player}`);
      console.log(`   Notification Types: ${player.notification_types}`);
      console.log(`   Test Type: ${player.test_type || 'Production'}`);
      
      // Check if this device can receive notifications
      if (player.valid_player && player.notification_types > 0) {
        console.log(`   ✅ CAN receive notifications`);
      } else {
        console.log(`   ❌ CANNOT receive notifications`);
        if (!player.valid_player) console.log(`      - Not a valid player`);
        if (player.notification_types <= 0) console.log(`      - Notifications disabled (${player.notification_types})`);
      }
    });
    
    // Find iOS devices specifically
    const iosDevices = data.players.filter(p => p.device_type === 0);
    console.log(`\n📱 iOS Devices: ${iosDevices.length}`);
    
    const validIosDevices = iosDevices.filter(p => p.valid_player && p.notification_types > 0);
    console.log(`✅ Valid iOS Devices (can receive notifications): ${validIosDevices.length}`);
    
    if (validIosDevices.length === 0) {
      console.log('\n❌ No valid iOS devices found that can receive notifications!');
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Make sure notification permission is granted in iOS Settings');
      console.log('2. Check if OneSignal initialization is working in your app');
      console.log('3. Verify iOS push certificate/auth key is configured in OneSignal');
    } else {
      console.log(`\n✅ Found ${validIosDevices.length} iOS device(s) that should receive notifications`);
      console.log('\n🧪 Try sending a test notification to a specific device:');
      validIosDevices.forEach(device => {
        console.log(`   node send-test-notification.js ${device.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function getDeviceTypeName(type) {
  const types = {
    0: 'iOS',
    1: 'Android',
    2: 'Amazon',
    3: 'WindowsPhone',
    4: 'Chrome Apps/Extensions',
    5: 'Chrome Web Push',
    6: 'Windows (WNS)',
    7: 'Safari',
    8: 'Firefox',
    9: 'MacOS',
    10: 'Alexa',
    11: 'Email',
    13: 'Huawei',
    14: 'SMS'
  };
  return types[type] || 'Unknown';
}

checkDevices();
