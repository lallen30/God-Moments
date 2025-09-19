// OneSignal Push Notification Test Script
// This script helps test push notifications by sending a test notification

const axios = require('axios');

// Configuration - get these from your OneSignal dashboard
const ONESIGNAL_APP_ID = '2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965';
const ONESIGNAL_REST_API_KEY = 'os_v2_app_fpylpn6b75dy7jtbtw5xuxyjmvgkzbn6sr2ewg5kndclutnaacz54ikmcv2ixm6qchf3nkfac4c5lbp6icbmg2nif24dpt5wdyttzby';

async function sendTestPushNotification() {
  try {
    console.log('🚀 Sending test push notification...');
    
    const response = await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'], // Send to all users
      headings: { en: 'MIIN Ojibwe Test' },
      contents: { en: 'This is a test push notification from your MIIN Ojibwe app!' },
      data: {
        test: true,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test notification sent successfully!');
    console.log('📊 Response:', response.data);
    console.log('📱 Check your device for the notification');
    
  } catch (error) {
    console.error('❌ Error sending test notification:', error.response?.data || error.message);
  }
}

// Run the test
sendTestPushNotification();