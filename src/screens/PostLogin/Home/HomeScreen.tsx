import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { apiService, HolyGodPraiseData } from '../../../services/apiService';
import { scheduledNotificationService } from '../../../services/ScheduledNotificationService';

const { width, height } = Dimensions.get('window');

interface DailyWord {
  notification_id: number;
  daily_word: string;
  content: string;
  link: string;
  date: string;
  full_date: string;
  created_at: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [todaysPrayer, setTodaysPrayer] = useState<HolyGodPraiseData | null>(null);
  const [notificationsActive, setNotificationsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  // Get current date
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Format date from API response to "Month Day, Year" format
  const formatApiDate = (dateString: string) => {
    try {
      // Parse the date string from API (format: "25-09-2025")
      const [day, month, year] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return getCurrentDate(); // Fallback to current date
    }
  };

  // Check notification status from user preferences
  const checkNotificationStatus = async () => {
    try {
      // Check multiple sources for notification preference
      
      // 1. Check scheduled notification service settings (most reliable)
      if (scheduledNotificationService.isServiceInitialized()) {
        const currentSettings = await scheduledNotificationService.getCurrentSettings();
        if (currentSettings.notifications_enabled !== undefined) {
          console.log('📱 [Home] Using service notification setting:', currentSettings.notifications_enabled);
          setNotificationsActive(currentSettings.notifications_enabled);
          return;
        }
      }
      
      // 2. Check AsyncStorage for pushNotificationsEnabled (from onboarding/settings)
      const pushNotificationsEnabled = await AsyncStorage.getItem('pushNotificationsEnabled');
      if (pushNotificationsEnabled !== null) {
        const isEnabled = JSON.parse(pushNotificationsEnabled);
        console.log('📱 [Home] Using AsyncStorage notification setting:', isEnabled);
        setNotificationsActive(isEnabled);
        return;
      }
      
      // 3. Check userPreferences as fallback
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      if (userPreferences) {
        const preferences = JSON.parse(userPreferences);
        // Assume notifications are enabled if onboarding is completed but no explicit setting
        const isEnabled = preferences.onboardingCompleted !== false;
        console.log('📱 [Home] Using userPreferences fallback:', isEnabled);
        setNotificationsActive(isEnabled);
        return;
      }
      
      // 4. Default to true if no settings found
      console.log('📱 [Home] No notification settings found, defaulting to enabled');
      setNotificationsActive(true);
      
    } catch (error) {
      console.error('❌ [Home] Error checking notification status:', error);
      setNotificationsActive(true); // Default to enabled on error
    }
  };

  // Fetch Holy God Praise data from API and check notification status
  useEffect(() => {
    const fetchHolyGodPraise = async () => {
      try {
        setLoading(true);
        const data = await apiService.fetchHolyGodPraise();
        setTodaysPrayer(data);
      } catch (error) {
        console.error('Error fetching Holy God Praise:', error);
        setTodaysPrayer(null);
      } finally {
        setLoading(false);
      }
    };

    const initializeScreen = async () => {
      // Run both functions in parallel
      await Promise.all([
        fetchHolyGodPraise(),
        checkNotificationStatus()
      ]);
    };

    initializeScreen();
  }, []);

  // Refresh notification status when screen comes into focus (e.g., returning from Settings)
  useFocusEffect(
    useCallback(() => {
      console.log('📱 [Home] Screen focused, checking notification status...');
      checkNotificationStatus();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prayer</Text>
      </View>

      {/* Hero Section */}
      <ImageBackground
        source={require('../../../assets/images/hero-header.png')}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Daily Spiritual Moments</Text>
          <Text style={styles.heroSubtitle}>Strengthen your faith and{'\n'}grow everyday.</Text>
        </View>
      </ImageBackground>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Today's Prayer Section */}
        <View style={styles.todaysPrayerSection}>
          <Text style={styles.sectionTitle}>Today's Prayer</Text>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading today's prayer...</Text>
            </View>
          ) : todaysPrayer ? (
            <View style={styles.prayerCard}>
              <View style={styles.prayerContent}>
                <Text style={styles.prayerText}>{todaysPrayer.body}</Text>
                <Text style={styles.prayerTime}>{formatApiDate(todaysPrayer.date)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.prayerCard}>
              <View style={styles.prayerContent}>
                <Text style={styles.prayerText}>No prayer available for today</Text>
                <Text style={styles.prayerTime}>{getCurrentDate()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Cross Image */}
        <View style={styles.crossContainer}>
          <Image 
            source={require('../../../assets/images/cross.png')} 
            style={styles.crossImage}
            resizeMode="contain"
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.notificationsSection}>
          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <Text style={[
              styles.notificationText,
              { color: notificationsActive ? '#28a745' : '#dc3545' }
            ]}>
              {notificationsActive 
                ? 'Your prayer notifications are active' 
                : 'Your prayer notifications are disabled'
              }
            </Text>
          </View>
        </View>

        {/* More Options Button */}
        <TouchableOpacity 
          style={styles.moreOptionsButton}
          onPress={() => navigation.navigate('More')}
        >
          <Text style={styles.moreOptionsText}>More Options</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🙏</Text>
          <Text style={styles.footerTitle}>God Moments</Text>
          <Text style={styles.footerSubtitle}>Made with ♡ for your spiritual journey</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textDark,
  },
  heroSection: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Newsreader',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  todaysPrayerSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Newsreader',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 20,
  },
  prayerCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerContent: {
    flex: 1,
  },
  prayerText: {
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  prayerTime: {
    fontSize: 14,
    color: colors.medium,
  },
  crossContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  crossImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },
  notificationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Newsreader',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
  },
  moreOptionsButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  moreOptionsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 12,
    color: colors.medium,
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: colors.medium,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;
