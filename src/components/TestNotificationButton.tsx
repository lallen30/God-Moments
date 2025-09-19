import React from 'react';
import { Button, Alert } from 'react-native';
import Config from 'react-native-config';
import axios from 'axios';

interface TestNotificationButtonProps {
  disabled?: boolean;
}

const TestNotificationButton: React.FC<TestNotificationButtonProps> = ({ disabled = false }) => {
  const sendTestNotification = async () => {
    try {
      if (!Config.ONESIGNAL_APP_ID || !Config.ONESIGNAL_REST_API_KEY) {
        Alert.alert('Error', 'OneSignal configuration is missing');
        return;
      }

      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: Config.ONESIGNAL_APP_ID,
          included_segments: ['Subscribed Users'],
          contents: {
            en: 'This is a test notification from the app',
          },
          name: 'TEST_NOTIFICATION',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Config.ONESIGNAL_REST_API_KEY}`,
          },
        }
      );

      console.log('Test notification sent:', response.data);
      Alert.alert('Success', 'Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Check console for details.');
    }
  };

  return (
    <Button
      title="Send Test Notification"
      onPress={sendTestNotification}
      disabled={disabled || !Config.ONESIGNAL_APP_ID}
    />
  );
};

export default TestNotificationButton;
