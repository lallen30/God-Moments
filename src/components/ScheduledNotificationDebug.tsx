import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { scheduledNotificationService } from '../services/ScheduledNotificationService';
import { oneSignalService } from '../services/OneSignalService';
import type { ScheduledNotificationInfo } from '../services/ScheduledNotificationService';

interface DebugInfo {
  serviceInitialized: boolean;
  oneSignalInitialized: boolean;
  deviceId: string | null;
  anonUserId: string | null;
  oneSignalPlayerId: string | null;
  currentSettings: any;
  schedule: ScheduledNotificationInfo[];
}

const ScheduledNotificationDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    serviceInitialized: false,
    oneSignalInitialized: false,
    deviceId: null,
    anonUserId: null,
    oneSignalPlayerId: null,
    currentSettings: {},
    schedule: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      setIsLoading(true);
      
      const serviceInitialized = scheduledNotificationService.isServiceInitialized();
      const oneSignalInitialized = oneSignalService.isOneSignalInitialized();
      const deviceId = scheduledNotificationService.getDeviceId();
      const anonUserId = scheduledNotificationService.getAnonUserId();
      const oneSignalPlayerId = await oneSignalService.getOneSignalUserId();
      const currentSettings = await scheduledNotificationService.getCurrentSettings();
      const schedule = await scheduledNotificationService.getDeviceSchedule(3);

      setDebugInfo({
        serviceInitialized,
        oneSignalInitialized,
        deviceId,
        anonUserId,
        oneSignalPlayerId,
        currentSettings,
        schedule,
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRegistration = async () => {
    try {
      setIsRegistering(true);
      const result = await scheduledNotificationService.forceReregistration();
      
      if (result.success) {
        Alert.alert('Success', 'Device registered successfully!');
        await loadDebugInfo(); // Refresh debug info
      } else {
        Alert.alert('Error', result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Force registration error:', error);
      Alert.alert('Error', 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const result = await scheduledNotificationService.updateSettings({
        notifications_enabled: true,
        start_time: '09:00',
        end_time: '21:00',
      });
      
      if (result.success) {
        Alert.alert('Success', 'Test settings updated! Check your schedule.');
        await loadDebugInfo();
      } else {
        Alert.alert('Error', result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Error', 'Test failed');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D4A574" />
        <Text style={styles.loadingText}>Loading debug info...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔔 Scheduled Notifications Debug</Text>
      
      {/* Service Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Scheduled Service:</Text>
          <Text style={[styles.value, { color: debugInfo.serviceInitialized ? '#4CAF50' : '#F44336' }]}>
            {debugInfo.serviceInitialized ? '✅ Initialized' : '❌ Not Initialized'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>OneSignal Service:</Text>
          <Text style={[styles.value, { color: debugInfo.oneSignalInitialized ? '#4CAF50' : '#F44336' }]}>
            {debugInfo.oneSignalInitialized ? '✅ Initialized' : '❌ Not Initialized'}
          </Text>
        </View>
      </View>

      {/* Device Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Device ID:</Text>
          <Text style={styles.value}>{debugInfo.deviceId || 'Not registered'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Anon User ID:</Text>
          <Text style={styles.value}>{debugInfo.anonUserId || 'Not generated'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>OneSignal Player ID:</Text>
          <Text style={styles.value}>{debugInfo.oneSignalPlayerId || 'Not available'}</Text>
        </View>
      </View>

      {/* Current Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Settings</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Notifications Enabled:</Text>
          <Text style={styles.value}>
            {debugInfo.currentSettings.notifications_enabled !== undefined 
              ? (debugInfo.currentSettings.notifications_enabled ? 'Yes' : 'No')
              : 'Not set'
            }
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Time Window:</Text>
          <Text style={styles.value}>
            {debugInfo.currentSettings.start_time && debugInfo.currentSettings.end_time
              ? `${debugInfo.currentSettings.start_time} - ${debugInfo.currentSettings.end_time}`
              : 'Not set'
            }
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Timezone:</Text>
          <Text style={styles.value}>{debugInfo.currentSettings.tz || 'Not set'}</Text>
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Notifications ({debugInfo.schedule.length})</Text>
        {debugInfo.schedule.length > 0 ? (
          debugInfo.schedule.map((notification, index) => (
            <View key={notification.id} style={styles.notificationItem}>
              <Text style={styles.notificationTime}>
                {new Date(notification.scheduled_at_local).toLocaleString()}
              </Text>
              <Text style={[styles.notificationStatus, { 
                color: notification.status === 'queued' ? '#FF9800' : 
                       notification.status === 'sent' ? '#4CAF50' : '#F44336' 
              }]}>
                {notification.status.toUpperCase()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No scheduled notifications</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadDebugInfo}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleForceRegistration}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              📱 Force Registration
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={handleTestNotification}
        >
          <Text style={[styles.buttonText, styles.testButtonText]}>
            🧪 Test Settings
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF6E9',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#747D8B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationTime: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  notificationStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  primaryButton: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  primaryButtonText: {
    color: '#FFF',
  },
  testButtonText: {
    color: '#FFF',
  },
});

export default ScheduledNotificationDebug;
