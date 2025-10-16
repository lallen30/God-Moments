import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
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
  
  // Number picker modal state
  const [showNumberPickerModal, setShowNumberPickerModal] = useState(false);
  const [activePicker, setActivePicker] = useState<
    'start-hour' | 'start-minute' | 'end-hour' | 'end-minute' | null
  >(null);

  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const parseTime = (time: string): { hour: string; minute: string } => {
    const [h, m] = time.split(':');
    return { hour: h.replace(/^0+/, '') || '0', minute: m || '00' };
  };

  const composeTime = (hour: string, minute: string): string => {
    const h = parseInt(hour || '0', 10);
    const m = parseInt(minute || '0', 10);
    // Note: Hour is NOT padded for 12-hour display (e.g., "8:03" not "08:03")
    // But this is fine because convertTo24Hour handles it correctly
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const timezones = [
    // United States
    { label: 'Eastern Time', value: 'America/New_York' },
    { label: 'Central Time', value: 'America/Chicago' },
    { label: 'Mountain Time', value: 'America/Denver' },
    { label: 'Pacific Time', value: 'America/Los_Angeles' },
    { label: 'Alaska Time', value: 'America/Anchorage' },
    { label: 'Hawaii Time', value: 'Pacific/Honolulu' },
    // Europe
    { label: 'Ireland (Dublin)', value: 'Europe/Dublin' },
    { label: 'United Kingdom (London)', value: 'Europe/London' },
    { label: 'Central European Time', value: 'Europe/Paris' },
    { label: 'Eastern European Time', value: 'Europe/Athens' },
    // Africa
    { label: 'South Africa (Johannesburg)', value: 'Africa/Johannesburg' },
    { label: 'Nigeria (Lagos)', value: 'Africa/Lagos' },
    { label: 'Kenya (Nairobi)', value: 'Africa/Nairobi' },
    { label: 'Egypt (Cairo)', value: 'Africa/Cairo' },
    // Asia
    { label: 'India (Mumbai)', value: 'Asia/Kolkata' },
    { label: 'Philippines (Manila)', value: 'Asia/Manila' },
    { label: 'Singapore', value: 'Asia/Singapore' },
    { label: 'Japan (Tokyo)', value: 'Asia/Tokyo' },
    { label: 'China (Beijing)', value: 'Asia/Shanghai' },
    // Australia & Pacific
    { label: 'Australia (Sydney)', value: 'Australia/Sydney' },
    { label: 'Australia (Melbourne)', value: 'Australia/Melbourne' },
    { label: 'Australia (Brisbane)', value: 'Australia/Brisbane' },
    { label: 'Australia (Perth)', value: 'Australia/Perth' },
    { label: 'New Zealand (Auckland)', value: 'Pacific/Auckland' },
    // Americas (Other)
    { label: 'Canada (Toronto)', value: 'America/Toronto' },
    { label: 'Mexico (Mexico City)', value: 'America/Mexico_City' },
    { label: 'Brazil (São Paulo)', value: 'America/Sao_Paulo' },
    { label: 'Argentina (Buenos Aires)', value: 'America/Argentina/Buenos_Aires' },
  ];

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setServiceStatus('Initializing notification service...');
      
      // Initialize scheduled notification service and wait for it to complete
      await scheduledNotificationService.initialize();
      
      // Verify service is properly initialized before proceeding
      if (!scheduledNotificationService.isServiceInitialized()) {
        console.warn('⚠️ [Settings] Service initialization incomplete, retrying...');
        setServiceStatus('Retrying initialization...');
        await scheduledNotificationService.initialize();
      }
      
      setServiceStatus('Loading settings...');
      
      // Load current settings from the service
      const currentSettings = await scheduledNotificationService.getCurrentSettings();
      console.log('📱 [Settings] Current settings from service:', currentSettings);
      
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
      
      // Load legacy user preferences for sounds setting and fallback time settings
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      let preferencesData = null;
      if (userPreferences !== null) {
        preferencesData = JSON.parse(userPreferences);
        console.log('📱 [Settings] Local preferences data:', preferencesData);
        setAllowSounds(preferencesData.allowSounds !== undefined ? preferencesData.allowSounds : true);
      }

      // Load time settings from service first, then fallback to local storage
      if (currentSettings.start_time) {
        const [time, period] = convertTo12Hour(currentSettings.start_time);
        setStartTime(time);
        setStartTimeAmPm(period);
      } else if (preferencesData?.startTime) {
        // Fallback to local storage if service doesn't have start time
        setStartTime(preferencesData.startTime);
        setStartTimeAmPm(preferencesData.startTimeAmPm || 'AM');
      }
      
      if (currentSettings.end_time) {
        const [time, period] = convertTo12Hour(currentSettings.end_time);
        setEndTime(time);
        setEndTimeAmPm(period);
      } else if (preferencesData?.endTime) {
        // Fallback to local storage if service doesn't have end time
        setEndTime(preferencesData.endTime);
        setEndTimeAmPm(preferencesData.endTimeAmPm || 'PM');
      }
      
      if (currentSettings.tz) {
        setTimezone(currentSettings.tz);
      } else if (preferencesData?.timezone) {
        // Fallback to local storage timezone, convert to IANA format if needed
        const timezoneMap: { [key: string]: string } = {
          // United States
          'Eastern Time': 'America/New_York',
          'Central Time': 'America/Chicago',
          'Mountain Time': 'America/Denver',
          'Pacific Time': 'America/Los_Angeles',
          'Alaska Time': 'America/Anchorage',
          'Hawaii Time': 'Pacific/Honolulu',
          // Europe
          'Ireland (Dublin)': 'Europe/Dublin',
          'United Kingdom (London)': 'Europe/London',
          'Central European Time': 'Europe/Paris',
          'Eastern European Time': 'Europe/Athens',
          // Africa
          'South Africa (Johannesburg)': 'Africa/Johannesburg',
          'Nigeria (Lagos)': 'Africa/Lagos',
          'Kenya (Nairobi)': 'Africa/Nairobi',
          'Egypt (Cairo)': 'Africa/Cairo',
          // Asia
          'India (Mumbai)': 'Asia/Kolkata',
          'Philippines (Manila)': 'Asia/Manila',
          'Singapore': 'Asia/Singapore',
          'Japan (Tokyo)': 'Asia/Tokyo',
          'China (Beijing)': 'Asia/Shanghai',
          // Australia & Pacific
          'Australia (Sydney)': 'Australia/Sydney',
          'Australia (Melbourne)': 'Australia/Melbourne',
          'Australia (Brisbane)': 'Australia/Brisbane',
          'Australia (Perth)': 'Australia/Perth',
          'New Zealand (Auckland)': 'Pacific/Auckland',
          // Americas (Other)
          'Canada (Toronto)': 'America/Toronto',
          'Mexico (Mexico City)': 'America/Mexico_City',
          'Brazil (São Paulo)': 'America/Sao_Paulo',
          'Argentina (Buenos Aires)': 'America/Argentina/Buenos_Aires',
        };
        const ianaTimezone = timezoneMap[preferencesData.timezone] || preferencesData.timezone;
        setTimezone(ianaTimezone);
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

      console.log('💾 [Settings] Starting save process...');
      console.log('💾 [Settings] Service initialized:', scheduledNotificationService.isServiceInitialized());
      console.log('💾 [Settings] Current device ID:', scheduledNotificationService.getDeviceId());
      console.log('💾 [Settings] Current anon user ID:', scheduledNotificationService.getAnonUserId());
      console.log('💾 [Settings] allowNotifications:', allowNotifications);
      console.log('💾 [Settings] timezone:', timezone);
      console.log('💾 [Settings] 12-hour times BEFORE conversion:', {
        startTime,
        startTimeAmPm,
        endTime,
        endTimeAmPm,
      });

      // Convert times to 24-hour format
      const startTime24 = convertTo24Hour(startTime, startTimeAmPm);
      const endTime24 = convertTo24Hour(endTime, endTimeAmPm);

      console.log('💾 [Settings] 24-hour times AFTER conversion:', { startTime24, endTime24 });

      // Check if service is initialized
      if (!scheduledNotificationService.isServiceInitialized()) {
        console.warn('⚠️ [Settings] Service not initialized, attempting to initialize...');
        setServiceStatus('Initializing service...');
        await scheduledNotificationService.initialize();
        
        // Double-check initialization succeeded
        if (!scheduledNotificationService.isServiceInitialized()) {
          throw new Error('Failed to initialize notification service. Please try again.');
        }
      }
      
      // Verify we have required IDs after initialization
      const deviceId = scheduledNotificationService.getDeviceId();
      const anonUserId = scheduledNotificationService.getAnonUserId();
      
      console.log('💾 [Settings] Post-initialization check:', {
        isInitialized: scheduledNotificationService.isServiceInitialized(),
        hasDeviceId: !!deviceId,
        hasAnonUserId: !!anonUserId,
      });

      // Update device settings with the scheduled notification service
      const result = await scheduledNotificationService.updateSettings({
        tz: timezone,
        start_time: startTime24,
        end_time: endTime24,
        notifications_enabled: allowNotifications,
      });

      console.log('💾 [Settings] Update result:', result);
      
      // TEMPORARY: Alert to show result in UI
      if (!result.success) {
        console.error('💾 [Settings] DETAILED ERROR:', JSON.stringify(result, null, 2));
      }

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
        console.error('❌ [Settings] Update failed:', result);
        
        // Show more detailed error message with specific guidance
        const errorMsg = result.error || result.message || 'Unknown error occurred';
        let userMessage = `Settings update failed:\n${errorMsg}`;
        
        // Add specific guidance based on error type
        if (errorMsg.includes('OneSignal')) {
          userMessage += '\n\nPlease wait a moment for notifications to initialize, then try again.';
        } else if (errorMsg.includes('initialized')) {
          userMessage += '\n\nPlease close and reopen the app, then try again.';
        } else {
          userMessage += '\n\nPlease check your internet connection and try again.';
        }
        
        Alert.alert('Error', userMessage);
      }
    } catch (error) {
      console.error('❌ [Settings] Error saving settings:', error);
      console.error('❌ [Settings] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      setServiceStatus('Error saving settings');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error', 
        `Failed to save settings: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`
      );
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

  const handleNotificationToggle = (value: boolean) => {
    setAllowNotifications(value);
    
    // If user is turning notifications OFF, show helpful guidance
    if (!value) {
      Alert.alert(
        'Notifications Disabled',
        'Prayer notifications are now disabled in the app. If you want to completely stop all notifications, you can also disable them in your iPhone Settings:\n\nSettings > Notifications > God Moments > Allow Notifications',
        [
          { text: 'Got it', style: 'default' },
          { 
            text: 'Open Settings', 
            style: 'default',
            onPress: () => {
              Linking.openSettings();
            }
          }
        ]
      );
    }
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
              <Text style={styles.settingDescription}>
                {allowNotifications 
                  ? "Prayer notifications are enabled" 
                  : "Prayer notifications are disabled. Note: To fully disable notifications, also turn them off in iOS Settings > Notifications > God Moments"
                }
              </Text>
            </View>
            <Switch
              value={allowNotifications}
              onValueChange={handleNotificationToggle}
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
              <TouchableOpacity
                style={styles.timeDropdown}
                onPress={() => {
                  setActivePicker('start-hour');
                  setShowNumberPickerModal(true);
                }}
              >
                <Text style={styles.timeDropdownText}>{parseTime(startTime).hour || '7'}</Text>
              </TouchableOpacity>
              <Text style={styles.colonText}>:</Text>
              <TouchableOpacity
                style={styles.timeDropdown}
                onPress={() => {
                  setActivePicker('start-minute');
                  setShowNumberPickerModal(true);
                }}
              >
                <Text style={styles.timeDropdownText}>{parseTime(startTime).minute || '00'}</Text>
              </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.timeDropdown}
                onPress={() => {
                  setActivePicker('end-hour');
                  setShowNumberPickerModal(true);
                }}
              >
                <Text style={styles.timeDropdownText}>{parseTime(endTime).hour || '4'}</Text>
              </TouchableOpacity>
              <Text style={styles.colonText}>:</Text>
              <TouchableOpacity
                style={styles.timeDropdown}
                onPress={() => {
                  setActivePicker('end-minute');
                  setShowNumberPickerModal(true);
                }}
              >
                <Text style={styles.timeDropdownText}>{parseTime(endTime).minute || '30'}</Text>
              </TouchableOpacity>
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
          <Image source={require('../../../assets/images/footer-icon.png')} style={styles.footerIcon} resizeMode="contain" />
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

      {/* Number Picker Modal for Hour/Minute */}
      <Modal
        visible={showNumberPickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNumberPickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === 'start-hour' && 'Select Start Hour (1–12)'}
                {activePicker === 'start-minute' && 'Select Start Minute (00–59)'}
                {activePicker === 'end-hour' && 'Select End Hour (1–12)'}
                {activePicker === 'end-minute' && 'Select End Minute (00–59)'}
              </Text>
              <TouchableOpacity onPress={() => setShowNumberPickerModal(false)}>
                <Icon name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {(
                activePicker?.includes('hour') ? hourOptions : minuteOptions
              ).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.numberOption}
                  onPress={() => {
                    if (!activePicker) return;
                    if (activePicker === 'start-hour') {
                      const { minute } = parseTime(startTime);
                      setStartTime(composeTime(opt, minute));
                    } else if (activePicker === 'start-minute') {
                      const { hour } = parseTime(startTime);
                      setStartTime(composeTime(hour, opt));
                    } else if (activePicker === 'end-hour') {
                      const { minute } = parseTime(endTime);
                      setEndTime(composeTime(opt, minute));
                    } else if (activePicker === 'end-minute') {
                      const { hour } = parseTime(endTime);
                      setEndTime(composeTime(hour, opt));
                    }
                    setShowNumberPickerModal(false);
                  }}
                >
                  <Text style={styles.numberOptionText}>{opt}</Text>
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
    fontFamily: 'Newsreader',
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
  timeDropdown: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  timeDropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  colonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
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
    width: 12,
    height: 14,
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
  numberOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  numberOptionText: {
    fontSize: 16,
    color: colors.textDark,
  },
});

export default AccountSettingsScreen;
