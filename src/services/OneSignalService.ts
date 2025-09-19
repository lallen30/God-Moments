// @ts-ignore - TypeScript definitions don't match the actual export
import * as OneSignalModule from 'react-native-onesignal';
const OneSignal = (OneSignalModule as any).OneSignal;

import type {
  OSNotification,
  NotificationClickEvent,
  NotificationWillDisplayEvent
} from 'react-native-onesignal';
import { EnvConfig } from '../utils/EnvConfig';
import { Linking, AppState } from 'react-native';

export class OneSignalService {
  private static instance: OneSignalService;
  private isInitialized = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  public async initialize(): Promise<void> {

    if (this.isInitialized) {
      return;
    }

    try {
      // Use hardcoded App ID to ensure initialization always occurs
      const appId = '2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965';
      
      OneSignal.initialize(appId);

      // Request notification permission
      try {
        await OneSignal.Notifications.requestPermission(true);
      } catch (permError) {
        console.warn('Could not request notification permission:', permError);
      }

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // WORKAROUND: Call OneSignal.login() to force User registration on Android
      // This fixes the OneSignal v5 Android User ID registration bug
      try {
        if (OneSignal.login) {
          // Generate a unique external ID for this device
          const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await OneSignal.login(deviceId);
        }
      } catch (loginError) {
        console.warn('OneSignal.login() failed:', loginError);
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
      console.log('🔍 OneSignal User State after initialization:', {
        isInitialized: this.isInitialized,
        userId: userId,
        hasNotificationPermission: OneSignal?.Notifications?.hasPermission?.() || 'unknown'
      });
    } catch (error) {
      console.log('Could not log user state:', error);
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

      // Always try to bring app to foreground
      this.bringAppToForeground();
      
    } catch (error) {
      console.error('❌ Error handling notification click:', error);
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
        Linking.openURL(url).catch(err => {
          console.error('Failed to open launch URL:', err);
        });
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
      
      // On Android, the app should automatically come to foreground when notification is tapped
      // This is handled by the Android system and OneSignal SDK
      
      // Force app state to active if it's not already
      if (AppState.currentState !== 'active') {
        console.log('📱 App state is not active, current state:', AppState.currentState);
        // The system should handle bringing the app to foreground
        // We can add additional logic here if needed
      }
      
    } catch (error) {
      console.error('❌ Error bringing app to foreground:', error);
    }
  }

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
      // Set external user ID using login method
      OneSignal.login(userId);
      console.log('Successfully set external user ID');
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  // Method to log out the user
  public async logout(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      OneSignal.logout();
      console.log('Successfully logged out from OneSignal');
    } catch (error) {
      console.error('Error logging out from OneSignal:', error);
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
}

// Export singleton instance
export const oneSignalService = OneSignalService.getInstance();
