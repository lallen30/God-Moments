import { useState, useCallback, useEffect } from 'react';
import UpdateService from '../services/UpdateService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { compareVersions } from 'compare-versions';

interface VersionInfo {
  latestVersion: string;
  minimumVersion: string;
  releaseNotes?: string;
}

/**
 * Custom hook for managing app update state and logic
 * @param checkOnMount Whether to check for updates when the component mounts
 * @param updateCheckInterval Time interval between update checks (in milliseconds)
 * @returns Object containing update state and functions
 */
const useAppUpdate = (checkOnMount = true, updateCheckInterval = 60 * 60 * 1000) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isAppStoreVersion, setIsAppStoreVersion] = useState(false);
  const [storedAppVersion, setStoredAppVersion] = useState<string | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<number | null>(null);

  // Time interval between update checks (in milliseconds)
  // Default: 1 hour - adjust this value based on how frequently you want to check for updates
  // Lower values will check more frequently but may impact performance
  const UPDATE_CHECK_INTERVAL = updateCheckInterval;

  // Check if the app is from the App Store
  const checkAppSource = useCallback(async () => {
    try {
      const isFromAppStore = await UpdateService.isAppStoreVersion();
      setIsAppStoreVersion(isFromAppStore);
      return isFromAppStore;
    } catch (err) {
      console.error('Error checking app source');
      return false;
    }
  }, []);

  // Get the stored app version
  const getStoredAppVersion = useCallback(async () => {
    try {
      const version = await AsyncStorage.getItem('app_version');
      setStoredAppVersion(version);
      return version;
    } catch (err) {
      console.error('Error getting stored app version');
      return null;
    }
  }, []);

  // Update the stored app version
  const updateStoredAppVersion = useCallback(async (version: string) => {
    try {
      await AsyncStorage.setItem('app_version', version);
      setStoredAppVersion(version);
    } catch (err) {
      console.error('Error updating stored app version');
    }
  }, []);

  /**
   * Load the last update check time from storage
   */
  const loadLastUpdateCheckTime = useCallback(async () => {
    try {
      const storedTime = await AsyncStorage.getItem('lastUpdateCheckTime');
      if (storedTime) {
        setLastUpdateCheck(parseInt(storedTime, 10));
      }
    } catch (error) {
      console.error('Error loading last update check time');
    }
  }, []);

  /**
   * Save the current time as the last update check time
   */
  const saveLastUpdateCheckTime = async () => {
    try {
      const currentTime = Date.now();
      await AsyncStorage.setItem('lastUpdateCheckTime', currentTime.toString());
      setLastUpdateCheck(currentTime);
    } catch (error) {
      console.error('Error saving last update check time');
    }
  };

  /**
   * Check if enough time has passed since the last update check
   */
  const shouldCheckForUpdates = () => {
    if (!lastUpdateCheck) {
      return true;
    }
    
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - lastUpdateCheck;
    const shouldCheck = timeSinceLastCheck > UPDATE_CHECK_INTERVAL;
    
    return shouldCheck;
  };

  /**
   * Check if app version needs update
   * @param silent If true, performs the check silently in the background without showing loading indicators
   * @param force If true, checks for updates regardless of when the last check occurred
   * 
   * Usage examples:
   * - checkAppVersion(true, true): Silent check that bypasses time interval (ideal for HomeScreen focus)
   * - checkAppVersion(false, false): Regular check with loading indicator that respects time interval
   * - checkAppVersion(true, false): Silent check that respects time interval (good for background checks)
   * @returns Promise that resolves when the check is complete
   */
  const checkAppVersion = useCallback(async (silent = false, force = false): Promise<void> => {
    try {
      // Skip check if it was done recently, unless force is true
      if (!force && !shouldCheckForUpdates()) {
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      
      // Get the current app version
      const currentVersion = await UpdateService.getCurrentVersion();
      
      if (!currentVersion) {
        console.error('Failed to get current app version');
        return;
      }
      
      // Get the latest version info from the server
      const versionInfo = await UpdateService.checkForUpdates();
      
      if (!versionInfo) {
        console.error('Failed to get latest version info');
        return;
      }
      
      // Update the last check time
      await saveLastUpdateCheckTime();
      
      // Set version info state
      setVersionInfo(versionInfo);
      
      // Check if update is needed
      const shouldShowModal = UpdateService.shouldShowUpdateModal(
        currentVersion,
        versionInfo.latestVersion,
        versionInfo.minimumVersion
      );
      
      // Only show modal if update is needed
      if (shouldShowModal) {
        setUpdateModalVisible(true);
      } else {
        setUpdateModalVisible(false);
      }
    } catch (error) {
      console.error('Error checking app version');
      // Don't show modal on error
      setUpdateModalVisible(false);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [shouldCheckForUpdates, saveLastUpdateCheckTime]);

  /**
   * Close the update modal
   */
  const closeUpdateModal = useCallback(async () => {
    try {
      // If there's version info and it's not a required update, mark it as skipped
      if (versionInfo) {
        const currentVersion = await UpdateService.getCurrentVersion();
        const isRequired = UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion);
        
        if (!isRequired) {
          await UpdateService.skipVersion(versionInfo.latestVersion);
        }
      }
      setUpdateModalVisible(false);
    } catch (error) {
      console.error('Error closing update modal');
    }
  }, [versionInfo]);

  /**
   * Navigate to the app store to update the app
   */
  const goToUpdate = useCallback(async () => {
    try {
      await UpdateService.openAppStore();
    } catch (error) {
      console.error('Error navigating to app store');
      setError(`Failed to open app store: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // Check for updates on mount if checkOnMount is true
  useEffect(() => {
    // Always load the last update check time
    loadLastUpdateCheckTime();
    
    // Only check for updates if checkOnMount is true
    if (checkOnMount) {
      // Use silent mode for initial check to avoid disrupting the user experience
      checkAppVersion(true, false);
    }
  }, [checkOnMount, loadLastUpdateCheckTime]);

  // Check if the app is from the App Store on mount
  useEffect(() => {
    checkAppSource();
  }, [checkAppSource]);

  // Get the stored app version on mount
  useEffect(() => {
    getStoredAppVersion();
  }, [getStoredAppVersion]);

  return {
    versionInfo,
    isAppStoreVersion,
    storedAppVersion,
    loading,
    error,
    updateModalVisible,
    setUpdateModalVisible,
    checkAppVersion,
    checkForUpdates: useCallback((silent = false, force = false): Promise<void> => {
      // Directly call checkAppVersion with the provided parameters
      return checkAppVersion(silent, force);
    }, [checkAppVersion]),
    closeUpdateModal,
    goToUpdate,
  };
};

export default useAppUpdate;
