import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/PreLogin/Login/LoginScreen';
import { WelcomeScreen, AgreeScreen, SetPreferencesScreen, SuccessScreen } from '../screens/Onboarding';
import SimpleTestScreen from '../screens/Test/SimpleTestScreen';
import Splash from '../screens/Splash/Splash';

import ForgotPasswordScreen from '../screens/PreLogin/ForgotPassword/ForgotPasswordScreen';
import SignUpScreen from '../screens/PreLogin/SignUp/SignUpScreen';
import VerifyEmailScreen from '../screens/PreLogin/VerifyEmail/VerifyEmailScreen';
import DrawerNavigator from './DrawerNavigator';
import TermsAndConditionsScreen from '../screens/PostLogin/Legal/TermsConditions/TermsConditionsScreen';
import PrivacyPolicyScreen from '../screens/PostLogin/Legal/PrivacyPolicy/PrivacyPolicyScreen';
import { withNavigationWrapper } from './NavigationWrapper';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Wrap components with navigation wrapper
const WrappedWelcomeScreen = withNavigationWrapper(WelcomeScreen);
const WrappedAgreeScreen = withNavigationWrapper(AgreeScreen);
const WrappedSetPreferencesScreen = withNavigationWrapper(SetPreferencesScreen);
const WrappedSuccessScreen = withNavigationWrapper(SuccessScreen);
const WrappedSimpleTestScreen = withNavigationWrapper(SimpleTestScreen);
const WrappedLoginScreen = withNavigationWrapper(LoginScreen);
const WrappedSignUpScreen = withNavigationWrapper(SignUpScreen);
const WrappedForgotPasswordScreen = withNavigationWrapper(ForgotPasswordScreen);
const WrappedVerifyEmailScreen = withNavigationWrapper(VerifyEmailScreen);
const WrappedTermsAndConditionsScreen = withNavigationWrapper(TermsAndConditionsScreen);
const WrappedPrivacyPolicyScreen = withNavigationWrapper(PrivacyPolicyScreen);

const AppNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 [AppNavigator] Checking onboarding status...');

      // Check if onboarding has been completed
      const userPreferences = await AsyncStorage.getItem('userPreferences');

      if (userPreferences) {
        const preferences = JSON.parse(userPreferences);
        console.log('📋 [AppNavigator] Found user preferences:', preferences);

        if (preferences.onboardingCompleted) {
          console.log('✅ [AppNavigator] Onboarding completed, navigating to Home');
          setInitialRoute('Home');
        } else {
          console.log('⏳ [AppNavigator] Onboarding not completed, starting with Welcome');
          setInitialRoute('Welcome');
        }
      } else {
        console.log('🆕 [AppNavigator] No user preferences found, starting with Welcome');
        setInitialRoute('Welcome');
      }
    } catch (error) {
      console.error('❌ [AppNavigator] Error checking onboarding status:', error);
      // Default to Welcome screen on error
      setInitialRoute('Welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <Splash onFinish={handleSplashFinish} />;
  }

  // Show loading screen while checking onboarding status
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
      }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'default'
        }}>
        <Stack.Screen
          name="SimpleTest"
          component={WrappedSimpleTestScreen}
        />
        <Stack.Screen
          name="Welcome"
          component={WrappedWelcomeScreen}
        />
        <Stack.Screen
          name="Agree"
          component={WrappedAgreeScreen}
        />
        <Stack.Screen
          name="SetPreferences"
          component={WrappedSetPreferencesScreen}
        />
        <Stack.Screen
          name="Success"
          component={WrappedSuccessScreen}
        />
        <Stack.Screen
          name="Login"
          component={WrappedLoginScreen}
        />
        <Stack.Screen
          name="Home"
          component={DrawerNavigator}
        />
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
        />
        <Stack.Screen
          name="SignUp"
          component={WrappedSignUpScreen}
          options={{
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={WrappedForgotPasswordScreen}
          options={{
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="VerifyEmail"
          component={WrappedVerifyEmailScreen}
          options={{
            presentation: 'card'
          }}
        />
        {/* Privacy Policy and Terms are now in DrawerNavigator for proper back navigation */}
        <Stack.Screen
          name="TermsAndConditions"
          component={WrappedTermsAndConditionsScreen}
          options={{
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={WrappedPrivacyPolicyScreen}
          options={{
            presentation: 'modal'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
