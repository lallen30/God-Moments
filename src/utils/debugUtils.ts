import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utilities for troubleshooting user registration issues
 */

export const debugUtils = {
  /**
   * Check current registration status
   */
  async checkRegistrationStatus(): Promise<void> {
    try {
      console.log('🔍 [Debug] Checking registration status...');
      
      // Check onboarding status
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      const onboardingCompleted = userPreferences ? JSON.parse(userPreferences).onboardingCompleted : false;
      console.log('📋 [Debug] Onboarding completed:', onboardingCompleted);
      
      // Check anonymous user ID
      const anonUserId = await AsyncStorage.getItem('anon_user_id');
      console.log('🆔 [Debug] Anonymous user ID:', anonUserId);
      
      // Check last device registration
      const lastRegistration = await AsyncStorage.getItem('last_device_registration');
      if (lastRegistration) {
        const regData = JSON.parse(lastRegistration);
        console.log('📱 [Debug] Last registration:', {
          device_id: regData.device_id,
          anon_user_id: regData.anon_user_id,
          onesignal_player_id: regData.onesignal_player_id,
          registered_at: regData.registered_at,
        });
      } else {
        console.log('📱 [Debug] No previous registration found');
      }
      
      // Check notification settings
      const notificationSettings = await AsyncStorage.getItem('notification_settings');
      if (notificationSettings) {
        console.log('⚙️ [Debug] Notification settings:', JSON.parse(notificationSettings));
      } else {
        console.log('⚙️ [Debug] No notification settings found');
      }
      
    } catch (error) {
      console.error('❌ [Debug] Error checking registration status:', error);
    }
  },

  /**
   * Clear all registration data (for testing)
   */
  async clearRegistrationData(): Promise<void> {
    try {
      console.log('🧹 [Debug] Clearing all registration data...');
      
      await AsyncStorage.multiRemove([
        'anon_user_id',
        'last_device_registration',
        'notification_settings',
        'onesignal_device_uuid'
      ]);
      
      console.log('✅ [Debug] Registration data cleared');
    } catch (error) {
      console.error('❌ [Debug] Error clearing registration data:', error);
    }
  },

  /**
   * Reset to onboarding state (for testing)
   */
  async resetToOnboarding(): Promise<void> {
    try {
      console.log('🔄 [Debug] Resetting to onboarding state...');
      
      // Clear all onboarding and registration data
      await AsyncStorage.multiRemove([
        'userPreferences',
        'onboardingStep',
        'termsAccepted',
        'privacyAccepted',
        'pushNotificationsEnabled',
        'anon_user_id',
        'last_device_registration',
        'notification_settings',
        'onesignal_device_uuid'
      ]);
      
      console.log('✅ [Debug] Reset to onboarding state complete');
      console.log('ℹ️ [Debug] Restart the app to see onboarding screens');
    } catch (error) {
      console.error('❌ [Debug] Error resetting to onboarding:', error);
    }
  },

  /**
   * Show all stored data (for debugging)
   */
  async showAllStoredData(): Promise<void> {
    try {
      console.log('📊 [Debug] All stored data:');
      
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      
      data.forEach(([key, value]) => {
        try {
          const parsed = value ? JSON.parse(value) : null;
          console.log(`📄 [Debug] ${key}:`, parsed);
        } catch {
          console.log(`📄 [Debug] ${key}:`, value);
        }
      });
      
    } catch (error) {
      console.error('❌ [Debug] Error showing stored data:', error);
    }
  }
};
