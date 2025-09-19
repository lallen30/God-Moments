#!/usr/bin/env node

/**
 * OneSignal Test Notification Sender
 *
 * This script sends a test push notification to a specific OneSignal User ID
 * Usage: node send-test-notification.js <user-id>
 */

const https = require('https');

// OneSignal Configuration
const ONESIGNAL_APP_ID = '2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965';
const ONESIGNAL_REST_API_KEY =
  'os_v2_app_fpylpn6b75dy7jtbtw5xuxyjmvgkzbn6sr2ewg5kndclutnaacz54ikmcv2ixm6qchf3nkfac4c5lbp6icbmg2nif24dpt5wdyttzby';

function sendTestNotification(userId) {
  if (!userId) {
    console.error('❌ Error: Please provide a OneSignal User ID');
    console.log('Usage: node send-test-notification.js <user-id>');
    process.exit(1);
  }

  const data = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    include_subscription_ids: [userId], // For OneSignal v5
    headings: { en: '🔔 Test Notification' },
    contents: {
      en: "This is a test push notification from your MIIN Ojibwe app! If you're seeing this, OneSignal is working correctly. 🎉",
    },
    data: { test: true },
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
  });

  const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      'Content-Length': data.length,
    },
  };

  console.log('📤 Sending test notification...');
  console.log(`👤 Target User ID: ${userId}`);

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);

        if (res.statusCode === 200) {
          console.log('✅ Notification sent successfully!');
          console.log(`📊 Notification ID: ${response.id}`);
          console.log(`📱 Recipients: ${response.recipients || 0}`);

          if (response.recipients === 0) {
            console.log(
              '⚠️  Warning: 0 recipients - check if the User ID is correct and the device is registered'
            );
          }
        } else {
          console.log('❌ Error sending notification:');
          console.log(response);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Network error:', error);
  });

  req.write(data);
  req.end();
}

// Get User ID from command line arguments
const userId = process.argv[2];
sendTestNotification(userId);
