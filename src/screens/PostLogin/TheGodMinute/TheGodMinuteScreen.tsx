import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';

interface TheGodMinuteScreenProps {
  navigation: any;
}

const TheGodMinuteScreen: React.FC<TheGodMinuteScreenProps> = ({ navigation }) => {
  const openGooglePlay = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.cmwp.godmoment');
  };

  const openAppStore = () => {
    Linking.openURL('https://apps.apple.com/us/app/the-god-minute/id1385711396');
  };

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
        <Text style={styles.headerTitle}>The God Minute</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={require('../../../assets/images/hero-header.png')}
          style={styles.heroSection}
          resizeMode="cover"
        />
        
        {/* App Icon positioned to overlap both sections */}
        <View style={styles.appIconContainer}>
          <View style={styles.appIcon}>
            <Image 
              source={require('../../../assets/images/god-minute.png')}
              style={styles.godMinuteImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
      {/* Text content in lower portion with cream background */}
      <View style={styles.textSection}>
        <Text style={styles.appTitle}>THE GOD MINUTE</Text>
        <Text style={styles.appSubtitle}>
          A Catholic app that connects you with God every day in prayer.
        </Text>
        <Text style={styles.downloadText}>Download today. Always free.</Text>
      </View>

        {/* Download Buttons */}
        <View style={styles.downloadSection}>
          <TouchableOpacity 
            style={styles.storeButton}
            onPress={openGooglePlay}
            activeOpacity={0.8}
          >
            <View style={styles.storeButtonIcon}>
              <Icon name="logo-google-playstore" size={24} color={colors.white} />
            </View>
            <View style={styles.storeButtonTextContainer}>
              <Text style={styles.storeButtonSubtext}>GET IT ON</Text>
              <Text style={styles.storeButtonMainText}>Google Play</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.storeButton}
            onPress={openAppStore}
            activeOpacity={0.8}
          >
            <View style={styles.storeButtonIcon}>
              <Icon name="logo-apple-appstore" size={24} color={colors.white} />
            </View>
            <View style={styles.storeButtonTextContainer}>
              <Text style={styles.storeButtonSubtext}>Download on the</Text>
              <Text style={styles.storeButtonMainText}>App Store</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Description Card */}
        <View style={styles.contentCard}>
          <View style={styles.cardBorder} />
          <Text style={styles.cardTitle}>The God Minute</Text>
          <Text style={styles.cardDescription}>
            The God Minute is a small group of priests, nuns and lay people who start their day in prayer. Soft music, sacred scripture and a thoughtful reflection are weaved into a 10 minute guided reflection. Listen with your coffee in the morning, while driving to work or taking the dog for a walk. See how easy and beautiful prayer can be.
          </Text>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <View style={styles.cardBorder} />
          <View style={styles.authorPhoto}>
            <Image 
              source={require('../../../assets/images/priest.png')}
              style={styles.priestImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.quoteText}>
            We created The God Minute to help people connect with God every day through beautiful prayer.
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
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
    marginLeft: -32, // Compensate for back button width
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
  },
  heroContainer: {
    position: 'relative',
    height: height * 0.35,
  },
  heroSection: {
    height: '80%',
    width: '100%',
  },
  appIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -100 }, // Half of icon width (200/2)
      { translateY: -50 }    // Move up slightly to create overlap
    ],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  appIcon: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Newsreader',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
    fontWeight: '400',
  },
  downloadText: {
    fontSize: 16,
    color: '#D4A574',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 12,
  },
  godMinuteImage: {
    width: 180,
    height: 180,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0, // Add space for overlapping icon
    paddingBottom: 20,
  },
  downloadSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  storeButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storeButtonIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeButtonTextContainer: {
    flex: 1,
  },
  storeButtonSubtext: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 12,
  },
  storeButtonMainText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
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
    fontFamily: 'Newsreader',
    color: '#8B4513',
    marginBottom: 16,
    marginLeft: 16,
  },
  cardDescription: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginLeft: 16,
  },
  quoteCard: {
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
    alignItems: 'center',
  },
  authorPhoto: {
    marginBottom: 20,
  },
  photoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4A574',
  },
  priestImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  quoteText: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginLeft: 16,
    marginRight: 16,
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
