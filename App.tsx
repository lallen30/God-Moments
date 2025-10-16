import React, { useEffect, useCallback } from 'react';
import { oneSignalService } from './src/services/OneSignalService';
import { scheduledNotificationService } from './src/services/ScheduledNotificationService';
import { onboardingUtils } from './src/utils/onboardingUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import DeviceInfo from 'react-native-device-info';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

function AppContent(): React.JSX.Element {
  console.log('🔥🔥🔥 APP CONTENT FUNCTION CALLED 🔥🔥🔥');
  
  const checkAppVersion = useCallback(async () => {
    try {
      // Temporarily disabled to prevent crashes
      // const currentVersion = DeviceInfo.getVersion();
      // const buildNumber = DeviceInfo.getBuildNumber();
      console.log(`App Version: 1.0.1 (1)`);
    } catch (error) {
      console.error('Error checking app version:', error);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAppVersion();
        
        // Initialize OneSignal
        console.log('🔥 [App] About to initialize OneSignal...');
        try {
          console.log('🚀 [App] Starting OneSignal initialization...');
          await oneSignalService.initialize();
          console.log('✅ [App] OneSignal initialization completed');
        } catch (oneSignalError) {
          console.error('❌ [App] Error initializing OneSignal:', oneSignalError);
          console.error('❌ [App] OneSignal error details:', JSON.stringify(oneSignalError));
        }
        console.log('🔥 [App] OneSignal initialization attempt finished');

        // Initialize Scheduled Notification Service only if onboarding is completed
        console.log('🔔 [App] Checking if onboarding is completed...');
        try {
          const onboardingCompleted = await onboardingUtils.isOnboardingCompleted();
          
          if (onboardingCompleted) {
            console.log('✅ [App] Onboarding completed, initializing Scheduled Notification Service...');
            await scheduledNotificationService.initialize();
            console.log('✅ [App] Scheduled Notification Service initialization completed');
            
            // Check for pending registration from onboarding
            try {
              const pendingRegistration = await AsyncStorage.getItem('pending_registration');
              
              if (pendingRegistration) {
                const settings = JSON.parse(pendingRegistration);
                console.log('🔄 [App] Found pending registration from onboarding, retrying...');
                
                // Retry registration in background
                const result = await scheduledNotificationService.registerDevice(settings);
                
                if (result.success) {
                  console.log('✅ [App] Pending registration completed successfully!');
                  await AsyncStorage.removeItem('pending_registration');
                } else {
                  console.warn('⚠️ [App] Pending registration still failed, will retry on next app launch');
                }
              }
            } catch (pendingError) {
              console.warn('⚠️ [App] Error checking/retrying pending registration:', pendingError);
            }
          } else {
            console.log('⏭️ [App] Onboarding not completed, skipping Scheduled Notification Service initialization');
          }
        } catch (scheduledError) {
          console.error('❌ [App] Error initializing Scheduled Notification Service:', scheduledError);
          console.error('❌ [App] Scheduled Notification Service error details:', JSON.stringify(scheduledError));
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };
    
    initializeApp();
  }, [checkAppVersion]);

  return <AppNavigator />;
}

// Wrap the entire app with ErrorBoundary
function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
