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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';

interface AccountSettingsScreenProps {
  navigation: any;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({ navigation }) => {
  // State for notification settings
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [allowSounds, setAllowSounds] = useState(true);
  
  // State for notification times
  const [startTime, setStartTime] = useState('7:00');
  const [startTimeAmPm, setStartTimeAmPm] = useState('AM');
  const [endTime, setEndTime] = useState('4:30');
  const [endTimeAmPm, setEndTimeAmPm] = useState('PM');
  
  // State for timezone
  const [timezone, setTimezone] = useState('Eastern Time');
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  const timezones = [
    'Eastern Time',
    'Central Time',
    'Mountain Time',
    'Pacific Time',
    'Alaska Time',
    'Hawaii Time',
  ];

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load push notifications setting from AgreeScreen
      const pushNotificationsEnabled = await AsyncStorage.getItem('pushNotificationsEnabled');
      if (pushNotificationsEnabled !== null) {
        setAllowNotifications(JSON.parse(pushNotificationsEnabled));
      }

      // Load user preferences from SetPreferencesScreen
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      if (userPreferences !== null) {
        const preferences = JSON.parse(userPreferences);
        setAllowSounds(preferences.allowSounds || true);
        setStartTime(preferences.startTime || '7:00');
        setStartTimeAmPm(preferences.startTimeAmPm || 'AM');
        setEndTime(preferences.endTime || '4:30');
        setEndTimeAmPm(preferences.endTimeAmPm || 'PM');
        setTimezone(preferences.timezone || 'Eastern Time');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Update push notifications setting
      await AsyncStorage.setItem('pushNotificationsEnabled', JSON.stringify(allowNotifications));

      // Update user preferences
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

      Alert.alert(
        'Settings Saved',
        'Your account settings have been updated successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
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
        <TouchableOpacity onPress={() => navigation.navigate('More')} style={styles.backButton}>
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
                <Text style={styles.timezoneText}>{timezone}</Text>
                <Icon name="chevron-down" size={16} color={colors.medium} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.saveButtonText}>Save Setting</Text>
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
    padding: 4,
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
});

export default AccountSettingsScreen;
