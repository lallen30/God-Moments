import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { oneSignalService } from '../services/OneSignalService';

interface UserInfo {
  userId: string;
  isInitialized: string;
  notificationPermission: string;
  timestamp: string;
}

export const OneSignalDebugScreen: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkOneSignalStatus = useCallback(async () => {
    try {
      console.log('OneSignal Debug Screen - Starting status check...');
      
      // Check if OneSignal is initialized
      const isInitialized = oneSignalService.isOneSignalInitialized();
      console.log('OneSignal Debug Screen - isInitialized:', isInitialized);
      
      // Get OneSignal User ID
      const userId = await oneSignalService.getOneSignalUserId();
      console.log('OneSignal Debug Screen - userId:', userId);
      
      // Get notification permission status
      const notificationPermission = oneSignalService.getNotificationPermission();
      console.log('OneSignal Debug Screen - notificationPermission:', notificationPermission);
      
      const newUserInfo: UserInfo = {
        userId: userId || 'Not Available',
        isInitialized: isInitialized ? 'YES' : 'NO',
        notificationPermission: notificationPermission,
        timestamp: new Date().toLocaleString(),
      };
      
      setUserInfo(newUserInfo);
      setError(null);
      
    } catch (err) {
      console.error('Error checking OneSignal status:', err);
      const errorMessage = err?.toString() || 'Unknown error';
      
      setError(errorMessage);
      setUserInfo({
        userId: 'Error',
        isInitialized: 'Error',
        notificationPermission: 'Error',
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initializeStatus = async () => {
      if (mounted) {
        await checkOneSignalStatus();
      }
    };
    
    initializeStatus();
    
    return () => {
      mounted = false;
    };
  }, [checkOneSignalStatus]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await checkOneSignalStatus();
  }, [checkOneSignalStatus]);

  const copyUserId = useCallback(() => {
    if (userInfo?.userId && userInfo.userId !== 'Not Available' && userInfo.userId !== 'Error' && userInfo.userId !== 'Initialized - ID pending...') {
      Alert.alert(
        'OneSignal User ID',
        `Copy this ID to send test notifications:\n\n${userInfo.userId}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'No valid User ID available yet. Wait for registration to complete or try Force Registration.');
    }
  }, [userInfo?.userId]);

  const forceRegistration = useCallback(async () => {
    try {
      console.log('🔄 Forcing OneSignal user registration...');
      await oneSignalService.forceUserRegistration();
      Alert.alert('Force Registration', 'Attempted to force user registration. Wait 10 seconds then refresh status.');
      
      // Auto-refresh after a delay
      setTimeout(() => {
        handleRefresh();
      }, 10000);
    } catch (error) {
      console.error('Error forcing registration:', error);
      Alert.alert('Error', 'Failed to force registration');
    }
  }, [handleRefresh]);

  const showInstructions = useCallback(() => {
    Alert.alert(
      'How to Test Push Notifications',
      `1. Wait for OneSignal User ID to appear (may take 1-2 minutes)\n\n2. If User ID doesn't appear:\n   - Tap "Force Registration"\n   - Check internet connection\n   - Restart the app\n\n3. Once you have a User ID:\n   - Copy it and run: node send-test-notification.js <user-id>\n   - Or use OneSignal Dashboard to send test notifications\n\n4. The notification should appear on your device within 30 seconds`,
      [{ text: 'Got it!' }]
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking OneSignal status...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OneSignal Debug Info</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>📱 Device Registration</Text>
        <Text style={styles.infoLabel}>OneSignal User ID:</Text>
        <Text style={styles.infoValue}>{userInfo?.userId}</Text>
        
        <Text style={styles.infoLabel}>Initialized:</Text>
        <Text style={styles.infoValue}>{userInfo?.isInitialized}</Text>
        
        <Text style={styles.infoLabel}>Notification Permission:</Text>
        <Text style={styles.infoValue}>{userInfo?.notificationPermission}</Text>
        
        <Text style={styles.infoLabel}>Last Check:</Text>
        <Text style={styles.infoValue}>{userInfo?.timestamp}</Text>
        
        {error && (
          <>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorValue}>{error}</Text>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
          <Text style={styles.buttonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={copyUserId}>
          <Text style={styles.buttonText}>📋 Copy User ID</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.forceButton} onPress={forceRegistration}>
          <Text style={styles.buttonText}>🚀 Force Registration</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.instructionButton} onPress={showInstructions}>
          <Text style={styles.buttonText}>❓ How to Test</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>⚠️ Important Notes</Text>
        <Text style={styles.noticeText}>
          • Push notifications don't work reliably in iOS Simulator{'\n'}
          • Use a physical device for proper testing{'\n'}
          • Make sure notifications are enabled in device Settings{'\n'}
          • Send test notifications from OneSignal Dashboard, not from the app
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  errorLabel: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 12,
    marginBottom: 4,
  },
  errorValue: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  forceButton: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  instructionButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  noticeCard: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#856404',
  },
  noticeText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
