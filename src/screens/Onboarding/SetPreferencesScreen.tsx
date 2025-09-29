import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { scheduledNotificationService } from '../../services/ScheduledNotificationService';

interface SetPreferencesScreenProps {
  navigation: any;
}

const SetPreferencesScreen: React.FC<SetPreferencesScreenProps> = ({ navigation }) => {
  const [allowSounds, setAllowSounds] = useState(true);
  const [startTime, setStartTime] = useState('7:00');
  const [startTimeAmPm, setStartTimeAmPm] = useState('AM');
  const [endTime, setEndTime] = useState('4:30');
  const [endTimeAmPm, setEndTimeAmPm] = useState('PM');
  const [timezone, setTimezone] = useState('Eastern Time');
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
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
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

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

  const handleContinue = async () => {
    try {
      setIsCompleting(true);
      console.log('🚀 [Onboarding] Starting completion process...');

      // Save preferences to local storage
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
      await AsyncStorage.setItem('onboardingStep', 'completed');
      console.log('✅ [Onboarding] Saved preferences to local storage');

      // Get push notification preference from onboarding
      const pushNotificationsEnabled = await AsyncStorage.getItem('pushNotificationsEnabled');
      const notificationsEnabled = pushNotificationsEnabled ? JSON.parse(pushNotificationsEnabled) : false;
      console.log('📱 [Onboarding] Push notifications enabled:', notificationsEnabled);

      // If notifications are enabled, register with Laravel
      if (notificationsEnabled) {
        console.log('🔔 [Onboarding] Registering device with Laravel...');
        
        // Initialize the scheduled notification service
        await scheduledNotificationService.initialize();
        
        // Convert timezone to IANA format
        const timezoneMap: { [key: string]: string } = {
          'Eastern Time': 'America/New_York',
          'Central Time': 'America/Chicago',
          'Mountain Time': 'America/Denver',
          'Pacific Time': 'America/Los_Angeles',
        };
        const ianaTimezone = timezoneMap[timezone] || 'America/New_York';

        // Register device with Laravel
        console.log('🔔 [Onboarding] About to call registerDevice with:', {
          tz: ianaTimezone,
          start_time: convertTo24Hour(startTime, startTimeAmPm),
          end_time: convertTo24Hour(endTime, endTimeAmPm),
          notifications_enabled: notificationsEnabled,
        });

        const result = await scheduledNotificationService.registerDevice({
          tz: ianaTimezone,
          start_time: convertTo24Hour(startTime, startTimeAmPm),
          end_time: convertTo24Hour(endTime, endTimeAmPm),
          notifications_enabled: notificationsEnabled,
        });

        console.log('🔔 [Onboarding] Registration result:', result);

        if (result.success) {
          console.log('✅ [Onboarding] Device registered successfully with Laravel');
          console.log('✅ [Onboarding] Device ID:', result.data?.device?.id);
        } else {
          console.error('❌ [Onboarding] Failed to register device with Laravel:', result);
          console.error('❌ [Onboarding] Error details:', {
            message: result.message,
            error: result.error,
            success: result.success
          });
          
          // Show detailed error to user for debugging
          Alert.alert(
            'Registration Failed',
            `Failed to register with server: ${result.message || result.error || 'Unknown error'}\n\nYour preferences have been saved locally. You can try again in Account Settings.`,
            [{ text: 'Continue' }]
          );
        }
      } else {
        console.log('📱 [Onboarding] Notifications disabled, skipping Laravel registration');
      }

      // Navigate to Home screen (main app)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('❌ [Onboarding] Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const toggleAmPm = (type: 'start' | 'end') => {
    if (type === 'start') {
      setStartTimeAmPm(startTimeAmPm === 'AM' ? 'PM' : 'AM');
    } else {
      setEndTimeAmPm(endTimeAmPm === 'AM' ? 'PM' : 'AM');
    }
  };

  const timezones = [
    'Eastern Time',
    'Central Time',
    'Mountain Time',
    'Pacific Time',
    'Alaska Time',
    'Hawaii Time',
  ];

  const handleTimezoneSelect = (selectedTimezone: string) => {
    setTimezone(selectedTimezone);
    setShowTimezoneModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setup</Text>
      </View>

      <ImageBackground
        source={require('../../assets/images/hero.png')}
        style={styles.heroSection}
        resizeMode="cover"
      />

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
                onPress={() => toggleAmPm('start')}
              >
                <Text style={[styles.amPmText, startTimeAmPm === 'AM' && styles.amPmTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmButton, startTimeAmPm === 'PM' && styles.amPmButtonActive]}
                onPress={() => toggleAmPm('start')}
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
                onPress={() => toggleAmPm('end')}
              >
                <Text style={[styles.amPmText, endTimeAmPm === 'AM' && styles.amPmTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmButton, endTimeAmPm === 'PM' && styles.amPmButtonActive]}
                onPress={() => toggleAmPm('end')}
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
                <Text style={styles.timezoneText}>{timezone}</Text>
                <Icon name="chevron-down" size={16} color={colors.medium} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, isCompleting && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <View style={styles.continueButtonContent}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={[styles.continueButtonText, { marginLeft: 8 }]}>Setting up...</Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
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
                  key={tz}
                  style={[
                    styles.timezoneOption,
                    timezone === tz && styles.timezoneOptionSelected
                  ]}
                  onPress={() => handleTimezoneSelect(tz)}
                >
                  <Text style={[
                    styles.timezoneOptionText,
                    timezone === tz && styles.timezoneOptionTextSelected
                  ]}>
                    {tz}
                  </Text>
                  {timezone === tz && (
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
  },
  heroSection: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
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
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

export default SetPreferencesScreen;
