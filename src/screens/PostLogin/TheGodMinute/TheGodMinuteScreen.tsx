import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';

interface TheGodMinuteScreenProps {
  navigation: any;
}

const TheGodMinuteScreen: React.FC<TheGodMinuteScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The God Minute</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Section */}
      <ImageBackground
        source={require('../../../assets/images/hero.png')}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>THE GOD MINUTE</Text>
          <Text style={styles.heroSubtitle}>DAILY SPIRITUAL MOMENTS</Text>
        </View>
      </ImageBackground>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.comingSoonSection}>
          <View style={styles.comingSoonCard}>
            <Icon name="time-outline" size={64} color={colors.accent} style={styles.comingSoonIcon} />
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            <Text style={styles.comingSoonDescription}>
              The God Minute is a new feature that will provide you with quick, 
              meaningful spiritual moments throughout your day. Stay tuned for 
              this exciting addition to your spiritual journey.
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Icon name="checkmark-circle-outline" size={20} color={colors.accent} />
                <Text style={styles.featureText}>One-minute spiritual reflections</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="checkmark-circle-outline" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Daily inspirational messages</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="checkmark-circle-outline" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Quick prayer moments</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="checkmark-circle-outline" size={20} color={colors.accent} />
                <Text style={styles.featureText}>Spiritual growth tips</Text>
              </View>
            </View>
          </View>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    marginLeft: -32, // Compensate for back button width
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
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
  comingSoonSection: {
    marginBottom: 40,
  },
  comingSoonCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  comingSoonIcon: {
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: colors.medium,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  featureText: {
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 12,
    flex: 1,
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
    textAlign: 'center',
  },
});

export default TheGodMinuteScreen;
