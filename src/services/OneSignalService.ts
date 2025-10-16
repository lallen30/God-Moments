// @ts-ignore - TypeScript definitions don't match the actual export
import * as OneSignalModule from 'react-native-onesignal';
const OneSignal = (OneSignalModule as any).OneSignal;

import type {
  OSNotification,
  NotificationClickEvent,
  NotificationWillDisplayEvent
} from 'react-native-onesignal';
import { EnvConfig } from '../utils/EnvConfig';
import { Linking, AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OneSignalService {
  private static instance: OneSignalService;
  private isInitialized = false;
  private deviceUuid: string | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  /**
   * Get or create a persistent device UUID for OneSignal login
   */
  private async getOrCreateDeviceUuid(): Promise<string> {
    if (this.deviceUuid) {
      return this.deviceUuid;
    }

    try {
      // Try to get existing UUID from storage
      const storedUuid = await AsyncStorage.getItem('onesignal_device_uuid');
      
      if (storedUuid) {
        console.log('🆔 [OneSignal] Using existing device UUID:', storedUuid);
        this.deviceUuid = storedUuid;
        return storedUuid;
      }

      // Generate new UUID if none exists
      const newUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      // Save the new UUID
      await AsyncStorage.setItem('onesignal_device_uuid', newUuid);
      this.deviceUuid = newUuid;
      
      console.log('🆔 [OneSignal] Generated new device UUID:', newUuid);
      return newUuid;

    } catch (error) {
      console.error('❌ [OneSignal] Error managing device UUID:', error);
      
      // Fallback to generating a UUID without saving
      const fallbackUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      this.deviceUuid = fallbackUuid;
      return fallbackUuid;
    }
  }

  public async initialize(): Promise<void> {

    if (this.isInitialized) {
      return;
    }

    try {
      // Use hardcoded App ID to ensure initialization always occurs
      const appId = '2613c87d-4f81-4094-bd84-08495e68bda0';
      
      console.log('🚀 [OneSignal] Starting initialization with App ID:', appId);
      console.log('📱 [OneSignal] Expected Bundle ID: com.bluestoneapps.godmomentsdevapp');
      OneSignal.initialize(appId);
      console.log('✅ [OneSignal] Initialize called successfully');

      // Request notification permission with explicit handling
      try {
        console.log('📱 [OneSignal] Requesting notification permission...');
        
        // Check current permission status first
        const hasPermission = OneSignal.Notifications.hasPermission();
        console.log('📱 [OneSignal] Current permission status:', hasPermission);
        
        // ALWAYS request permission to ensure proper registration
        console.log('📱 [OneSignal] Requesting permission (forced)...');
        const permission = await OneSignal.Notifications.requestPermission(true);
        console.log('📱 [OneSignal] Permission request result:', permission);
        
        // Double-check permission after request
        const finalPermission = OneSignal.Notifications.hasPermission();
        console.log('📱 [OneSignal] Final permission status:', finalPermission);
        
        if (!finalPermission) {
          console.warn('⚠️ [OneSignal] Permission not granted - notifications may not work');
        }
        
      } catch (permError) {
        console.error('❌ [OneSignal] Permission request failed:', permError);
      }

      // Wait for initialization to complete
      console.log('⏳ [OneSignal] Waiting for initialization to complete...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ensure push subscription is enabled
      try {
        console.log('📱 [OneSignal] Ensuring push subscription is enabled...');
        if (OneSignal.User && OneSignal.User.pushSubscription) {
          // Opt into push notifications
          OneSignal.User.pushSubscription.optIn();
          console.log('✅ [OneSignal] Push subscription opted in');
        }
      } catch (subscriptionError) {
        console.error('❌ [OneSignal] Push subscription error:', subscriptionError);
      }

      // CRITICAL: Login with persistent UUID to ensure proper registration
      try {
        console.log('🔑 [OneSignal] Attempting login with persistent UUID...');
        
        // Get or create persistent device UUID
        const deviceUuid = await this.getOrCreateDeviceUuid();
        
        if (OneSignal.login) {
          await OneSignal.login(deviceUuid);
          console.log('✅ [OneSignal] Login successful with persistent UUID:', deviceUuid);
        } else if (OneSignal.User && OneSignal.User.addAlias) {
          // Fallback for newer versions
          OneSignal.User.addAlias('device_id', deviceUuid);
          console.log('✅ [OneSignal] Device UUID set via alias:', deviceUuid);
        }
      } catch (loginError) {
        console.error('❌ [OneSignal] Login error:', loginError);
        console.log('🔄 [OneSignal] Continuing without login - may affect registration');
      }

      // Set the notification opened handler
      OneSignal.Notifications.addEventListener('click', (event: NotificationClickEvent) => {
        console.log('🔔 Notification clicked:', event);
        this.handleNotificationClick(event);
      });

      // Set the notification will display handler
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: NotificationWillDisplayEvent) => {
        // Display the notification
        event.preventDefault();
        event.notification.display();
      });

      // Setup app state listeners for better notification handling
      this.setupAppStateListeners();

      this.isInitialized = true;
      console.log('✅ [OneSignal] Initialization complete, starting user monitoring...');
      
      // Start monitoring for user registration
      this.startUserIdMonitoring();
      
      // Delayed user registration attempt if natural registration fails
      setTimeout(async () => {
        await this.attemptDelayedUserRegistration();
      }, 5000);
      
      // Force refresh subscription after APNS config change
      setTimeout(async () => {
        await this.forceRefreshSubscription();
      }, 7000);
      
      setTimeout(() => {
        this.logUserState();
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }

  private async logUserState() {
    try {
      const userId = await this.getOneSignalUserId();
      
      // Check push subscription status
      let pushSubscriptionStatus: any = 'unknown';
      try {
        if (OneSignal?.User?.pushSubscription) {
          const pushSub = OneSignal.User.pushSubscription;
          pushSubscriptionStatus = {
            id: pushSub.id || 'none',
            token: pushSub.token || 'none',
            optedIn: pushSub.optedIn || false
          };
        }
      } catch (subError) {
        pushSubscriptionStatus = 'error checking subscription';
      }
      
      console.log('🔍 OneSignal User State after initialization:', {
        isInitialized: this.isInitialized,
        userId: userId,
        hasNotificationPermission: OneSignal?.Notifications?.hasPermission?.() || 'unknown',
        pushSubscription: pushSubscriptionStatus
      });
    } catch (error) {
      console.log('Could not log user state:', error);
    }
  }

  // Method to attempt delayed user registration if natural registration fails
  private async attemptDelayedUserRegistration(): Promise<void> {
    try {
      console.log('🔄 [OneSignal] Checking if delayed user registration is needed...');
      
      // Check if we already have a user ID
      const currentUserId = await this.getOneSignalUserId();
      if (currentUserId && currentUserId !== 'Initialized - ID pending...' && currentUserId !== null) {
        console.log('✅ [OneSignal] User already registered:', currentUserId);
        return;
      }
      
      console.log('🔄 [OneSignal] Attempting delayed user registration...');
      
      // Try to trigger registration with user properties instead of login
      if (OneSignal?.User?.addAlias) {
        const timestamp = Date.now();
        OneSignal.User.addAlias('device_timestamp', timestamp.toString());
        console.log('✅ [OneSignal] Added device timestamp alias:', timestamp);
      }
      
      // Add a tag to help trigger registration
      if (OneSignal?.User?.addTag) {
        OneSignal.User.addTag('app_version', '1.0.1');
        OneSignal.User.addTag('platform', Platform.OS);
        console.log('✅ [OneSignal] Added user tags to trigger registration');
      }
      
      // Ensure push subscription is enabled during delayed registration
      try {
        if (OneSignal?.User?.pushSubscription) {
          OneSignal.User.pushSubscription.optIn();
          console.log('✅ [OneSignal] Push subscription opted in during delayed registration');
        }
      } catch (subscriptionError) {
        console.error('❌ [OneSignal] Push subscription error during delayed registration:', subscriptionError);
      }
      
      // Wait and check again
      setTimeout(async () => {
        const newUserId = await this.getOneSignalUserId();
        console.log('🔍 [OneSignal] User ID after delayed registration attempt:', newUserId);
      }, 3000);
      
    } catch (error) {
      console.error('❌ [OneSignal] Delayed user registration failed:', error);
    }
  }

  // Method to handle notification click events
  private handleNotificationClick(event: NotificationClickEvent): void {
    try {
      console.log('🔔 Processing notification click event:', JSON.stringify(event, null, 2));
      
      const notification = event.notification;
      const actionId = event.result?.actionId;
      
      // Log notification details
      const notificationData = notification as any;
      console.log('📱 Notification details:', {
        notificationId: notification.notificationId,
        title: notificationData.title || notificationData.heading || notification.content,
        body: notificationData.body || notification.content,
        actionId: actionId,
        additionalData: notificationData.additionalData || notificationData.rawPayload,
        launchURL: notificationData.launchURL || notificationData.url
      });

      // Android-specific: Add delay to prevent race conditions
      if (Platform.OS === 'android') {
        setTimeout(() => {
          this.processNotificationClick(actionId, notification);
        }, 100);
      } else {
        this.processNotificationClick(actionId, notification);
      }
      
    } catch (error) {
      console.error('❌ Error handling notification click:', error);
    }
  }

  // Separate method to process notification clicks
  private processNotificationClick(actionId: string | undefined, notification: OSNotification): void {
    try {
      // Handle different types of notification clicks
      if (actionId) {
        // Handle action button clicks
        console.log('🔘 Action button clicked:', actionId);
        this.handleNotificationAction(actionId, notification);
      } else {
        // Handle main notification body click
        console.log('📱 Main notification clicked');
        this.handleMainNotificationClick(notification);
      }

      // Always try to bring app to foreground (with Android-specific handling)
      this.bringAppToForeground();
      
    } catch (error) {
      console.error('❌ Error processing notification click:', error);
    }
  }

  // Method to handle main notification click (when user taps the notification body)
  private handleMainNotificationClick(notification: OSNotification): void {
    try {
      const notificationData = notification as any;
      
      // Check if notification has a launch URL
      if (notificationData.launchURL || notificationData.url) {
        const url = notificationData.launchURL || notificationData.url;
        console.log('🔗 Opening launch URL:', url);
        
        // Android-specific: Add delay before opening URL to prevent freezing
        if (Platform.OS === 'android') {
          setTimeout(() => {
            Linking.openURL(url).catch(err => {
              console.error('Failed to open launch URL:', err);
            });
          }, 300);
        } else {
          Linking.openURL(url).catch(err => {
            console.error('Failed to open launch URL:', err);
          });
        }
        return;
      }

      // Check if notification has additional data with navigation info
      const additionalData = notificationData.additionalData || notificationData.rawPayload;
      if (additionalData) {
        console.log('📊 Processing additional data:', additionalData);

        // Handle different navigation scenarios
        if (additionalData.screen) {
          console.log('🧭 Navigating to screen:', additionalData.screen);
          this.navigateToScreen(additionalData.screen, additionalData);
        } else if (additionalData.url) {
          console.log('🔗 Opening URL from additional data:', additionalData.url);
          Linking.openURL(additionalData.url).catch(err => {
            console.error('Failed to open URL from additional data:', err);
          });
        } else if (additionalData.deeplink) {
          console.log('🔗 Opening deeplink:', additionalData.deeplink);
          Linking.openURL(additionalData.deeplink).catch(err => {
            console.error('Failed to open deeplink:', err);
          });
        }
      }

      // Default behavior: just bring app to foreground
      console.log('📱 Default behavior: bringing app to foreground');
      
    } catch (error) {
      console.error('❌ Error handling main notification click:', error);
    }
  }

  // Method to handle action button clicks
  private handleNotificationAction(actionId: string, notification: OSNotification): void {
    try {
      console.log('🔘 Processing action:', actionId);

      switch (actionId) {
        case 'view':
        case 'open':
          this.handleMainNotificationClick(notification);
          break;
        case 'dismiss':
        case 'cancel':
          console.log('❌ Notification dismissed');
          break;
        default:
          console.log('🔘 Unknown action:', actionId);
          // Still try to handle as main click
          this.handleMainNotificationClick(notification);
          break;
      }
    } catch (error) {
      console.error('❌ Error handling notification action:', error);
    }
  }

  // Method to navigate to specific screens (can be extended based on app navigation)
  private navigateToScreen(screenName: string, data?: any): void {
    try {
      console.log('🧭 Navigation requested to:', screenName, 'with data:', data);
      
      // For now, just log the navigation request
      // This can be extended to integrate with React Navigation
      // Example: NavigationService.navigate(screenName, data);
      
      console.log('ℹ️ Screen navigation not implemented yet. Bringing app to foreground.');
      
    } catch (error) {
      console.error('❌ Error navigating to screen:', error);
    }
  }

  // Method to bring app to foreground
  private bringAppToForeground(): void {
    try {
      console.log('📱 Bringing app to foreground...');
      
      // Android-specific handling
      if (Platform.OS === 'android') {
        console.log('🤖 Android: Handling app foreground transition');
        
        // Add a small delay to ensure proper state transition
        setTimeout(() => {
          if (AppState.currentState !== 'active') {
            console.log('📱 App state is not active, current state:', AppState.currentState);
            // Force a state check after notification handling
            AppState.addEventListener('change', this.handleAppStateChange);
          }
        }, 200);
      } else {
        // iOS handling (existing logic)
        if (AppState.currentState !== 'active') {
          console.log('📱 App state is not active, current state:', AppState.currentState);
        }
      }
      
    } catch (error) {
      console.error('❌ Error bringing app to foreground:', error);
    }
  }

  // Handle app state changes (especially for Android)
  private handleAppStateChange = (nextAppState: string) => {
    console.log('📱 App state changed to:', nextAppState);
    
    if (nextAppState === 'active') {
      console.log('✅ App successfully brought to foreground');
      // Remove the listener once app is active
      // Note: In newer React Native versions, this should use the subscription pattern
    }
  };

  // Method to setup app state change listeners for better notification handling
  public setupAppStateListeners(): void {
    try {
      console.log('📱 Setting up app state listeners for notification handling...');
      
      AppState.addEventListener('change', (nextAppState) => {
        console.log('📱 App state changed to:', nextAppState);
        
        if (nextAppState === 'active') {
          console.log('📱 App became active - checking for pending notifications...');
          // App became active, possibly from notification click
          // Additional logic can be added here if needed
        }
      });
      
    } catch (error) {
      console.error('❌ Error setting up app state listeners:', error);
    }
  }

  // Method to set the external user ID (useful for associating users with OneSignal)
  public async setExternalUserId(userId: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('OneSignal not initialized');
      return;
    }
    
    try {
      // Use addAlias instead of login to avoid registration issues
      if (OneSignal?.User?.addAlias) {
        OneSignal.User.addAlias('external_user_id', userId);
        console.log('Successfully set external user ID via alias');
      }
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  // Method to log out the user
  public async logout(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      // Don't call OneSignal.logout() as it can cause external ID issues
      // Just log that logout was requested
      console.log('OneSignal logout requested - skipping to avoid external ID issues');
    } catch (error) {
      console.error('Error during OneSignal logout:', error);
    }
  }

  // Method to check if OneSignal is initialized
  public isOneSignalInitialized(): boolean {
    return this.isInitialized;
  }

  // Method to check notification permission status
  public getNotificationPermission(): string {
    try {
      if (OneSignal && OneSignal.Notifications && OneSignal.Notifications.hasPermission) {
        const hasPermission = OneSignal.Notifications.hasPermission();
        return hasPermission ? 'Granted' : 'Denied/Not Asked';
      }
      return 'Unknown';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return 'Error';
    }
  }

  /**
   * Check if OneSignal has a valid push subscription with token
   * Returns true only if device is fully subscribed and can receive notifications
   */
  public async hasValidPushSubscription(): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('⚠️ [OneSignal] Not initialized - no valid subscription');
      return false;
    }

    try {
      // Check if we have permission first
      const hasPermission = OneSignal?.Notifications?.hasPermission?.();
      console.log('🔍 [OneSignal] hasValidPushSubscription check - Permission:', hasPermission);
      
      if (!hasPermission) {
        console.log('⚠️ [OneSignal] No notification permission - no valid subscription');
        return false;
      }

      // Check for push subscription object
      if (!OneSignal?.User?.pushSubscription) {
        console.log('⚠️ [OneSignal] No pushSubscription object - no valid subscription');
        return false;
      }

      const pushSub = OneSignal.User.pushSubscription;
      console.log('🔍 [OneSignal] hasValidPushSubscription check - Full subscription:', {
        id: pushSub.id,
        optedIn: pushSub.optedIn,
        token: pushSub.token,
        hasToken: !!pushSub.token,
        tokenLength: pushSub.token?.length
      });

      // Check if subscribed (optedIn)
      if (!pushSub.optedIn) {
        console.log('⚠️ [OneSignal] Not opted in (optedIn=false) - no valid subscription');
        console.log('💡 [OneSignal] This usually means APNS certificate issue or wrong environment (Dev vs Prod)');
        return false;
      }

      // CRITICAL: Check if we have a valid push token (identifier)
      if (!pushSub.token || pushSub.token === '' || pushSub.token === 'null' || pushSub.token === 'none') {
        console.log('⚠️ [OneSignal] No valid push token - APNS/FCM registration incomplete');
        console.log('💡 [OneSignal] Token value:', pushSub.token);
        console.log('💡 [OneSignal] Check: 1) APNS certificate in OneSignal, 2) Dev vs Prod mismatch, 3) Bundle ID match');
        return false;
      }

      // Check if we have a subscription ID
      if (!pushSub.id || pushSub.id === '' || pushSub.id === 'none') {
        console.log('⚠️ [OneSignal] No subscription ID - registration incomplete');
        console.log('💡 [OneSignal] ID value:', pushSub.id);
        return false;
      }

      console.log('✅ [OneSignal] Valid push subscription confirmed:', {
        id: pushSub.id,
        token: pushSub.token?.substring(0, 20) + '...',
        optedIn: pushSub.optedIn,
        hasPermission: hasPermission
      });

      return true;

    } catch (error) {
      console.error('❌ [OneSignal] Error checking push subscription:', error);
      return false;
    }
  }

  // Method to get the OneSignal user ID with enhanced debugging
  public async getOneSignalUserId(): Promise<string | null> {
    if (!this.isInitialized) {
      console.log('OneSignal not initialized');
      return null;
    }
    
    try {
      console.log('🔍 Getting OneSignal User ID...');
      console.log('🔍 OneSignal object:', typeof OneSignal);
      console.log('🔍 OneSignal.User object:', typeof OneSignal?.User);
      
      // For OneSignal v5, use the correct API methods
      if (OneSignal && OneSignal.User) {
        console.log('🔍 OneSignal.User available, checking properties...');
        
        // Try the correct v5+ method: getOnesignalId()
        try {
          if (typeof OneSignal.User.getOnesignalId === 'function') {
            console.log('🔍 Calling OneSignal.User.getOnesignalId()...');
            const userId = OneSignal.User.getOnesignalId();
            console.log('🔍 getOnesignalId() result:', userId);
            
            if (userId && userId !== '') {
              console.log('✅ Found OneSignal User ID via getOnesignalId():', userId);
              return userId;
            }
          } else {
            console.log('🔍 OneSignal.User.getOnesignalId is not a function');
          }
        } catch (getIdError) {
          console.log('Error calling getOnesignalId:', getIdError);
        }
        
        // Try to get pushSubscription.id as alternative
        try {
          if (OneSignal.User.pushSubscription && OneSignal.User.pushSubscription.id) {
            const subscriptionId = OneSignal.User.pushSubscription.id;
            console.log('✅ Found Push Subscription ID:', subscriptionId);
            return subscriptionId;
          }
        } catch (subError) {
          console.log('Error getting push subscription:', subError);
        }
        
        // Check for direct properties
        console.log('🔍 OneSignal.User.onesignalId:', OneSignal.User.onesignalId);
        console.log('🔍 OneSignal.User.pushSubscriptionId:', OneSignal.User.pushSubscriptionId);
        
        if (OneSignal.User.onesignalId) {
          const userId = OneSignal.User.onesignalId;
          console.log('✅ Found OneSignal User ID via property:', userId);
          return userId;
        }
        
        // Try alternative approaches for v5
        try {
          console.log('🔍 Available OneSignal.User methods:', Object.keys(OneSignal.User));
          
          // Try addAlias method to trigger user creation
          if (typeof OneSignal.User.addAlias === 'function') {
            console.log('🔍 Adding alias to trigger user registration...');
            OneSignal.User.addAlias('app_user', 'miin_ojibwe_' + Date.now());
          }
          
          // Set up user change listener for future updates
          if (typeof OneSignal.User.addEventListener === 'function') {
            console.log('🔍 Setting up OneSignal user change listener...');
            OneSignal.User.addEventListener('change', (event: any) => {
              console.log('🔍 OneSignal user changed event:', JSON.stringify(event, null, 2));
              if (event?.current?.onesignalId) {
                console.log('✅ User ID available from change event:', event.current.onesignalId);
              }
            });
          }
        } catch (aliasError) {
          console.log('Error setting up user tracking:', aliasError);
        }
      } else {
        console.log('❌ OneSignal.User not available');
      }
      
      console.log('📱 OneSignal initialized but User ID not yet available - this is normal on first launch');
      return 'Initialized - ID pending...';
    } catch (error) {
      console.error('Error getting OneSignal user ID:', error);
      return null;
    }
  }
  
  // Method to force OneSignal user registration
  public async forceUserRegistration(): Promise<void> {
    try {
      console.log('🔄 Forcing OneSignal user registration...');
      
      if (OneSignal && OneSignal.User) {
        // Try to trigger registration by setting user properties
        if (typeof OneSignal.User.addAlias === 'function') {
          OneSignal.User.addAlias('app_user_id', 'miin_ojibwe_user_' + Date.now());
          console.log('✅ Added user alias to trigger registration');
        }
        
        if (typeof OneSignal.User.addTag === 'function') {
          OneSignal.User.addTag('app_version', '1.0.0');
          OneSignal.User.addTag('platform', 'ios');
          console.log('✅ Added user tags to trigger registration');
        }
        
        // Try to explicitly request user ID
        setTimeout(() => {
          this.logUserState();
        }, 3000);
      }
    } catch (error) {
      console.error('Error forcing user registration:', error);
    }
  }

  // Method to periodically check for user ID assignment
  public startUserIdMonitoring(): void {
    console.log('🔄 Starting OneSignal User ID monitoring...');
    
    let attempts = 0;
    const maxAttempts = 30; // Check for 30 seconds
    
    const checkInterval = setInterval(async () => {
      attempts++;
      console.log(`🔍 User ID check attempt ${attempts}/${maxAttempts}`);
      
      try {
        // Try the direct method first
        if (OneSignal?.User?.getOnesignalId) {
          const userId = OneSignal.User.getOnesignalId();
          if (userId && userId !== '' && userId !== null && userId !== undefined) {
            console.log('✅ OneSignal User ID found via monitoring:', userId);
            clearInterval(checkInterval);
            return;
          }
        }
        
        // Check push subscription
        if (OneSignal?.User?.pushSubscription?.id) {
          const subscriptionId = OneSignal.User.pushSubscription.id;
          console.log('✅ Push Subscription ID found via monitoring:', subscriptionId);
          clearInterval(checkInterval);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log('⚠️ OneSignal User ID monitoring timeout - user registration may be delayed');
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.log('Error during user ID monitoring:', error);
      }
    }, 1000); // Check every second
  }

  // Method to check push notification setup
  public async checkPushNotificationSetup(): Promise<void> {
    console.log('🔍 Checking push notification setup...');
    
    try {
      // Check if OneSignal is available
      if (!OneSignal) {
        console.error('❌ OneSignal is not available');
        return;
      }
      
      // Check initialization status
      console.log('✅ OneSignal object available');
      console.log('🔍 Initialization status:', this.isInitialized);
      
      // Check notification permissions
      try {
        const hasPermission = OneSignal.Notifications?.hasPermission?.();
        console.log('🔍 Has notification permission:', hasPermission);
        
        if (!hasPermission) {
          console.log('⚠️ Notification permission not granted - requesting...');
          const permission = await OneSignal.Notifications.requestPermission(true);
          console.log('🔍 Permission request result:', permission);
        }
      } catch (permError) {
        console.error('Error checking permissions:', permError);
      }
      
      // Check user state
      if (OneSignal.User) {
        console.log('✅ OneSignal.User available');
        
        // Try to get user ID
        try {
          const userId = OneSignal.User.getOnesignalId?.();
          console.log('🔍 Current user ID:', userId);
        } catch (userError) {
          console.log('Error getting user ID:', userError);
        }
        
        // Check push subscription
        try {
          const pushSub = OneSignal.User.pushSubscription;
          if (pushSub) {
            console.log('🔍 Push subscription status:');
            console.log('  - ID:', pushSub.id);
            console.log('  - Token:', pushSub.token);
            console.log('  - Opted in:', pushSub.optedIn);
          } else {
            console.log('⚠️ No push subscription found');
          }
        } catch (subError) {
          console.log('Error checking push subscription:', subError);
        }
      } else {
        console.error('❌ OneSignal.User not available');
      }
      
      // Force a user registration attempt
      console.log('🔄 Attempting to force user registration...');
      await this.forceUserRegistration();
      
    } catch (error) {
      console.error('Error during push notification setup check:', error);
    }
  }

  // Method to test notification reception
  public testNotificationReception(): void {
    console.log('🧪 [OneSignal] Testing notification reception...');
    console.log('📱 [OneSignal] Check the following:');
    console.log('  1. Device shows as "Subscribed" in OneSignal dashboard');
    console.log('  2. Push subscription optedIn is true');
    console.log('  3. Device has valid push token');
    console.log('  4. App has notification permissions');
    
    // Log current state
    this.logUserState();
    
    console.log('🔔 [OneSignal] Send a test notification from OneSignal dashboard to verify delivery');
  }

  // Method to force fresh subscription after APNS config change
  public async forceRefreshSubscription(): Promise<void> {
    console.log('🔄 [OneSignal] Forcing fresh subscription after APNS config change...');
    
    try {
      // Re-request permissions
      if (OneSignal?.Notifications?.requestPermission) {
        console.log('📱 [OneSignal] Re-requesting notification permissions...');
        await OneSignal.Notifications.requestPermission(true);
      }
      
      // Force opt-in again
      if (OneSignal?.User?.pushSubscription) {
        console.log('📱 [OneSignal] Force opting into push subscription...');
        OneSignal.User.pushSubscription.optIn();
        
        // Wait a moment then check status
        setTimeout(() => {
          const pushSub = OneSignal.User.pushSubscription;
          console.log('🔍 [OneSignal] Push subscription after refresh:', {
            id: pushSub?.id || 'none',
            token: pushSub?.token || 'none',
            optedIn: pushSub?.optedIn || false
          });
        }, 2000);
      }
      
      // Add a fresh tag to trigger registration
      if (OneSignal?.User?.addTag) {
        const timestamp = Date.now();
        OneSignal.User.addTag('refresh_timestamp', timestamp.toString());
        console.log('✅ [OneSignal] Added refresh timestamp tag:', timestamp);
      }
      
    } catch (error) {
      console.error('❌ [OneSignal] Error during subscription refresh:', error);
    }
  }
}

// Export singleton instance
export const oneSignalService = OneSignalService.getInstance();
