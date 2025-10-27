import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { oneSignalService } from '../services/OneSignalService';

interface DiagnosticInfo {
  isInitialized: boolean;
  hasPermission: string;
  hasValidSubscription: boolean;
  userId: string | null;
  retryAttempts: number;
  debugEvents: Array<{ timestamp: string; label: string; payload: any }>;
}

export const OneSignalDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const isInitialized = oneSignalService.isOneSignalInitialized();
      const hasPermission = oneSignalService.getNotificationPermission();
      const hasValidSubscription = await oneSignalService.hasValidPushSubscription();
      const userId = await oneSignalService.getOneSignalUserId();
      const retryAttempts = oneSignalService.getRetryAttempts();
      const debugEvents = await oneSignalService.getDebugEvents();

      setDiagnostics({
        isInitialized,
        hasPermission,
        hasValidSubscription,
        userId,
        retryAttempts,
        debugEvents: debugEvents.slice(0, 10), // Show last 10 events
      });
    } catch (error) {
      console.error('Error loading diagnostics:', error);
      Alert.alert('Error', 'Failed to load diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRetry = async () => {
    Alert.alert(
      'Retry Subscription',
      'This will attempt to re-register with OneSignal. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await oneSignalService.manualSubscriptionCheck();
              if (success) {
                Alert.alert('Success', 'Subscription registered successfully!');
              } else {
                Alert.alert(
                  'Still Not Subscribed',
                  'Subscription retry completed but device is still showing as "Never Subscribed". This usually indicates:\n\n' +
                  '1. APNS certificate issue in OneSignal dashboard\n' +
                  '2. Wrong certificate environment (Dev vs Prod)\n' +
                  '3. iOS 18 requires Production certificate even for TestFlight\n\n' +
                  'Please check OneSignal dashboard settings.'
                );
              }
              await loadDiagnostics();
            } catch (error) {
              Alert.alert('Error', 'Retry failed. Check console logs.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetRetryCounter = () => {
    oneSignalService.resetRetryCounter();
    Alert.alert('Success', 'Retry counter has been reset');
    loadDiagnostics();
  };

  const handleClearDebugLogs = async () => {
    await oneSignalService.clearDebugEvents();
    Alert.alert('Success', 'Debug logs cleared');
    loadDiagnostics();
  };

  useEffect(() => {
    if (expanded) {
      loadDiagnostics();
    }
  }, [expanded]);

  const getStatusColor = (status: boolean | string): string => {
    if (typeof status === 'boolean') {
      return status ? '#4CAF50' : '#F44336';
    }
    return status === 'Granted' ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (status: boolean | string): string => {
    if (typeof status === 'boolean') {
      return status ? '✅ Yes' : '❌ No';
    }
    return status === 'Granted' ? '✅ Granted' : '❌ ' + status;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerText}>
          {expanded ? '▼' : '▶'} OneSignal Diagnostics
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : diagnostics ? (
            <ScrollView style={styles.scrollView}>
              {/* Status Overview */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status Overview</Text>
                
                <View style={styles.row}>
                  <Text style={styles.label}>Initialized:</Text>
                  <Text style={[styles.value, { color: getStatusColor(diagnostics.isInitialized) }]}>
                    {getStatusText(diagnostics.isInitialized)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Permission:</Text>
                  <Text style={[styles.value, { color: getStatusColor(diagnostics.hasPermission) }]}>
                    {getStatusText(diagnostics.hasPermission)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Valid Subscription:</Text>
                  <Text style={[styles.value, { color: getStatusColor(diagnostics.hasValidSubscription) }]}>
                    {getStatusText(diagnostics.hasValidSubscription)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>User ID:</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {diagnostics.userId || 'Not available'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Retry Attempts:</Text>
                  <Text style={styles.value}>
                    {diagnostics.retryAttempts} / 5
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleManualRetry}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>🔄 Manual Retry</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={loadDiagnostics}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>🔍 Refresh Status</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleResetRetryCounter}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>↺ Reset Retry Counter</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Debug Events */}
              {diagnostics.debugEvents.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.debugHeader}>
                    <Text style={styles.sectionTitle}>Recent Events</Text>
                    <TouchableOpacity onPress={handleClearDebugLogs}>
                      <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {diagnostics.debugEvents.map((event, index) => (
                    <View key={index} style={styles.eventRow}>
                      <Text style={styles.eventTime}>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </Text>
                      <Text style={styles.eventLabel}>{event.label}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Troubleshooting Tips */}
              {!diagnostics.hasValidSubscription && (
                <View style={[styles.section, styles.warningSection]}>
                  <Text style={styles.sectionTitle}>⚠️ Troubleshooting</Text>
                  <Text style={styles.tipText}>
                    Your device shows as "Never Subscribed". Common causes:
                  </Text>
                  <Text style={styles.tipItem}>
                    • APNS certificate not uploaded to OneSignal
                  </Text>
                  <Text style={styles.tipItem}>
                    • Wrong certificate environment (Dev vs Prod)
                  </Text>
                  <Text style={styles.tipItem}>
                    • Bundle ID mismatch
                  </Text>
                  <Text style={styles.tipItem}>
                    • iOS 18 requires Production certificate for TestFlight
                  </Text>
                  <Text style={[styles.tipText, { marginTop: 10 }]}>
                    The app will automatically retry when you close and reopen it.
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={loadDiagnostics}
            >
              <Text style={styles.buttonText}>Load Diagnostics</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 15,
    backgroundColor: '#fff',
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
  },
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
    width: 80,
  },
  eventLabel: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  warningSection: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 5,
  },
  tipItem: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 10,
    marginBottom: 3,
  },
});
