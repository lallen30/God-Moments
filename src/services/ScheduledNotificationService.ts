import { environment } from '../config/environment';
import { storageService } from './storageService';
import { oneSignalService } from './OneSignalService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

// Use the properly constructed API URL from environment
// environment.apiURL = "https://godmoments.betaplanets.com/api/"
// We need to remove the trailing slash for our endpoint construction
const API_BASE = environment.apiURL.replace(/\/$/, '');

export interface DeviceRegistrationData {
  anon_user_id: string;
  onesignal_player_id: string;
  device_fingerprint?: string;
  tz: string;
  start_time: string;
  end_time: string;
  notifications_enabled: boolean;
}

export interface DeviceSettings {
  tz?: string;
  start_time?: string;
  end_time?: string;
  notifications_enabled?: boolean;
}

export interface ScheduledNotificationInfo {
  id: number;
  local_day: string;
  scheduled_at_utc: string;
  scheduled_at_local: string;
  status: 'queued' | 'sent' | 'failed' | 'canceled';
}

export interface DeviceInfo {
  id: string;
  anon_user_id: string;
  onesignal_player_id: string;
  tz: string;
  start_time_local: string;
  end_time_local: string;
  notifications_enabled: boolean;
  window_crosses_midnight: boolean;
  window_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    device: DeviceInfo;
    next_schedule: ScheduledNotificationInfo[];
    rescheduled?: boolean;
  };
  error?: string;
}

class ScheduledNotificationService {
  private static instance: ScheduledNotificationService;
  private deviceId: string | null = null;
  private anonUserId: string | null = null;
  private isInitialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): ScheduledNotificationService {
    if (!ScheduledNotificationService.instance) {
      ScheduledNotificationService.instance = new ScheduledNotificationService();
    }
    return ScheduledNotificationService.instance;
  }

  /**
   * Initialize the service and register device if needed
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized && this.anonUserId) {
      console.log('✅ [ScheduledNotifications] Service already initialized');
      return;
    }

    try {
      console.log('🔔 [ScheduledNotifications] Initializing service...');

      // Get or create anonymous user ID
      await this.ensureAnonUserId();
      console.log('✅ [ScheduledNotifications] Anonymous user ID ready:', this.anonUserId);

      // Wait for OneSignal to be ready
      console.log('⏳ [ScheduledNotifications] Waiting for OneSignal...');
      await this.waitForOneSignal();
      
      const playerId = await oneSignalService.getOneSignalUserId();
      console.log('✅ [ScheduledNotifications] OneSignal ready, player ID:', playerId);

      // Don't auto-register during initialization - wait for explicit registration call
      // This prevents errors when no settings are available yet
      console.log('✅ [ScheduledNotifications] Initialization complete (registration will happen when settings are provided)');

      this.isInitialized = true;
      console.log('✅ [ScheduledNotifications] Service initialized successfully', {
        deviceId: this.deviceId,
        anonUserId: this.anonUserId,
        isInitialized: this.isInitialized,
      });

    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to initialize:', error);
      // Mark as not initialized so it can be retried
      this.isInitialized = false;
      // Don't throw - allow app to continue functioning, but log the error
      console.warn('⚠️ [ScheduledNotifications] Service will attempt re-initialization on next action');
    }
  }

  /**
   * Ensure we have an anonymous user ID
   */
  private async ensureAnonUserId(): Promise<void> {
    try {
      // Try to get existing anon user ID
      this.anonUserId = await AsyncStorage.getItem('anon_user_id');

      if (!this.anonUserId) {
        // Generate new anonymous user ID
        this.anonUserId = this.generateAnonUserId();
        await AsyncStorage.setItem('anon_user_id', this.anonUserId);
        console.log('🆔 [ScheduledNotifications] Generated new anon user ID:', this.anonUserId);
      } else {
        console.log('🆔 [ScheduledNotifications] Using existing anon user ID:', this.anonUserId);
      }
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to ensure anon user ID:', error);
      // Generate fallback ID
      this.anonUserId = this.generateAnonUserId();
    }
  }

  /**
   * Generate anonymous user ID (UUID v4 format)
   */
  private generateAnonUserId(): string {
    // Generate UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a persistent device fingerprint that survives app reinstalls
   */
  private async generateDeviceFingerprint(): Promise<string> {
    try {
      const [
        uniqueId,
        brand,
        model,
        systemVersion,
        androidId
      ] = await Promise.allSettled([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getAndroidId()
      ]).then(results => results.map(result => 
        result.status === 'fulfilled' ? result.value : 'unknown'
      ));

      // Create a stable fingerprint using device characteristics
      // This should persist across app reinstalls but be unique per device
      const fingerprint = `${brand}-${model}-${systemVersion}-${uniqueId || androidId}`.toLowerCase();
      
      console.log('🔍 [ScheduledNotifications] Generated device fingerprint:', {
        brand,
        model,
        systemVersion,
        uniqueId: uniqueId?.substring(0, 8) + '...',
        androidId: androidId?.substring(0, 8) + '...',
        fingerprint: fingerprint.substring(0, 20) + '...',
        fullFingerprint: fingerprint
      });

      return fingerprint;
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to generate device fingerprint:', error);
      // Fallback to a random but stored fingerprint
      const fallbackFingerprint = 'fallback-' + this.generateAnonUserId();
      return fallbackFingerprint;
    }
  }

  /**
   * Wait for OneSignal to be initialized AND have valid push subscription
   */
  private async waitForOneSignal(): Promise<void> {
    const maxAttempts = 45; // 45 seconds (increased from 30 to allow for APNS token fetch)
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const checkOneSignal = async () => {
        attempts++;
        
        try {
          if (oneSignalService.isOneSignalInitialized()) {
            // CRITICAL: Check for valid push subscription, not just player ID
            const hasValidSubscription = await oneSignalService.hasValidPushSubscription();
            
            if (hasValidSubscription) {
              const playerId = await oneSignalService.getOneSignalUserId();
              console.log('✅ [ScheduledNotifications] OneSignal ready with valid subscription:', playerId);
              resolve();
              return;
            } else {
              console.log(`🔍 [ScheduledNotifications] Attempt ${attempts}/${maxAttempts}: Waiting for valid push subscription with APNS/FCM token...`);
            }
          }

          if (attempts >= maxAttempts) {
            console.warn('⚠️ [ScheduledNotifications] OneSignal timeout - push subscription not obtained after 45 seconds');
            console.warn('⚠️ [ScheduledNotifications] Will proceed but registration may fail if subscription still not ready');
            // IMPORTANT: Resolve anyway to allow initialization to complete
            // The registerDevice() method will check again and reject if still no valid subscription
            resolve();
            return;
          }

          // Try again in 1 second
          setTimeout(checkOneSignal, 1000);
        } catch (error) {
          console.error('❌ [ScheduledNotifications] Error waiting for OneSignal:', error);
          if (attempts >= maxAttempts) {
            console.warn('⚠️ [ScheduledNotifications] Max attempts reached, proceeding anyway');
            // Resolve to allow initialization to complete - registerDevice will validate
            resolve();
          } else {
            setTimeout(checkOneSignal, 1000);
          }
        }
      };

      checkOneSignal();
    });
  }

  /**
   * Register device with backend if needed
   */
  private async registerDeviceIfNeeded(): Promise<void> {
    try {
      // Check if we already have a registered device
      const lastRegistration = await AsyncStorage.getItem('last_device_registration');
      const playerId = await oneSignalService.getOneSignalUserId();

      if (!playerId || playerId === 'Initialized - ID pending...') {
        console.log('⚠️ [ScheduledNotifications] No OneSignal player ID available yet');
        return;
      }

      // Check if we need to register (first time or player ID changed)
      let needsRegistration = true;
      if (lastRegistration) {
        const lastData = JSON.parse(lastRegistration);
        if (lastData.onesignal_player_id === playerId && lastData.anon_user_id === this.anonUserId) {
          needsRegistration = false;
          // Restore device ID from saved registration
          this.deviceId = lastData.device_id;
          console.log('✅ [ScheduledNotifications] Using existing registration:', {
            device_id: this.deviceId,
            anon_user_id: this.anonUserId,
            onesignal_player_id: playerId,
          });
        } else {
          // Player ID or anon user ID changed - force cleanup of old registration
          console.log('🔄 [ScheduledNotifications] Player ID or anon user ID changed, forcing re-registration:', {
            old_player_id: lastData.onesignal_player_id,
            new_player_id: playerId,
            old_anon_user_id: lastData.anon_user_id,
            new_anon_user_id: this.anonUserId,
          });
          needsRegistration = true;
        }
      }

      if (needsRegistration) {
        console.log('🔄 [ScheduledNotifications] Registering device with backend...');
        await this.registerDevice();
      } else {
        console.log('✅ [ScheduledNotifications] Device already registered');
      }

    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to check/register device:', error);
    }
  }

  /**
   * Register device with the Laravel backend
   */
  public async registerDevice(customSettings?: Partial<DeviceSettings>, bypassSubscriptionCheck: boolean = false): Promise<DeviceRegistrationResponse> {
    try {
      // CRITICAL: Verify valid push subscription before proceeding
      const hasValidSubscription = await oneSignalService.hasValidPushSubscription();
      
      if (!hasValidSubscription && !bypassSubscriptionCheck) {
        console.error('❌ [ScheduledNotifications] Cannot register - no valid push subscription');
        return {
          success: false,
          message: 'Cannot register device without valid push subscription. OneSignal has not obtained APNS/FCM token yet.',
          error: 'NO_VALID_SUBSCRIPTION'
        };
      }
      
      if (!hasValidSubscription && bypassSubscriptionCheck) {
        console.warn('⚠️ [ScheduledNotifications] Bypassing subscription check - attempting registration anyway');
        console.warn('⚠️ [ScheduledNotifications] OneSignal SDK may not reflect actual subscription state in Release builds');
      }

      const playerId = await oneSignalService.getOneSignalUserId();
      
      console.log('🔍 [ScheduledNotifications] OneSignal Player ID received:', playerId);
      
      if (!playerId || playerId === 'Initialized - ID pending...') {
        throw new Error('OneSignal player ID not available');
      }

      // Check notification permission status
      const permissionStatus = oneSignalService.getNotificationPermission();
      console.log('🔍 [ScheduledNotifications] Notification permission status:', permissionStatus);
      
      if (permissionStatus !== 'Granted') {
        console.warn('⚠️ [ScheduledNotifications] Notification permission not granted:', permissionStatus);
        // This should not happen since hasValidPushSubscription checks permission, but log it
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(playerId)) {
        console.error('❌ [ScheduledNotifications] Invalid OneSignal Player ID format:', playerId);
        throw new Error(`OneSignal player ID is not in valid UUID format: ${playerId}`);
      }

      if (!this.anonUserId) {
        throw new Error('Anonymous user ID not available');
      }

      if (!uuidRegex.test(this.anonUserId)) {
        console.error('❌ [ScheduledNotifications] Invalid anon_user_id format:', this.anonUserId);
        throw new Error(`Anonymous user ID is not in valid UUID format: ${this.anonUserId}`);
      }

      // Get device timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      let settings: DeviceSettings;

      if (customSettings && customSettings.start_time && customSettings.end_time) {
        // User provided explicit settings - use them directly
        settings = {
          tz: customSettings.tz || timezone,
          start_time: customSettings.start_time,
          end_time: customSettings.end_time,
          notifications_enabled: customSettings.notifications_enabled ?? true,
        };
        console.log('📝 [ScheduledNotifications] Using explicit user settings:', settings);
      } else {
        // No explicit settings - try saved settings or require them
        const savedSettings = await this.getSavedSettings();
        if (savedSettings.start_time && savedSettings.end_time) {
          settings = {
            tz: savedSettings.tz || timezone,
            start_time: savedSettings.start_time,
            end_time: savedSettings.end_time,
            notifications_enabled: savedSettings.notifications_enabled ?? true,
          };
          console.log('📝 [ScheduledNotifications] Using saved settings:', settings);
        } else {
          throw new Error('No notification time settings provided. User must set preferences first.');
        }
      }

      // Generate device fingerprint (with fallback)
      let deviceFingerprint: string | undefined;
      try {
        deviceFingerprint = await this.generateDeviceFingerprint();
        console.log('✅ [ScheduledNotifications] Device fingerprint generated successfully');
      } catch (error) {
        console.error('⚠️ [ScheduledNotifications] Device fingerprint generation failed, proceeding without it:', error);
        deviceFingerprint = undefined;
      }

      // Register device with the Laravel backend
      const registrationData: any = {
        anon_user_id: this.anonUserId,
        onesignal_player_id: playerId,
        tz: settings.tz!,
        start_time: settings.start_time!,
        end_time: settings.end_time!,
        notifications_enabled: settings.notifications_enabled!,
      };

      // Only add device_fingerprint if it was generated successfully
      if (deviceFingerprint) {
        registrationData.device_fingerprint = deviceFingerprint;
      }

      console.log('📤 [ScheduledNotifications] Registering device:', {
        anon_user_id: registrationData.anon_user_id,
        onesignal_player_id: registrationData.onesignal_player_id,
        device_fingerprint: registrationData.device_fingerprint,
        tz: registrationData.tz,
        start_time: registrationData.start_time,
        end_time: registrationData.end_time,
        notifications_enabled: registrationData.notifications_enabled,
      });
      console.log('📤 [ScheduledNotifications] API_BASE:', API_BASE);
      console.log('📤 [ScheduledNotifications] Full URL:', `${API_BASE}/devices/register`);

      const response = await fetch(`${API_BASE}/devices/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('📥 [ScheduledNotifications] Registration response status:', response.status);
      console.log('📥 [ScheduledNotifications] Registration response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ScheduledNotifications] Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: errorText,
        });
        
        // Try to parse as JSON if possible
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ [ScheduledNotifications] Error JSON:', errorJson);
        } catch (e) {
          console.error('❌ [ScheduledNotifications] Error text (not JSON):', errorText);
        }
        
        return {
          success: false,
          message: 'Registration failed',
          error: errorText,
        };
      }

      const result = await response.json();
      console.log('✅ [ScheduledNotifications] Registration successful:', result);

      if (result.success) {
        this.deviceId = result.data.device.id;
        
        // Save successful registration to prevent re-registration
        const registrationRecord = {
          anon_user_id: this.anonUserId,
          onesignal_player_id: registrationData.onesignal_player_id,
          device_id: this.deviceId,
          registered_at: new Date().toISOString(),
        };
        await AsyncStorage.setItem('last_device_registration', JSON.stringify(registrationRecord));
        
        console.log('✅ [ScheduledNotifications] Device registered successfully:', {
          device_id: this.deviceId,
          next_notifications: result.data.next_schedule.length,
        });
      } else {
        console.error('❌ [ScheduledNotifications] Registration failed:', result.message || result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ [ScheduledNotifications] Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Re-request notification permissions and update registration
   */
  public async requestNotificationPermissions(): Promise<boolean> {
    try {
      console.log('🔔 [ScheduledNotifications] Re-requesting notification permissions...');
      
      // Check current permission
      const currentPermission = oneSignalService.getNotificationPermission();
      console.log('🔍 [ScheduledNotifications] Current permission:', currentPermission);
      
      if (currentPermission === 'Granted') {
        console.log('✅ [ScheduledNotifications] Permission already granted');
        return true;
      }
      
      // Re-request permission through OneSignal
      await oneSignalService.checkPushNotificationSetup();
      
      // Wait a moment for permission to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check permission again
      const newPermission = oneSignalService.getNotificationPermission();
      console.log('🔍 [ScheduledNotifications] New permission status:', newPermission);
      
      if (newPermission === 'Granted') {
        console.log('✅ [ScheduledNotifications] Permission granted! Re-registering device...');
        
        // Re-register device to update subscription status
        await this.registerDevice();
        return true;
      } else {
        console.warn('⚠️ [ScheduledNotifications] Permission still not granted:', newPermission);
        return false;
      }
      
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Update device settings
   */
  public async updateSettings(settings: DeviceSettings): Promise<DeviceRegistrationResponse> {
    try {
      console.log('🔄 [ScheduledNotifications] ===== UPDATE SETTINGS CALLED =====');
      console.log('🔄 [ScheduledNotifications] updateSettings called with:', settings);
      console.log('🔄 [ScheduledNotifications] Current state:', {
        deviceId: this.deviceId,
        anonUserId: this.anonUserId,
        isInitialized: this.isInitialized,
      });
      
      if (!this.deviceId) {
        // If no device ID, try to register first
        console.log('⚠️ [ScheduledNotifications] No device ID found, attempting registration...');
        
        // Verify we have required data for registration
        if (!this.anonUserId) {
          console.error('❌ [ScheduledNotifications] Missing anon user ID - initialization incomplete');
          return {
            success: false,
            message: 'Registration failed',
            error: 'Service not properly initialized. Missing anonymous user ID.',
          };
        }
        
        const playerId = await oneSignalService.getOneSignalUserId();
        if (!playerId || playerId === 'Initialized - ID pending...') {
          console.error('❌ [ScheduledNotifications] OneSignal player ID not ready');
          return {
            success: false,
            message: 'Registration failed',
            error: 'OneSignal is not ready yet. Please wait a moment and try again.',
          };
        }
        
        console.log('✅ [ScheduledNotifications] Prerequisites met, proceeding with registration...');
        return await this.registerDevice(settings);
      }

      console.log('📤 [ScheduledNotifications] Updating device settings:', settings);
      console.log('📤 [ScheduledNotifications] API URL:', `${API_BASE}/devices/${this.deviceId}/settings`);

      // Use POST with _method=PATCH to work around hosting providers that block PATCH requests
      const requestBody = {
        ...settings,
        _method: 'PATCH', // Laravel method spoofing
      };

      console.log('📤 [ScheduledNotifications] REQUEST BODY:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE}/devices/${this.deviceId}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 [ScheduledNotifications] Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 [ScheduledNotifications] Response body:', responseText);
      
      if (!response.ok) {
        console.error('❌ [ScheduledNotifications] Update failed:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });
        
        return {
          success: false,
          message: 'Settings update failed',
          error: responseText || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const result: DeviceRegistrationResponse = JSON.parse(responseText);
      console.log('📥 [ScheduledNotifications] Update result:', result);

      if (result.success && result.data) {
        // Save updated settings
        await this.saveSettings({
          tz: result.data.device.tz,
          start_time: result.data.device.start_time_local,
          end_time: result.data.device.end_time_local,
          notifications_enabled: result.data.device.notifications_enabled,
        });

        console.log('✅ [ScheduledNotifications] Settings updated successfully');
        if (result.data.rescheduled) {
          console.log('🔄 [ScheduledNotifications] Notifications rescheduled');
        }
      } else {
        console.error('❌ [ScheduledNotifications] Settings update failed:', result.message || result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ [ScheduledNotifications] Settings update error:', error);
      return {
        success: false,
        message: 'Settings update failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get device schedule (for debugging)
   */
  public async getDeviceSchedule(days: number = 3): Promise<ScheduledNotificationInfo[]> {
    try {
      if (!this.deviceId) {
        console.warn('⚠️ [ScheduledNotifications] No device ID available for schedule check');
        return [];
      }

      const response = await fetch(`${API_BASE}/devices/${this.deviceId}/schedule?days=${days}`);
      const result = await response.json();

      if (result.success && result.data?.schedule) {
        return result.data.schedule;
      }

      return [];
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to get schedule:', error);
      return [];
    }
  }

  /**
   * Save settings to local storage
   */
  private async saveSettings(settings: DeviceSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to save settings:', error);
    }
  }

  /**
   * Get saved settings from local storage
   */
  private async getSavedSettings(): Promise<DeviceSettings> {
    try {
      const saved = await AsyncStorage.getItem('notification_settings');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to get saved settings:', error);
      return {};
    }
  }

  /**
   * Get current settings
   */
  public async getCurrentSettings(): Promise<DeviceSettings> {
    return await this.getSavedSettings();
  }

  /**
   * Enable notifications
   */
  public async enableNotifications(): Promise<DeviceRegistrationResponse> {
    return await this.updateSettings({ notifications_enabled: true });
  }

  /**
   * Disable notifications
   */
  public async disableNotifications(): Promise<DeviceRegistrationResponse> {
    return await this.updateSettings({ notifications_enabled: false });
  }

  /**
   * Update notification time window
   */
  public async updateTimeWindow(startTime: string, endTime: string): Promise<DeviceRegistrationResponse> {
    return await this.updateSettings({
      start_time: startTime,
      end_time: endTime,
    });
  }

  /**
   * Update timezone
   */
  public async updateTimezone(timezone: string): Promise<DeviceRegistrationResponse> {
    return await this.updateSettings({ tz: timezone });
  }

  /**
   * Get device info
   */
  public getDeviceId(): string | null {
    return this.deviceId;
  }

  public getAnonUserId(): string | null {
    return this.anonUserId;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Force re-registration (useful for debugging and app reinstall scenarios)
   */
  public async forceReregistration(): Promise<DeviceRegistrationResponse> {
    try {
      console.log('🔄 [ScheduledNotifications] Forcing re-registration...');
      
      // Clear saved registration and device ID
      await AsyncStorage.removeItem('last_device_registration');
      this.deviceId = null;
      
      // Force re-initialization to get fresh anon user ID if needed
      await this.ensureAnonUserId();
      
      // Re-register with current settings
      const result = await this.registerDevice();
      
      if (result.success) {
        console.log('✅ [ScheduledNotifications] Force re-registration successful');
      } else {
        console.error('❌ [ScheduledNotifications] Force re-registration failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Force re-registration failed:', error);
      return {
        success: false,
        message: 'Force re-registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if current registration is valid and force re-registration if needed
   */
  public async validateAndCleanupRegistration(): Promise<void> {
    try {
      const playerId = await oneSignalService.getOneSignalUserId();
      const lastRegistration = await AsyncStorage.getItem('last_device_registration');
      
      if (!playerId || playerId === 'Initialized - ID pending...') {
        console.log('⚠️ [ScheduledNotifications] No valid player ID for validation');
        return;
      }
      
      if (lastRegistration) {
        const lastData = JSON.parse(lastRegistration);
        
        // Check if player ID changed (app reinstall scenario)
        if (lastData.onesignal_player_id !== playerId) {
          console.log('🔄 [ScheduledNotifications] Player ID changed, forcing cleanup registration:', {
            old_player_id: lastData.onesignal_player_id,
            new_player_id: playerId,
          });
          
          await this.forceReregistration();
        }
      }
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Registration validation failed:', error);
    }
  }
}

// Export singleton instance
export const scheduledNotificationService = ScheduledNotificationService.getInstance();
