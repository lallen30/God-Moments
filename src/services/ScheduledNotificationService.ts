import { environment } from '../config/environment';
import { storageService } from './storageService';
import { oneSignalService } from './OneSignalService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the properly constructed baseURL from environment
const BASE_URL = environment.baseURL;
const API_BASE = `${BASE_URL}api`; // baseURL already ends with /, so don't add another /

export interface DeviceRegistrationData {
  anon_user_id: string;
  onesignal_player_id: string;
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
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔔 [ScheduledNotifications] Initializing service...');

      // Get or create anonymous user ID
      await this.ensureAnonUserId();

      // Wait for OneSignal to be ready
      await this.waitForOneSignal();

      // Register device with backend
      await this.registerDeviceIfNeeded();

      this.isInitialized = true;
      console.log('✅ [ScheduledNotifications] Service initialized successfully');

    } catch (error) {
      console.error('❌ [ScheduledNotifications] Failed to initialize:', error);
      // Don't throw - allow app to continue functioning
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
   * Wait for OneSignal to be initialized and get player ID
   */
  private async waitForOneSignal(): Promise<void> {
    const maxAttempts = 30; // 30 seconds
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const checkOneSignal = async () => {
        attempts++;
        
        try {
          if (oneSignalService.isOneSignalInitialized()) {
            const playerId = await oneSignalService.getOneSignalUserId();
            
            if (playerId && playerId !== 'Initialized - ID pending...' && playerId !== null) {
              console.log('✅ [ScheduledNotifications] OneSignal ready with player ID:', playerId);
              resolve();
              return;
            }
          }

          if (attempts >= maxAttempts) {
            console.warn('⚠️ [ScheduledNotifications] OneSignal timeout - proceeding without player ID');
            resolve(); // Don't reject - allow service to continue
            return;
          }

          // Try again in 1 second
          setTimeout(checkOneSignal, 1000);
        } catch (error) {
          console.error('❌ [ScheduledNotifications] Error waiting for OneSignal:', error);
          if (attempts >= maxAttempts) {
            resolve(); // Don't reject - allow service to continue
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
  public async registerDevice(customSettings?: Partial<DeviceSettings>): Promise<DeviceRegistrationResponse> {
    try {
      const playerId = await oneSignalService.getOneSignalUserId();
      
      if (!playerId || playerId === 'Initialized - ID pending...') {
        throw new Error('OneSignal player ID not available');
      }

      if (!this.anonUserId) {
        throw new Error('Anonymous user ID not available');
      }

      // Get device timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Default notification settings
      const defaultSettings = {
        tz: timezone,
        start_time: '09:00',
        end_time: '21:00',
        notifications_enabled: true,
      };

      // Merge with any saved settings or custom settings
      const savedSettings = await this.getSavedSettings();
      const settings = { ...defaultSettings, ...savedSettings, ...customSettings };

      // Register device with the Laravel backend
      const registrationData: DeviceRegistrationData = {
        anon_user_id: this.anonUserId,
        onesignal_player_id: playerId,
        tz: settings.tz,
        start_time: settings.start_time,
        end_time: settings.end_time,
        notifications_enabled: settings.notifications_enabled,
      };

      console.log('📤 [ScheduledNotifications] Registering device:', {
        anon_user_id: registrationData.anon_user_id,
        onesignal_player_id: registrationData.onesignal_player_id,
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
   * Update device settings
   */
  public async updateSettings(settings: DeviceSettings): Promise<DeviceRegistrationResponse> {
    try {
      if (!this.deviceId) {
        // If no device ID, try to register first
        return await this.registerDevice(settings);
      }

      console.log('📤 [ScheduledNotifications] Updating device settings:', settings);

      const response = await fetch(`${API_BASE}/devices/${this.deviceId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result: DeviceRegistrationResponse = await response.json();

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
   * Force re-registration (useful for debugging)
   */
  public async forceReregistration(): Promise<DeviceRegistrationResponse> {
    try {
      // Clear saved registration
      await AsyncStorage.removeItem('last_device_registration');
      this.deviceId = null;
      
      // Re-register
      return await this.registerDevice();
    } catch (error) {
      console.error('❌ [ScheduledNotifications] Force re-registration failed:', error);
      return {
        success: false,
        message: 'Force re-registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const scheduledNotificationService = ScheduledNotificationService.getInstance();
