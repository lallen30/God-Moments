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

interface OurMissionScreenProps {
  navigation: any;
}

const OurMissionScreen: React.FC<OurMissionScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('More');
          }} 
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Mission</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Section */}
      <ImageBackground
        source={require('../../../assets/images/hero.png')}
        style={styles.heroSection}
        resizeMode="cover"
      >
        
      </ImageBackground>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* About God Moments Card */}
        <View style={styles.contentCard}>
          <View style={styles.cardBorder} />
          <Text style={styles.cardTitle}>About God Moments</Text>
          <Text style={styles.cardDescription}>
            Our app is a simple way to awaken you to the presence of God before you. Twice each day, at random times, your phone will gently chime with a bell and display a short scripture verse, inviting you to pause for a sacred moment of gratitude and prayer.
          </Text>
          <Text style={styles.tagline}>Stop. Breathe. Give thanks.</Text>
        </View>

        {/* Our Mission Card */}
        <View style={styles.contentCard}>
          <View style={styles.cardBorder} />
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardDescription}>
            We are a ministry of evangelization offered by the Vincentian priests and brothers of St. Vincent de Paul. If you're seeking a deeper prayer experience, discover our companion app, The God Minute—a 10-minute daily prayer that weaves together music, scripture, and reflection.
          </Text>
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
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    zIndex: 1000,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    marginLeft: -32,
  },
  headerSpacer: {
    width: 32,
  },
  heroSection: {
    height: height * 0.3,
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 3,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardBorder: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 20,
    width: 4,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 16,
    marginLeft: 16,
  },
  cardDescription: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 30,
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

export default OurMissionScreen;
