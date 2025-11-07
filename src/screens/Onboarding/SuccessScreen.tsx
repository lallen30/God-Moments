import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { colors } from '../../theme/colors';
import { apiService } from '../../services/apiService';

interface SuccessScreenProps {
  navigation: any;
}

interface SuccessData {
  page_title: string;
  page_content: string;
}

const { width, height } = Dimensions.get('window');

const SuccessScreen: React.FC<SuccessScreenProps> = ({ navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuccessData();
  }, []);

  const fetchSuccessData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching Success page from mobile API endpoint...');
      const response = await apiService.getData('success-message');
      console.log('Full Success API Response:', JSON.stringify(response, null, 2));
      
      if (response && response.status === 'ok' && response.pageData) {
        console.log('Success Data received:', response.pageData);
        setSuccessData({
          page_title: response.pageData.page_title,
          page_content: response.pageData.page_content
        });
      } else {
        console.log('Success API endpoint failed:', response);
        throw new Error('Failed to fetch success data');
      }
    } catch (err) {
      console.error('Error fetching success data:', err);
      setError('Failed to load success content');
      // Set default content as fallback
      setSuccessData({
        page_title: 'SUCCESS!',
        page_content: 'You will soon begin receiving your two random God Moment notifications. A bell will sound and a notice will appear on your phone with a short spiritual thought for the day.\n\nThat\'s it! Nothing to click or open. A simple, quick reminder to offer a moment of prayer to God in the midst of your busy day. Then swipe the notification away.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to Home screen (main app)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/jesus.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {loading ? (
              // Loading State
              <ActivityIndicator size="large" color={colors.white} />
            ) : (
              <>
                {/* Success Title */}
                <Text 
                  style={styles.successTitle}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  allowFontScaling={false}
                  maxFontSizeMultiplier={1}
                  minimumFontScale={0.5}
                >
                  {successData?.page_title?.toUpperCase() || 'SUCCESS!'}
                </Text>

                {/* Message Card */}
                <View style={styles.messageCard}>
                  {successData?.page_content ? (
                    <RenderHtml
                      contentWidth={windowWidth - 100}
                      source={{ html: successData.page_content }}
                      tagsStyles={{
                        body: {
                          color: '#000000',
                          fontSize: 15,
                          lineHeight: 24,
                          textAlign: 'center',
                          fontWeight: '500',
                        },
                        strong: {
                          fontWeight: '700',
                          color: '#000000',
                        },
                        p: {
                          marginBottom: 8,
                        },
                      }}
                    />
                  ) : (
                    <Text style={styles.messageText}>
                      You will soon begin receiving your two random God Moment notifications. A bell will sound and a notice will appear on your phone with a short spiritual thought for the day.{"\n\n"}That's it! Nothing to click or open. A simple, quick reminder to offer a moment of prayer to God in the midst of your busy day. Then swipe the notification away.
                    </Text>
                  )}
                </View>

                {/* Continue Button */}
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                  <Text style={styles.continueButtonText}>Continue to App</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 160,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Impact' : 'sans-serif-condensed',
    textTransform: 'uppercase',
    includeFontPadding: false,
    width: '100%',
    paddingHorizontal: 20,
  },
  messageCard: {
    backgroundColor: 'rgba(252, 246, 233, 0.75)',
    borderRadius: 15,
    padding: 20,
    marginTop: 0,
    marginHorizontal: 30,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500'
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SuccessScreen;
