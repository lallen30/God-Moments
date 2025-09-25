import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { scheduledNotificationService } from '../../../services/ScheduledNotificationService';

const AccountSettingsScreen = () => {
  const navigation = useNavigation<any>();
  // State for notification settings
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [allowSounds, setAllowSounds] = useState(true);
  
  // State for notification times
  const [startTime, setStartTime] = useState('7:00');
  const [startTimeAmPm, setStartTimeAmPm] = useState('AM');
  const [endTime, setEndTime] = useState('4:30');
  const [endTimeAmPm, setEndTimeAmPm] = useState('PM');
  
  // State for timezone
  const [timezone, setTimezone] = useState('America/New_York');
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  
  // Loading and saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Service status
  const [serviceStatus, setServiceStatus] = useState<string>('Checking...');

  const timezones = [
    { label: 'Eastern Time', value: 'America/New_York' },
    { label: 'Central Time', value: 'America/Chicago' },
    { label: 'Mountain Time', value: 'America/Denver' },
    { label: 'Pacific Time', value: 'America/Los_Angeles' },
    { label: 'Alaska Time', value: 'America/Anchorage' },
    { label: 'Hawaii Time', value: 'Pacific/Honolulu' },
  ];

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setServiceStatus('Loading settings...');
      
      // Initialize scheduled notification service
      await scheduledNotificationService.initialize();
      
      // Load current settings from the service
      const currentSettings = await scheduledNotificationService.getCurrentSettings();
      
      // Check if user enabled notifications during onboarding
      const onboardingNotificationPref = await AsyncStorage.getItem('pushNotificationsEnabled');
      let notificationsEnabled = false;
      
      if (currentSettings.notifications_enabled !== undefined) {
        notificationsEnabled = currentSettings.notifications_enabled;
      } else if (onboardingNotificationPref !== null) {
        // Use onboarding preference if no service setting exists
        notificationsEnabled = JSON.parse(onboardingNotificationPref);
        console.log('📱 [Settings] Using onboarding notification preference:', notificationsEnabled);
      }
      
      setAllowNotifications(notificationsEnabled);
      
      if (currentSettings.start_time) {
        const [time, period] = convertTo12Hour(currentSettings.start_time);
        setStartTime(time);
        setStartTimeAmPm(period);
      }
      
      if (currentSettings.end_time) {
        const [time, period] = convertTo12Hour(currentSettings.end_time);
        setEndTime(time);
        setEndTimeAmPm(period);
      }
      
      if (currentSettings.tz) {
        setTimezone(currentSettings.tz);
      }

      // Load legacy user preferences for sounds setting
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      if (userPreferences !== null) {
        const preferences = JSON.parse(userPreferences);
        setAllowSounds(preferences.allowSounds !== undefined ? preferences.allowSounds : true);
      }
      
      // Check service status
      if (scheduledNotificationService.isServiceInitialized()) {
        setServiceStatus('Connected to notification service');
      } else {
        setServiceStatus('Service not initialized');
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setServiceStatus('Error loading settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string): [string, string] => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return [`${hour12}:${minutes}`, period];
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time: string, period: string): string => {
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (period === 'AM' && hour === 12) {
      hour = 0;
    } else if (period === 'PM' && hour !== 12) {
      hour += 12;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setServiceStatus('Saving settings...');

      console.log(' [Settings] Starting save process...');
      console.log(' [Settings] allowNotifications:', allowNotifications);
      console.log(' [Settings] timezone:', timezone);

      // Convert times to 24-hour format
      const startTime24 = convertTo24Hour(startTime, startTimeAmPm);
      const endTime24 = convertTo24Hour(endTime, endTimeAmPm);

      console.log(' [Settings] Converted times:', { startTime24, endTime24 });

      // Register/update device with the scheduled notification service
      const result = await scheduledNotificationService.registerDevice({
        tz: timezone,
        start_time: startTime24,
        end_time: endTime24,
        notifications_enabled: allowNotifications,
      });

      console.log(' [Settings] Registration result:', result);

      if (result.success) {
        // Update legacy local storage for sounds setting
        const preferences = {
          allowSounds,
          startTime,
          startTimeAmPm,
          endTime,
          endTimeAmPm,
          timezone,
          onboardingCompleted: true,
        };
        await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
        await AsyncStorage.setItem('pushNotificationsEnabled', JSON.stringify(allowNotifications));

        setServiceStatus('Settings saved successfully');
        
        Alert.alert(
          'Settings Saved',
          result.data?.rescheduled 
            ? 'Your settings have been updated and notifications have been rescheduled.'
            : 'Your account settings have been updated successfully.',
          [{ text: 'OK' }]
        );
      } else {
        setServiceStatus('Failed to save settings');
        Alert.alert('Error', result.message || 'Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setServiceStatus('Error saving settings');
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStartTimeAmPm = () => {
    setStartTimeAmPm(startTimeAmPm === 'AM' ? 'PM' : 'AM');
  };

  const toggleEndTimeAmPm = () => {
    setEndTimeAmPm(endTimeAmPm === 'AM' ? 'PM' : 'AM');
  };

  const handleTimezoneSelect = (selectedTimezone: string) => {
    setTimezone(selectedTimezone);
    setShowTimezoneModal(false);
  };

  // Get timezone display label
  const getTimezoneLabel = (value: string) => {
    const tz = timezones.find(t => t.value === value);
    return tz ? tz.label : value;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('More');
          }} 
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Allow Notifications</Text>
              <Text style={styles.settingDescription}>Allow Prayer notifications</Text>
            </View>
            <Switch
              value={allowNotifications}
              onValueChange={setAllowNotifications}
              trackColor={{ false: '#DDD', true: '#D4A574' }}
              thumbColor={allowNotifications ? '#8B4513' : '#FFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Allow Sounds</Text>
              <Text style={styles.settingDescription}>Allow prayer notification sounds</Text>
            </View>
            <Switch
              value={allowSounds}
              onValueChange={setAllowSounds}
              trackColor={{ false: '#DDD', true: '#D4A574' }}
              thumbColor={allowSounds ? '#8B4513' : '#FFF'}
            />
          </View>
        </View>

        {/* Notification Times */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notification Times</Text>
          
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="7:00"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.amPmButton, startTimeAmPm === 'AM' && styles.amPmButtonActive]}
                onPress={toggleStartTimeAmPm}
              >
                <Text style={[styles.amPmText, startTimeAmPm === 'AM' && styles.amPmTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmButton, startTimeAmPm === 'PM' && styles.amPmButtonActive]}
                onPress={toggleStartTimeAmPm}
              >
                <Text style={[styles.amPmText, startTimeAmPm === 'PM' && styles.amPmTextActive]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>End Time</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="4:30"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.amPmButton, endTimeAmPm === 'AM' && styles.amPmButtonActive]}
                onPress={toggleEndTimeAmPm}
              >
                <Text style={[styles.amPmText, endTimeAmPm === 'AM' && styles.amPmTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmButton, endTimeAmPm === 'PM' && styles.amPmButtonActive]}
                onPress={toggleEndTimeAmPm}
              >
                <Text style={[styles.amPmText, endTimeAmPm === 'PM' && styles.amPmTextActive]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Timezone */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Timezone</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowTimezoneModal(true)}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Set your timezone</Text>
              <View style={styles.timezoneContainer}>
                <Text style={styles.timezoneText}>{getTimezoneLabel(timezone)}</Text>
                <Icon name="chevron-down" size={16} color={colors.medium} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Service Status */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Service Status</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{serviceStatus}</Text>
            {scheduledNotificationService.isServiceInitialized() && (
              <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            )}
          </View>
        </View>

        {/* DEBUG SECTION - TEMPORARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Debug (Temporary)</Text>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: '#ff6b6b', marginBottom: 10 }]}
            onPress={async () => {
              try {
                console.log('🗑️ Clearing all app storage...');
                await AsyncStorage.clear();
                Alert.alert('Success', 'All app data cleared! Please restart the app.');
              } catch (error) {
                console.error('Error clearing storage:', error);
                Alert.alert('Error', 'Failed to clear storage');
              }
            }}
          >
            <Text style={styles.saveButtonText}>🗑️ Clear All App Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: '#9b59b6', marginBottom: 10 }]}
            onPress={async () => {
              try {
                console.log('🧪 Testing Laravel API directly...');
                
                // Get the same data that would be sent during registration
                await scheduledNotificationService.initialize();
                const anonUserId = scheduledNotificationService.getAnonUserId();
                const { oneSignalService } = require('../../../services/OneSignalService');
                const playerId = await oneSignalService.getOneSignalUserId();
                
                const testData = {
                  anon_user_id: anonUserId,
                  onesignal_player_id: playerId,
                  tz: timezone,
                  start_time: convertTo24Hour(startTime, startTimeAmPm),
                  end_time: convertTo24Hour(endTime, endTimeAmPm),
                  notifications_enabled: allowNotifications,
                };
                
                console.log('🧪 Test data:', testData);
                
                const response = await fetch('https://godmoments.betaplanets.com/api/devices/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  body: JSON.stringify(testData),
                });
                
                const result = await response.json();
                console.log('🧪 API Response:', result);
                
                Alert.alert('API Test Result', 
                  `Status: ${response.status}\n\n` +
                  `Success: ${result.success}\n\n` +
                  `Message: ${result.message || 'No message'}`
                );
              } catch (error) {
                console.error('🧪 API Test Error:', error);
                Alert.alert('API Test Error', error instanceof Error ? error.message : String(error));
              }
            }}
          >
            <Text style={styles.saveButtonText}>🧪 Test Laravel API</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: '#4ecdc4', marginBottom: 10 }]}
            onPress={async () => {
              try {
                const anonUserId = await AsyncStorage.getItem('anon_user_id');
                const deviceId = scheduledNotificationService.getDeviceId();
                const anonUserIdFromService = scheduledNotificationService.getAnonUserId();
                const onboardingPref = await AsyncStorage.getItem('pushNotificationsEnabled');
                
                // Import OneSignal service to check status
                const { oneSignalService } = require('../../../services/OneSignalService');
                const oneSignalPlayerId = await oneSignalService.getOneSignalUserId();
                const oneSignalInitialized = oneSignalService.isOneSignalInitialized();
                
                Alert.alert('Debug Info', 
                  `Stored anon_user_id: ${anonUserId}\n\n` +
                  `Service anonUserId: ${anonUserIdFromService}\n\n` +
                  `Device ID: ${deviceId}\n\n` +
                  `Onboarding pref: ${onboardingPref}\n\n` +
                  `OneSignal initialized: ${oneSignalInitialized}\n\n` +
                  `OneSignal player ID: ${oneSignalPlayerId}`
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to get debug info: ' + (error instanceof Error ? error.message : String(error)));
              }
            }}
          >
            <Text style={styles.saveButtonText}>🔍 Show Debug Info</Text>
          </TouchableOpacity>
        </View>

        {/* Save Settings Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <View style={styles.saveButtonContent}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🙏</Text>
          <Text style={styles.footerTitle}>God Moments</Text>
          <Text style={styles.footerSubtitle}>Made with ♡ for your spiritual journey</Text>
        </View>
      </ScrollView>

      {/* Timezone Selection Modal */}
      <Modal
        visible={showTimezoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimezoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity onPress={() => setShowTimezoneModal(false)}>
                <Icon name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timezoneList}>
              {timezones.map((tz) => (
                <TouchableOpacity
                  key={tz.value}
                  style={[
                    styles.timezoneOption,
                    timezone === tz.value && styles.timezoneOptionSelected
                  ]}
                  onPress={() => handleTimezoneSelect(tz.value)}
                >
                  <Text style={[
                    styles.timezoneOptionText,
                    timezone === tz.value && styles.timezoneOptionTextSelected
                  ]}>
                    {tz.label}
                  </Text>
                  {timezone === tz.value && (
                    <Icon name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    zIndex: 1000,
    position: 'absolute',
    left: 20,
    top: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    marginLeft: -32, // Compensate for back button width
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.medium,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.medium,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginRight: 12,
  },
  amPmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginLeft: 4,
  },
  amPmButtonActive: {
    backgroundColor: '#D4A574',
  },
  amPmText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  amPmTextActive: {
    color: '#8B4513',
  },
  timezoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  timezoneText: {
    fontSize: 16,
    color: colors.textDark,
  },
  saveButton: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 12,
    color: colors.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
  },
  timezoneList: {
    paddingHorizontal: 20,
  },
  timezoneOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  timezoneOptionSelected: {
    backgroundColor: colors.accentLight,
  },
  timezoneOptionText: {
    fontSize: 16,
    color: colors.textDark,
  },
  timezoneOptionTextSelected: {
    color: colors.accent,
    fontWeight: '500',
  },
  // Service status styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light,
  },
  statusText: {
    fontSize: 14,
    color: colors.textDark,
    flex: 1,
  },
  // Save button loading states
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AccountSettingsScreen;
