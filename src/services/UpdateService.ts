import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API } from '../config/apiConfig';
import DeviceInfo from 'react-native-device-info';
import { compareVersions } from 'compare-versions';

// Storage keys
const STORAGE_KEYS = {
  SKIPPED_VERSIONS: 'skipped_versions',
  CURRENT_VERSION: 'current_version',
};

// App store URLs and IDs
const APP_STORE = {
  IOS_URL: 'https://apps.apple.com/us/app/id6670172327',
  IOS_LOOKUP_URL: 'https://itunes.apple.com/lookup?id=6670172327',
  ANDROID_URL: 'https://play.google.com/store/apps/details?id=your.package.name',
};

interface VersionData {
  latestVersion: string;
  minimumVersion: string;
  releaseNotes?: string;
}

class UpdateService {
  /**
   * Get the current app version
   * @returns Promise resolving to the current app version
   */
  static async getCurrentVersion(): Promise<string> {
    try {
      return DeviceInfo.getVersion();
    } catch (error) {
      console.error('Error getting current version:', error);
      return '1.0.0'; // Fallback version
    }
  }

  /**
   * Get the stored app version
   * @returns Promise resolving to the stored app version or null if not found
   */
  static async getStoredVersion(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_VERSION);
    } catch (error) {
      console.error('Error getting stored version:', error);
      return null;
    }
  }

  /**
   * Update the stored app version
   * @param version The version to store
   * @returns Promise resolving when the version is stored
   */
  static async updateStoredVersion(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_VERSION, version);
    } catch (error) {
      console.error('Error updating stored version:', error);
    }
  }

  /**
   * Check for updates from the server
   * @returns Promise resolving to the version data
   */
  static async checkForUpdates(): Promise<VersionData | null> {
    try {
      // First try to get the version from the App Store if on iOS
      if (Platform.OS === 'ios') {
        const appStoreVersion = await this.fetchAppStoreVersion();
        if (appStoreVersion) {
          return {
            latestVersion: appStoreVersion,
            minimumVersion: appStoreVersion, // Assuming minimum version is the same as latest for App Store
            releaseNotes: 'A new version is available in the App Store.',
          };
        }
      }
      
      // If App Store check fails or we're not on iOS, fall back to API check
      
      // Add a timeout to prevent long waits if the server is unresponsive
      const response = await axios.get(`${API.BASE_URL}/${API.ENDPOINTS.APP_VERSION}`, {
        timeout: 5000, // 5 second timeout
      });
      
      if (response.data && response.data.success) {
        return {
          latestVersion: response.data.data.latestVersion || '1.0.0',
          minimumVersion: response.data.data.minimumVersion || '1.0.0',
          releaseNotes: response.data.data.releaseNotes || '',
        };
      }
      
      // Return a default version info instead of null
      return await this.getDefaultVersionInfo();
    } catch (error) {
      console.error('Error checking for updates');
      // Instead of just logging the error, provide a fallback
      return await this.getDefaultVersionInfo();
    }
  }
  
  /**
   * Fetch the latest version from the App Store
   * @returns Promise resolving to the App Store version or null if not found
   */
  static async fetchAppStoreVersion(): Promise<string | null> {
    try {
      const response = await axios.get(APP_STORE.IOS_LOOKUP_URL, {
        timeout: 5000, // 5 second timeout
      });
      
      if (response.data && response.data.resultCount > 0) {
        const appStoreVersion = response.data.results[0].version;
        return appStoreVersion;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching app version from App Store');
      return null;
    }
  }

  /**
   * Get default version information when the server is unavailable
   * @returns Default version data
   */
  private static async getDefaultVersionInfo(): Promise<VersionData> {
    // Get the current version from the app
    const currentVersion = await this.getCurrentVersion();
    
    return {
      latestVersion: currentVersion, // Use current version as latest if we can't fetch it
      minimumVersion: '1.0.0', // Use a safe default for minimum version
      releaseNotes: 'Unable to fetch update information. Please check your internet connection.',
    };
  }

  /**
   * Check if an update is required
   * @param currentVersion The current app version
   * @param minimumVersion The minimum required version
   * @returns True if an update is required, false otherwise
   */
  static isUpdateRequired(currentVersion: string, minimumVersion: string): boolean {
    try {
      return compareVersions(currentVersion, minimumVersion) < 0;
    } catch (error) {
      console.error('Error checking if update is required');
      return false; // Default to not required if there's an error
    }
  }

  /**
   * Check if the update modal should be shown
   * @param currentVersion Current app version
   * @param latestVersion Latest available version
   * @param minimumRequiredVersion Minimum required version
   * @returns Boolean indicating if the update modal should be shown
   */
  static shouldShowUpdateModal(
    currentVersion: string,
    latestVersion: string,
    minimumRequiredVersion: string
  ): boolean {
    // Check if update is required (current version is less than minimum required)
    const isRequired = this.isUpdateRequired(currentVersion, minimumRequiredVersion);

    // Check if update is available (current version is less than latest version)
    const isUpdateAvailable = compareVersions(currentVersion, latestVersion) < 0;

    // Only show modal if update is required or an update is available
    return isRequired || isUpdateAvailable;
  }

  /**
   * Skip a version
   * @param version The version to skip
   * @returns Promise resolving when the version is skipped
   */
  static async skipVersion(version: string): Promise<void> {
    try {
      // Get the current skipped versions
      const skippedVersionsString = await AsyncStorage.getItem(STORAGE_KEYS.SKIPPED_VERSIONS);
      const skippedVersions = skippedVersionsString ? JSON.parse(skippedVersionsString) : [];
      
      // Add the version if it's not already skipped
      if (!skippedVersions.includes(version)) {
        skippedVersions.push(version);
        await AsyncStorage.setItem(STORAGE_KEYS.SKIPPED_VERSIONS, JSON.stringify(skippedVersions));
      }
    } catch (error) {
      console.error('Error skipping version:', error);
    }
  }

  /**
   * Check if a version has been skipped
   * @param version The version to check
   * @returns Promise resolving to true if the version has been skipped, false otherwise
   */
  static async isVersionSkipped(version: string): Promise<boolean> {
    try {
      const skippedVersionsString = await AsyncStorage.getItem(STORAGE_KEYS.SKIPPED_VERSIONS);
      const skippedVersions = skippedVersionsString ? JSON.parse(skippedVersionsString) : [];
      
      return skippedVersions.includes(version);
    } catch (error) {
      console.error('Error checking if version is skipped:', error);
      return false;
    }
  }

  /**
   * Open the app store
   * @returns Promise resolving when the app store is opened
   */
  static async openAppStore(): Promise<void> {
    try {
      const url = Platform.OS === 'ios' ? APP_STORE.IOS_URL : APP_STORE.ANDROID_URL;
      
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening app store:', error);
    }
  }

  /**
   * Check if the app is installed from the App Store
   * @returns Promise resolving to whether the app is from the App Store
   */
  static async isAppStoreVersion(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // On iOS, we can use DeviceInfo to determine if the app is running from the App Store
        // This is a simplified approach - in a real app you might need a more robust check
        const bundleId = DeviceInfo.getBundleId();
        const isTestFlight = await DeviceInfo.isEmulator();
        
        // If it's not an emulator and has a valid bundle ID, it's likely from the App Store
        return !isTestFlight && !!bundleId;
      }
      
      // For Android, we would need a different approach
      return false;
    } catch (error) {
      console.error('Error determining app source:', error);
      return false;
    }
  }
}

export default UpdateService;
