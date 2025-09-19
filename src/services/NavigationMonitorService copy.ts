import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosRequest from '../utils/axiosUtils';
import { API } from '../config/apiConfig';

const STORAGE_KEYS = {
  TERMS_DATE: 'accepted_terms_date',
  PRIVACY_DATE: 'accepted_privacy_date',
  INITIAL_CHECK_COMPLETED: 'terms_privacy_initial_check_completed'
};

const EXCLUDED_ROUTES = [
  'TermsAndConditions',
  'PrivacyPolicy',
  'Login',
  'SignUp',
  'ForgotPassword',
  'VerifyEmail'
];

export class NavigationMonitorService {
  static isExcludedRoute(routeName: string): boolean {
    return EXCLUDED_ROUTES.includes(routeName);
  }

  /**
   * Check if terms and privacy policy need updates
   * Improved to handle API errors and prevent constant prompts
   */
  static async checkForUpdates() {
    try {
      // Check if we've already completed the initial check
      const initialCheckCompleted = await AsyncStorage.getItem(STORAGE_KEYS.INITIAL_CHECK_COMPLETED);
      
      // Get stored dates
      const [storedTermsDate, storedPrivacyDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TERMS_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_DATE)
      ]);
      
      // If this is the first time checking and no dates are stored, store current dates
      if (!initialCheckCompleted && (!storedTermsDate || !storedPrivacyDate)) {
        const currentDate = new Date().toISOString();
        
        // Store current date for both terms and privacy
        if (!storedTermsDate) {
          await AsyncStorage.setItem(STORAGE_KEYS.TERMS_DATE, currentDate);
        }
        
        if (!storedPrivacyDate) {
          await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_DATE, currentDate);
        }
        
        // Mark initial check as completed
        await AsyncStorage.setItem(STORAGE_KEYS.INITIAL_CHECK_COMPLETED, 'true');
        
        // Return false for both to prevent showing update prompt on first run
        return { termsNeedsUpdate: false, privacyNeedsUpdate: false };
      }
      
      // Initialize with default values
      let termsDate = null;
      let privacyDate = null;
      let termsError = false;
      let privacyError = false;
      
      // Fetch terms date with error handling
      try {
        const termsResponse = await axiosRequest.get(`${API.BASE_URL}/${API.ENDPOINTS.GET_TERMS_DATE}`);
        if (termsResponse && termsResponse.data && termsResponse.data.date) {
          termsDate = termsResponse.data.date;
        } else {
          termsError = true;
        }
      } catch (error) {
        termsError = true;
      }
      
      // Fetch privacy date with error handling
      try {
        const privacyResponse = await axiosRequest.get(`${API.BASE_URL}/${API.ENDPOINTS.GET_PRIVACY_DATE}`);
        if (privacyResponse && privacyResponse.data && privacyResponse.data.date) {
          privacyDate = privacyResponse.data.date;
        } else {
          privacyError = true;
        }
      } catch (error) {
        privacyError = true;
      }
      
      // If both API calls failed, skip update check
      if (termsError && privacyError) {
        return { termsNeedsUpdate: false, privacyNeedsUpdate: false };
      }
      
      // Compare dates to determine if updates are needed
      const termsNeedsUpdate = termsDate && storedTermsDate 
        ? new Date(termsDate) > new Date(storedTermsDate)
        : false;
        
      const privacyNeedsUpdate = privacyDate && storedPrivacyDate
        ? new Date(privacyDate) > new Date(storedPrivacyDate)
        : false;
      
      return { termsNeedsUpdate, privacyNeedsUpdate };
    } catch (error) {
      // In case of any unexpected errors, return false to prevent blocking the user
      return { termsNeedsUpdate: false, privacyNeedsUpdate: false };
    }
  }

  static async getTermsPublishedDate() {
    try {
      const response = await axiosRequest.get(`${API.BASE_URL}/${API.ENDPOINTS.GET_TERMS_DATE}`);
      return response.data.date;
    } catch (error) {
      console.error('Error getting terms date:', error);
      return null; // Return null instead of current date as fallback
    }
  }

  static async getPrivacyPublishedDate() {
    try {
      const response = await axiosRequest.get(`${API.BASE_URL}/${API.ENDPOINTS.GET_PRIVACY_DATE}`);
      return response.data.date;
    } catch (error) {
      console.error('Error getting privacy date:', error);
      return null; // Return null instead of current date as fallback
    }
  }

  static async storeAcceptanceDate(type: 'terms' | 'privacy') {
    const key = type === 'terms' ? STORAGE_KEYS.TERMS_DATE : STORAGE_KEYS.PRIVACY_DATE;
    await AsyncStorage.setItem(key, new Date().toISOString());
    console.log(`Stored ${type} acceptance date:`, new Date().toISOString());
  }
}