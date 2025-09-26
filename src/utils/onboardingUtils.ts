import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for managing onboarding state
 */

export const onboardingUtils = {
  /**
   * Check if onboarding has been completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      if (userPreferences) {
        const preferences = JSON.parse(userPreferences);
        return preferences.onboardingCompleted === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Reset onboarding state - useful for testing or allowing users to re-do onboarding
   */
  async resetOnboarding(): Promise<void> {
    try {
      console.log('🔄 [OnboardingUtils] Resetting onboarding state...');
      
      // Remove all onboarding-related storage items
      await AsyncStorage.multiRemove([
        'userPreferences',
        'onboardingStep',
        'termsAccepted',
        'privacyAccepted',
        'pushNotificationsEnabled'
      ]);
      
      console.log('✅ [OnboardingUtils] Onboarding state reset successfully');
    } catch (error) {
      console.error('❌ [OnboardingUtils] Error resetting onboarding:', error);
      throw error;
    }
  },

  /**
   * Get current onboarding step
   */
  async getCurrentOnboardingStep(): Promise<string | null> {
    try {
      const step = await AsyncStorage.getItem('onboardingStep');
      return step;
    } catch (error) {
      console.error('Error getting onboarding step:', error);
      return null;
    }
  },

  /**
   * Mark onboarding as completed
   */
  async markOnboardingCompleted(): Promise<void> {
    try {
      const existingPreferences = await AsyncStorage.getItem('userPreferences');
      let preferences = {};
      
      if (existingPreferences) {
        preferences = JSON.parse(existingPreferences);
      }
      
      const updatedPreferences = {
        ...preferences,
        onboardingCompleted: true
      };
      
      await AsyncStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      await AsyncStorage.setItem('onboardingStep', 'completed');
      
      console.log('✅ [OnboardingUtils] Onboarding marked as completed');
    } catch (error) {
      console.error('❌ [OnboardingUtils] Error marking onboarding as completed:', error);
      throw error;
    }
  }
};
