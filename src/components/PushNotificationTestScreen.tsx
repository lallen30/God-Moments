import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PushNotificationDebugger } from '../utils/PushNotificationDebugger';

export const PushNotificationTestScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Push Notification Debug Tools</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Debug Information</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => PushNotificationDebugger.checkPushNotificationStatus()}
        >
          <Text style={styles.buttonText}>Check Push Notification Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Permissions</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => PushNotificationDebugger.requestNotificationPermission()}
        >
          <Text style={styles.buttonText}>Check Notification Permission</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Testing</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => PushNotificationDebugger.sendTestNotification()}
        >
          <Text style={styles.buttonText}>Get OneSignal User ID</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Testing Tips</Text>
        <Text style={styles.infoText}>
          • iOS Simulator has limited push notification support{'\n'}
          • For full testing, use a physical device{'\n'}
          • Check the console logs for detailed information{'\n'}
          • Use the OneSignal User ID to send test notifications
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});
