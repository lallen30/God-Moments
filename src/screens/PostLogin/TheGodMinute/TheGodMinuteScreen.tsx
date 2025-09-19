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
      <ImageBackground
        source={require('../../../assets/images/hero-header.png')}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
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
      </ImageBackground>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Download Buttons */}
        <View style={styles.downloadSection}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>GET IT ON Google Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Download on the App Store</Text>
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
  heroSection: {
    height: height * 0.35,
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
  appIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 120,
    height: 120,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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
    width: 100,
    height: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  downloadSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  downloadButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
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
