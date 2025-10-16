import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { colors } from '../../theme/colors';
import { apiService } from '../../services/apiService';

const { width, height } = Dimensions.get('window');

interface WelcomeData {
  page_title: string;
  page_content: string;
}

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWelcomeData();
  }, []);

  const fetchWelcomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getApiData('welcome');
      console.log('Welcome API Response:', response);

      if (response?.status === 'success' && response?.data) {
        setWelcomeData(response.data);
      } else {
        throw new Error('Failed to fetch welcome data');
      }
    } catch (err) {
      console.error('Error fetching welcome data:', err);
      setError('Failed to load welcome content');
      // Set default content as fallback
      setWelcomeData({
        page_title: 'Welcome to God Moments',
        page_content: 'God Moments is a Catholic ministry of evangelization and faith offered by the Vincentian priests and brothers of St. Vincent De Paul. Our goal is to help people of faith connect with God in a deep and personal way.\nIf you are seeking a deeper prayer experience, discover our companion app, THE GOD MINUTE—a 10 minute daily prayer based on the Liturgy of the Hours that weaves sacred music, scripture and a short reflection into a spiritual meditation to bless your day.'
      });
    } finally {
      setLoading(false);
    }
  };


  const handleContinue = () => {
    // Navigate to the Agree screen in the onboarding flow
    navigation.navigate('Agree' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome</Text>
      </View>

      {/* Hero Image */}
      <ImageBackground
        source={require('../../assets/images/hero.png')}
        style={styles.heroSection}
        resizeMode="cover"
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
          ) : (
            <>
              {welcomeData?.page_title && (
                <Text style={styles.cardTitle}>{welcomeData.page_title}</Text>
              )}
              {welcomeData?.page_content && (
                <RenderHtml
                  contentWidth={width - 80}
                  source={{ html: welcomeData.page_content }}
                  tagsStyles={{
                    body: {
                      color: colors.textDark,
                      fontSize: 16,
                      lineHeight: 24,
                    },
                    strong: {
                      fontWeight: '700',
                      color: colors.textDark,
                    },
                    p: {
                      marginBottom: 8,
                    },
                    div: {
                      marginBottom: 0,
                    },
                    a: {
                      color: colors.accent,
                      textDecorationLine: 'underline',
                    },
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={require('../../assets/images/footer-icon.png')} style={styles.footerIcon} resizeMode="contain" />
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
    height: height * 0.30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Newsreader',
    color: colors.accent,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDark,
    textAlign: 'left',
  },
  loader: {
    marginVertical: 20,
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerIcon: {
    width: 12,
    height: 14,
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 14,
    color: colors.medium,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
