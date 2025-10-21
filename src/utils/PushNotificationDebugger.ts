import { Alert, Platform } from 'react-native';
import OneSignal from 'react-native-onesignal';

export class PushNotificationDebugger {
  static async checkPushNotificationStatus(): Promise<void> {
    try {
      console.log('🔍 Starting Push Notification Debug Check...');
      
      // Check if OneSignal is properly initialized
      const isOneSignalInitialized = await this.checkOneSignalInitialization();
      
      // Get push subscription details
      const pushSubscription = await this.getPushSubscriptionDetails();
      
      // Check permission status
      const permissionStatus = await this.checkNotificationPermissions();
      
      // Generate debug report
      const debugReport = this.generateDebugReport({
        isOneSignalInitialized,
        pushSubscription,
        permissionStatus,
        platform: Platform.OS,
        isSimulator: Platform.OS === 'ios' && !Platform.isPad && Platform.constants.systemName === 'iOS',
      });
      
      console.log('📋 Push Notification Debug Report:');
      console.log(debugReport);
      
      // Show alert with debug info
      Alert.alert(
        'Push Notification Debug',
        debugReport,
        [
          { text: 'Copy to Clipboard', onPress: () => this.copyToClipboard(debugReport) },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error during push notification debug check:', error);
      Alert.alert('Debug Error', `Failed to check push notification status: ${error}`);
    }
  }
  
  private static async checkOneSignalInitialization(): Promise<boolean> {
    try {
      const subscription = await this.fetchPushSubscriptionState();
      return !!subscription.id;
    } catch (error) {
      console.log('OneSignal initialization check failed:', error);
      return false;
    }
  }
  
  private static async getPushSubscriptionDetails(): Promise<any> {
    try {
      const subscription = await this.fetchPushSubscriptionState();
      return {
        id: subscription.id || 'Not available',
        token: subscription.token ? `${subscription.token.substring(0, 20)}...` : 'Token not available',
        optedIn: subscription.optedIn ?? false,
      };
    } catch (error) {
      console.log('Failed to get push subscription details:', error);
      return {
        id: 'Error retrieving',
        token: 'Error retrieving',
        optedIn: false,
      };
    }
  }
  
  private static async checkNotificationPermissions(): Promise<string> {
    try {
      const hasPermission = OneSignal.Notifications?.hasPermission?.();
      if (typeof hasPermission === 'boolean') {
        return hasPermission ? 'Granted' : 'Not granted';
      }

      const subscription = await this.fetchPushSubscriptionState();
      return subscription.id ? 'Granted' : 'Not granted';
    } catch (error) {
      console.log('Failed to check notification permissions:', error);
      return 'Error checking permissions';
    }
  }
  
  private static generateDebugReport(data: any): string {
    const {
      isOneSignalInitialized,
      pushSubscription,
      permissionStatus,
      platform,
      isSimulator
    } = data;
    
    return `
Platform: ${platform}
Is Simulator: ${isSimulator}
OneSignal Initialized: ${isOneSignalInitialized ? '✅' : '❌'}
Permission Status: ${permissionStatus}
User ID: ${pushSubscription.id}
Push Token: ${pushSubscription.token.length > 20 ? pushSubscription.token.substring(0, 20) + '...' : pushSubscription.token}
Opted In: ${pushSubscription.optedIn ? '✅' : '❌'}

${isSimulator ? '⚠️ Running on Simulator - Push notifications have limited support' : ''}
${!pushSubscription.optedIn ? '⚠️ User not opted in for push notifications' : ''}
${permissionStatus !== 'Granted' ? '⚠️ Notification permission not granted' : ''}
    `.trim();
  }
  
  private static copyToClipboard(text: string): void {
    // This would require a clipboard library
    console.log('Debug report (copy manually):', text);
  }
  
  // Method to request permission explicitly
  static async requestNotificationPermission(): Promise<boolean> {
    try {
      console.log('🔔 Checking notification permission...');
      const subscription = await this.fetchPushSubscriptionState();
      const hasPermission = !!subscription.id;
      console.log('Permission result:', hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required', 
          'Please allow notifications in your device settings for this app.',
          [{ text: 'OK' }]
        );
      }
      
      return hasPermission;
    } catch (error) {
      console.error('❌ Error checking notification permission:', error);
      return false;
    }
  }
  
  // Method to send a test notification (for development)
  static async sendTestNotification(): Promise<void> {
    try {
      const subscription = await this.fetchPushSubscriptionState();
      if (!subscription.id) {
        Alert.alert('Error', 'No OneSignal User ID found. Make sure OneSignal is properly initialized.');
        return;
      }
      
      Alert.alert(
        'Test Notification',
        `OneSignal User ID: ${subscription.id}\n\nUse this ID to send a test notification from the OneSignal dashboard.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error getting user ID for test notification:', error);
      Alert.alert('Error', 'Failed to get OneSignal User ID');
    }
  }

  private static async fetchPushSubscriptionState(): Promise<{
    id: string | null;
    token: string | null;
    optedIn: boolean | null;
  }> {
    if (!OneSignal?.User?.pushSubscription) {
      return { id: null, token: null, optedIn: null };
    }

    let id: string | null = null;
    let token: string | null = null;
    let optedIn: boolean | null = null;

    try {
      if (typeof OneSignal.User.pushSubscription.getIdAsync === 'function') {
        id = await OneSignal.User.pushSubscription.getIdAsync();
      } else if (typeof OneSignal.User.pushSubscription.getPushSubscriptionId === 'function') {
        const fallbackId = OneSignal.User.pushSubscription.getPushSubscriptionId();
        id = fallbackId || null;
      }
    } catch (error) {
      console.log('Failed to fetch push subscription ID:', error);
    }

    try {
      if (typeof OneSignal.User.pushSubscription.getTokenAsync === 'function') {
        token = await OneSignal.User.pushSubscription.getTokenAsync();
      } else if (typeof OneSignal.User.pushSubscription.getPushSubscriptionToken === 'function') {
        const fallbackToken = OneSignal.User.pushSubscription.getPushSubscriptionToken();
        token = fallbackToken || null;
      }
    } catch (error) {
      console.log('Failed to fetch push subscription token:', error);
    }

    try {
      if (typeof OneSignal.User.pushSubscription.getOptedInAsync === 'function') {
        optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
      } else if (typeof OneSignal.User.pushSubscription.getOptedIn === 'function') {
        optedIn = OneSignal.User.pushSubscription.getOptedIn();
      }
    } catch (error) {
      console.log('Failed to fetch push subscription opt-in state:', error);
    }

    return {
      id: id ?? null,
      token: token ?? null,
      optedIn: typeof optedIn === 'boolean' ? optedIn : null,
    };
  }
}
