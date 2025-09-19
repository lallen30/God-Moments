import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';

interface AgreeScreenProps {
  navigation: any;
}

const AgreeScreen: React.FC<AgreeScreenProps> = ({ navigation }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  const handleContinue = async () => {
    if (!termsAccepted || !privacyAccepted) {
      Alert.alert(
        'Required Agreements',
        'Please accept the Terms of Service and Privacy Policy to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Save agreement settings to local storage
      await AsyncStorage.setItem('termsAccepted', JSON.stringify(true));
      await AsyncStorage.setItem('privacyAccepted', JSON.stringify(true));
      await AsyncStorage.setItem('pushNotificationsEnabled', JSON.stringify(pushNotificationsEnabled));
      await AsyncStorage.setItem('onboardingStep', 'preferences');

      // Navigate to Set Preferences screen
      navigation.navigate('SetPreferences');
    } catch (error) {
      console.error('Error saving agreement settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleReadTerms = () => {
    // TODO: Navigate to Terms of Service screen or open web view
    Alert.alert('Terms of Service', 'This would open the Terms of Service document.');
  };

  const handleReadPolicy = () => {
    // TODO: Navigate to Privacy Policy screen or open web view
    Alert.alert('Privacy Policy', 'This would open the Privacy Policy document.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Before You Start</Text>
      </View>

      <ImageBackground
        source={require('../../assets/images/hero.png')}
        style={styles.heroSection}
        resizeMode="cover"
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instructionText}>
          Please review and accept our terms to{'\n'}continue using the app
        </Text>

        <View style={styles.agreementSection}>
          <TouchableOpacity
            style={styles.agreementItem}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>Terms of Service</Text>
              <Text style={styles.agreementDescription}>
                I agree to the Terms of Service and{'\n'}understand how the app works
              </Text>
              <TouchableOpacity onPress={handleReadTerms}>
                <Text style={styles.readLink}>Read Terms</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementItem}
            onPress={() => setPrivacyAccepted(!privacyAccepted)}
          >
            <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
              {privacyAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>Privacy Policy</Text>
              <Text style={styles.agreementDescription}>
                I understand how my data is{'\n'}collected, used and protected
              </Text>
              <TouchableOpacity onPress={handleReadPolicy}>
                <Text style={styles.readLink}>Read Policy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementItem}
            onPress={() => setPushNotificationsEnabled(!pushNotificationsEnabled)}
          >
            <View style={[styles.checkbox, pushNotificationsEnabled && styles.checkboxChecked]}>
              {pushNotificationsEnabled && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>Push Notifications</Text>
              <Text style={styles.agreementDescription}>
                Send me updates, reminders and{'\n'}promotional content (optional)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🙏</Text>
          <Text style={styles.footerTitle}>God Moments</Text>
          <Text style={styles.footerSubtitle}>Made with ♡ for your spiritual journey</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

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
    fontSize: 18,
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
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  agreementSection: {
    marginBottom: 40,
  },
  agreementItem: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementContent: {
    flex: 1,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  agreementDescription: {
    fontSize: 14,
    color: colors.medium,
    lineHeight: 20,
    marginBottom: 8,
  },
  readLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
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
  },
});

export default AgreeScreen;
