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
      // Try to get user state to check if OneSignal is initialized
      const userState = await OneSignal.User.getPushSubscription();
      return userState !== null;
    } catch (error) {
      console.log('OneSignal initialization check failed:', error);
      return false;
    }
  }
  
  private static async getPushSubscriptionDetails(): Promise<any> {
    try {
      const pushSubscription = await OneSignal.User.getPushSubscription();
      return {
        id: pushSubscription?.id || 'Not available',
        token: 'Token not directly accessible in v5',
        optedIn: pushSubscription?.id ? true : false,
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
      // In OneSignal v5, we need to check permission differently
      const pushSubscription = await OneSignal.User.getPushSubscription();
      return pushSubscription?.id ? 'Granted' : 'Not granted';
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
      // In OneSignal v5, permissions are handled automatically during initialization
      // Check if permission was granted by checking if we have a user ID
      const pushSubscription = await OneSignal.User.getPushSubscription();
      const hasPermission = !!pushSubscription?.id;
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
      const pushSubscription = await OneSignal.User.getPushSubscription();
      if (!pushSubscription?.id) {
        Alert.alert('Error', 'No OneSignal User ID found. Make sure OneSignal is properly initialized.');
        return;
      }
      
      Alert.alert(
        'Test Notification',
        `OneSignal User ID: ${pushSubscription.id}\n\nUse this ID to send a test notification from the OneSignal dashboard.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error getting user ID for test notification:', error);
      Alert.alert('Error', 'Failed to get OneSignal User ID');
    }
  }
}
