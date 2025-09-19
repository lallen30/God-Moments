import React from 'react';
import { withNavigationWrapper } from './NavigationWrapper';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import authService from '../services/authService';
// Removed TabNavigator import - no longer using bottom tabs
import AboutUsScreen from '../screens/PostLogin/AboutUs/AboutUsScreen';
import EventDetails from '../screens/PostLogin/Calendar/EventDetails';
import MyProfileScreen from '../screens/PostLogin/MyProfile/MyProfileScreen';
import EditProfileScreen from '../screens/PostLogin/EditProfile/EditProfileScreen';
import ChangePasswordScreen from '../screens/PostLogin/ChangePassword/ChangePasswordScreen';
import BluestoneAppsAIScreen from '../screens/PostLogin/BluestoneAppsAI/BluestoneAppsAIScreen';
import HomeScreen from '../screens/PostLogin/Home/HomeScreen';
import WordDetailScreen from '../screens/PostLogin/Home/WordDetailScreen';
import LearnMoreScreen from '../screens/PostLogin/Home/LearnMoreScreen';
import DailyWordsScreen from '../screens/PostLogin/DailyWords/DailyWordsScreen';
import PostsScreen from '../screens/PostLogin/Posts/PostsScreen';
import PostScreen from '../screens/PostLogin/Posts/PostScreen';
import PDFWebView from '../screens/PostLogin/PDF/PDFWebView';

import { colors } from '../theme/colors';
import PrivacyPolicyScreen from '../screens/PostLogin/Legal/PrivacyPolicy/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/PostLogin/Legal/TermsConditions/TermsConditionsScreen';
import AccountSettingsScreen from '../screens/PostLogin/Settings/AccountSettingsScreen';
import MoreScreen from '../screens/PostLogin/More/MoreScreen';
import TheGodMinuteScreen from '../screens/PostLogin/TheGodMinute/TheGodMinuteScreen';
import ContactScreen from '../screens/PostLogin/Contact/ContactScreen';
// Removed TermsConditionsScreen import as it's not found

const Drawer = createDrawerNavigator();

// Create a wrapper component that combines screen content with TabNavigator
// NOTE: This is no longer used - keeping for reference
// const ScreenWrapper = ({ children, navigation }: { children: React.ReactNode; navigation: any }) => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.contentWrapper}>
//         {React.cloneElement(children as React.ReactElement, { navigation })}
//       </View>
//       <View style={styles.tabNavigator}>
//         <TabNavigator />
//       </View>
//     </View>
//   );
// };

// Create screen-specific wrappers - all without TabNavigator except Home
const AboutUsWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <AboutUsScreen />
  </View>
));

const HomeWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <HomeScreen />
  </View>
));

const DailyWordsWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <DailyWordsScreen />
  </View>
));

const EventDetailsWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <EventDetails />
  </View>
));

const ProfileWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <MyProfileScreen />
  </View>
));

const EditProfileWrapper = withNavigationWrapper(({ navigation }: any) => (
  <View style={styles.container}>
    <EditProfileScreen navigation={navigation} />
  </View>
));

const ChangePasswordWrapper = withNavigationWrapper(({ navigation }: any) => (
  <View style={styles.container}>
    <ChangePasswordScreen navigation={navigation} />
  </View>
));

const AIWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <BluestoneAppsAIScreen />
  </View>
));

const PrivacyPolicyWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <PrivacyPolicyScreen />
  </View>
));

const TermsConditionsWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <TermsConditionsScreen />
  </View>
));

const AccountSettingsWrapper = withNavigationWrapper(({ navigation }: any) => (
  <View style={styles.container}>
    <AccountSettingsScreen navigation={navigation} />
  </View>
));

const MoreWrapper = withNavigationWrapper(({ navigation }: any) => (
  <View style={styles.container}>
    <MoreScreen navigation={navigation} />
  </View>
));

const TheGodMinuteWrapper = withNavigationWrapper(({ navigation }: any) => (
  <View style={styles.container}>
    <TheGodMinuteScreen navigation={navigation} />
  </View>
));

const ContactWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <ContactScreen />
  </View>
));

const PostsWrapper = withNavigationWrapper(({ navigation }: any) => (
  <View style={styles.container}>
    <PostsScreen navigation={navigation} />
  </View>
));

const PostWrapper = withNavigationWrapper(() => (
  <View style={styles.container}>
    <PostScreen />
  </View>
));

const DrawerNavigator = ({ navigation }: any) => {
  const handleLogout = async () => {
    try {
      // Call the logout service
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always navigate to login screen, even if there was an error in logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.white,
            width: 280,
          },
          drawerActiveBackgroundColor: colors.footerBg,
          drawerActiveTintColor: colors.footerFont,
          drawerInactiveTintColor: colors.dark,
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="MyProfile"
          component={ProfileWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="person-outline" size={24} color={color} />
            ),
            drawerLabel: 'My Profile',
            drawerItemStyle: { display: 'none' },
          }}
        />
        {/* Temporarily hidden Bluestone AI screen */}
        {/* <Drawer.Screen
          name="BluestoneAI"
          component={AIWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="bulb-outline" size={24} color={color} />
            ),
            drawerLabel: 'Bluestone AI',
          }}
        /> */}
        <Drawer.Screen
          name="EventDetails"
          component={EventDetailsWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="calendar-outline" size={24} color={color} />
            ),
            drawerLabel: () => null,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="About Us"
          component={AboutUsWrapper}
          options={{
            drawerIcon: ({ focused, size, color }) => (
              <Icon name={focused ? 'information-circle' : 'information-circle-outline'} size={size} color={focused ? color : '#666'} />
            ),
          }}
        />
        <Drawer.Screen
          name="Account Settings"
          component={AccountSettingsWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="settings-outline" size={24} color={color} />
            ),
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="More"
          component={MoreWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="ellipsis-horizontal-outline" size={24} color={color} />
            ),
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="The God Minute"
          component={TheGodMinuteWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="time-outline" size={24} color={color} />
            ),
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="Contact"
          component={ContactWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="mail-outline" size={24} color={color} />
            ),
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="DailyWords"
          component={DailyWordsWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="notifications-outline" size={24} color={color} />
            ),
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="EditProfile"
          component={EditProfileWrapper}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="ChangePassword"
          component={ChangePasswordWrapper}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="WordDetail"
          component={withNavigationWrapper(WordDetailScreen)}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="LearnMore"
          component={withNavigationWrapper(LearnMoreScreen)}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="NewsDetail"
          component={PostWrapper}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="PDFWebView"
          component={withNavigationWrapper(PDFWebView)}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="Privacy Policy"
          component={PrivacyPolicyWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="document-text-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Terms of Service"
          component={TermsConditionsWrapper}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="document-outline" size={24} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="Logout"
          component={EmptyComponent}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="log-out-outline" size={24} color={color} />
            ),
            drawerItemStyle: { display: 'none' },
          }}
          listeners={{
            drawerItemPress: () => handleLogout(),
          }}
        />
      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Removed contentWrapper and tabNavigator styles since tabs are no longer used
});

const EmptyComponent = () => null;

export default DrawerNavigator;