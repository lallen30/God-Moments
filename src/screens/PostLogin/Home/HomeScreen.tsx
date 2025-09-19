import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  Image,
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';

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
  const [todaysPrayer, setTodaysPrayer] = useState<DailyWord | null>(null);
  const [notificationsActive, setNotificationsActive] = useState(true);

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

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Sample prayer data - replace with actual API call
  useEffect(() => {
    setTodaysPrayer({
      notification_id: 1,
      daily_word: "Holy God I praise thy Name",
      content: "Today's prayer content...",
      link: "",
      date: getCurrentDate(),
      full_date: getCurrentDate(),
      created_at: new Date().toISOString()
    });
  }, []);

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
          
          {todaysPrayer && (
            <View style={styles.prayerCard}>
              <View style={styles.prayerContent}>
                <Text style={styles.prayerText}>{todaysPrayer.daily_word}</Text>
                <Text style={styles.prayerTime}>{getCurrentTime()}</Text>
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
            <Text style={styles.notificationText}>
              {notificationsActive 
                ? 'Your prayer notifications are active' 
                : 'Your prayer notifications are inactive'
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
});

export default HomeScreen;
