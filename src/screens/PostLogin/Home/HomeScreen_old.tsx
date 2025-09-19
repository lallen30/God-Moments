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
  const navigation = useNavigation();
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
        <TouchableOpacity style={styles.moreOptionsButton}>
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

const fetchAndStoreNotifications = async () => {
  try {
    console.log('Fetching notifications...');
    const response = await apiService.fetchAndStoreNotifications(1, 100, true);
    const newNotifications = response?.data || [];
    console.log('Fetched notifications:', newNotifications);
    if (newNotifications && newNotifications.length > 0) {
      setWordList(newNotifications);
    }
    return newNotifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Try to load from storage if API fails
    const storedNotifications = await storageService.get('notifications');
    if (storedNotifications) {
      console.log('Using stored notifications');
      setWordList(storedNotifications);
      return storedNotifications;
    }
    return [];
  }
};

// Fetch posts and store them in local storage
const fetchAndStorePosts = async () => {
  try {
    console.log('Fetching posts...');
    const newPosts = await apiService.fetchAndStorePosts();
    console.log('Fetched posts:', newPosts);
    if (newPosts && newPosts.length > 0) {
      setPostsList(newPosts);
      console.log('Posts set to state:', newPosts);
    } else {
      console.log('No posts received from API');
    }
    return newPosts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Try to load from storage if API fails
    const storedPosts = await storageService.get('posts');
    if (storedPosts) {
      console.log('Using stored posts:', storedPosts);
      setPostsList(storedPosts);
      return storedPosts;
    }
    console.log('No stored posts available');
    return [];
  }
};

// Fetch social media data
const fetchSocialMediaData = async () => {
  try {
    const socialData = await apiService.fetchSocialMedia();
    setSocialMediaData(socialData);
    console.log('Social media data fetched:', socialData);
  } catch (error) {
    console.error('Error fetching social media data:', error);
    // Set default values if API fails
    setSocialMediaData({
      facebook: 'https://www.facebook.com/profile.php?id=100087341866606',
      donate_link: 'https://www.paypal.com/donate/?hosted_button_id=FKJZX24327HPG',
      instagram: 'https://www.instagram.com/miin.ojibwe/',
      tiktok: 'https://www.tiktok.com/@miinojibwe'
    });
  }
};

// Fetch latest notification
const fetchLatestNotification = async (isRefreshing = false) => {
  try {
    if (!isRefreshing) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    // Clear any previous errors
    setError(null);

    // Fetch latest notification and notifications list in parallel, but don't let one failure block others
    const results = await Promise.allSettled([
      apiService.getData('latest-notification'),
      fetchAndStoreNotifications(),
      fetchAndStorePosts(),
      fetchSocialMediaData()
    ]);

    const notificationSettled = results[0];
    const notificationsSettled = results[1];
    // We don't need the values here, these functions already set state internally

    let notificationResponse: any = null;
    let notifications: any[] = [];

    if (notificationSettled.status === 'fulfilled') {
      notificationResponse = notificationSettled.value;
    } else {
      console.warn('latest-notification request failed:', notificationSettled.reason);
    }

    if (notificationsSettled.status === 'fulfilled') {
      notifications = notificationsSettled.value || [];
    } else {
      console.warn('notifications request failed:', notificationsSettled.reason);
      // Try to recover from storage so Recent Words still show
      console.log('Fetched notifications:', newNotifications);
      if (newNotifications && newNotifications.length > 0) {
        setWordList(newNotifications);
      }
      return newNotifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Try to load from storage if API fails
      const storedNotifications = await storageService.get('notifications');
      if (storedNotifications) {
        console.log('Using stored notifications');
        setWordList(storedNotifications);
        return storedNotifications;
      }
      return [];
    }
  };

  // Fetch posts and store them in local storage
  const fetchAndStorePosts = async () => {
    try {
      console.log('Fetching posts...');
      const newPosts = await apiService.fetchAndStorePosts();
      console.log('Fetched posts:', newPosts);
      if (newPosts && newPosts.length > 0) {
        setPostsList(newPosts);
        console.log('Posts set to state:', newPosts);
      } else {
        console.log('No posts received from API');
      }
      return newPosts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Try to load from storage if API fails
      const storedPosts = await storageService.get('posts');
      if (storedPosts) {
        console.log('Using stored posts:', storedPosts);
        setPostsList(storedPosts);
        return storedPosts;
      }
      console.log('No stored posts available');
      return [];
    }
  };

  // Fetch social media data
  const fetchSocialMediaData = async () => {
    try {
      const socialData = await apiService.fetchSocialMedia();
      setSocialMediaData(socialData);
      console.log('Social media data fetched:', socialData);
    } catch (error) {
      console.error('Error fetching social media data:', error);
      // Set default values if API fails
      setSocialMediaData({
        facebook: 'https://www.facebook.com/profile.php?id=100087341866606',
        donate_link: 'https://www.paypal.com/donate/?hosted_button_id=FKJZX24327HPG',
        instagram: 'https://www.instagram.com/miin.ojibwe/',
        tiktok: 'https://www.tiktok.com/@miinojibwe'
      });
    }
  };

  // Fetch latest notification
  const fetchLatestNotification = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Clear any previous errors
      setError(null);

      // Fetch latest notification and notifications list in parallel, but don't let one failure block others
      const results = await Promise.allSettled([
        apiService.getData('latest-notification'),
        fetchAndStoreNotifications(),
        fetchAndStorePosts(),
        fetchSocialMediaData()
      ]);

      const notificationSettled = results[0];
      const notificationsSettled = results[1];
      // We don't need the values here, these functions already set state internally

      let notificationResponse: any = null;
      let notifications: any[] = [];

      if (notificationSettled.status === 'fulfilled') {
        notificationResponse = notificationSettled.value;
      } else {
        console.warn('latest-notification request failed:', notificationSettled.reason);
      }

      if (notificationsSettled.status === 'fulfilled') {
        notifications = notificationsSettled.value || [];
      } else {
        console.warn('notifications request failed:', notificationsSettled.reason);
        // Try to recover from storage so Recent Words still show
        const storedNotifications = await storageService.get('notifications');
        if (storedNotifications && Array.isArray(storedNotifications)) {
          notifications = storedNotifications;
          setWordList(storedNotifications);
        }
      }

      console.log('Latest notification response:', notificationResponse);

      // Try to get the daily word from whichever source is available
      let dailyWordData = null as any;
      if (notificationResponse?.status === 'success') {
        dailyWordData = notificationResponse.daily_word || notificationResponse;
      } else if (notificationResponse?.daily_word) {
        dailyWordData = notificationResponse.daily_word;
      } else if (Array.isArray(notificationResponse) && notificationResponse.length > 0) {
        dailyWordData = notificationResponse[0];
      } else if (notifications && notifications.length > 0) {
        // Fall back to first notification if latest-notification unavailable
        dailyWordData = notifications[0];
      }

      if (dailyWordData) {
        console.log('Setting daily word:', dailyWordData);
        setDailyWord(dailyWordData);
        setWebViewHeight(150); // Reset height for new content
        setError(null); // Clear any previous errors on successful load
      } else {
        console.log('No daily word available in any format');
        setDailyWord(null);
      }
    } catch (error) {
      console.error('Error fetching latest notification:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error loading data';
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage = 'Network connection issue. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'App permissions required. Please restart the app.';
        }
      }
      
      // Only set error if this is not a retry attempt (to avoid overwriting retry logic)
      if (!isRefreshing) {
        throw error; // Re-throw for retry logic to handle
      } else {
        setError(errorMessage);
      }
      setDailyWord(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!isCheckingRef.current) {
      isCheckingRef.current = true;
      console.log('Initial data fetch started');
      
      const init = async () => {
        try {
          // First, immediately load any cached data to show something quickly
          try {
            const [cachedNotifications, cachedPosts] = await Promise.all([
              storageService.get('notifications'),
              storageService.get('posts')
            ]);
            
            if (cachedNotifications && cachedNotifications.length > 0) {
              console.log('Loading cached notifications immediately:', cachedNotifications.length);
              setWordList(cachedNotifications);
              setDailyWord(cachedNotifications[0]);
            }
            
            if (cachedPosts && cachedPosts.length > 0) {
              console.log('Loading cached posts immediately:', cachedPosts.length);
              setPostsList(cachedPosts);
            }
          } catch (storageError) {
            console.warn('Failed to load initial cached data:', storageError);
          }
          
          // Add a grace period to ensure app is fully initialized
          // This helps when permission dialogs delay app readiness
          console.log('Waiting for app initialization grace period...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          await checkForUpdates();
          
          // Retry logic for initial data fetch
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              console.log(`Attempting data fetch (attempt ${retryCount + 1}/${maxRetries})`);
              await fetchLatestNotification();
              console.log('Initial data fetch completed successfully');
              break; // Success, exit retry loop
            } catch (fetchError) {
              retryCount++;
              console.warn(`Data fetch attempt ${retryCount} failed:`, fetchError);
              
              if (retryCount < maxRetries) {
                // Wait before retry (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              } else {
                console.error('All data fetch attempts failed');
                setError('Unable to load data. Please pull down to refresh.');
              }
            }
          }
          
          // Also load any cached posts from storage
          try {
            const cachedPosts = await storageService.get('posts');
            if (cachedPosts && cachedPosts.length > 0) {
              console.log('Loading cached posts:', cachedPosts);
              setPostsList(cachedPosts);
            } else {
              console.log('No cached posts found, attempting to fetch fresh posts');
              // Try to fetch posts even if notifications succeeded
              try {
                await fetchAndStorePosts();
              } catch (postsError) {
                console.warn('Failed to fetch posts during init:', postsError);
              }
            }
          } catch (storageError) {
            console.warn('Failed to load cached posts:', storageError);
          }
          
          setHasCheckedOnMount(true);
        } catch (error) {
          console.error('Error during initial app setup:', error);
          setError('App initialization failed. Please restart the app.');
          setLoading(false);
          setRefreshing(false);
        }
      };
      
      init();
    }
  }, []);

  // Debug effect to monitor postsList changes
  useEffect(() => {
    console.log('postsList changed:', postsList);
    console.log('postsList length:', postsList?.length || 0);
    if (postsList && postsList.length > 0) {
      console.log('First category:', postsList[0]);
      console.log('Total posts across all categories:', 
        postsList.reduce((total, cat) => total + cat.posts.length, 0)
      );
    }
  }, [postsList]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    console.log('Manual refresh triggered, fetching both notifications and posts');
    fetchLatestNotification(true);
  };

  // Format date as MM-DD-YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // If date is already in DD-MM-YYYY format, convert it to MM-DD-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        return `${month}-${day}-${year}`;
      }
      
      // For other formats, try to parse as Date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      // Format as MM-DD-YYYY
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if error
    }
  };


  // HTML template with basic styling
  const getHtmlTemplate = (content: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #2c3e50;
            padding: 0;
            margin: 0;
          }
          a {
            color: #007AFF;
            text-decoration: none;
          }
          .container {
            padding: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
    `;
  };

  // Handle navigation to external links
  const onShouldStartLoadWithRequest = (event: any) => {
    if (event.url !== 'about:blank') {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

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
        <TouchableOpacity style={styles.moreOptionsButton}>
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
