import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../../theme/colors';
import { apiService } from '../../../../services/apiService';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

interface PrivacyPolicyData {
  id: number;
  page_name: string;
  page_title: string;
  top_content: string;
  page_content: string;
  page_url: string;
  created_at: string;
  updated_at: string;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  const [privacyData, setPrivacyData] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse HTML content to extract text and structure
  const parseHtmlContent = (htmlContent: string) => {
    console.log('Parsing HTML content:', htmlContent);
    
    const sections: Array<{title: string, content: string}> = [];
    
    // Split by <strong> tags to identify sections
    const parts = htmlContent.split(/<\/?strong>/);
    console.log('HTML parts after splitting:', parts);
    
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        const title = parts[i + 1]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        
        // Get content from the next part and clean it up
        let content = '';
        if (i + 2 < parts.length) {
          content = parts[i + 2]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        console.log(`Section ${Math.floor(i/2)}: Title="${title}", Content="${content}"`);
        
        if (title && content) {
          sections.push({ title, content });
        }
      }
    }
    
    console.log('Parsed sections:', sections);
    return sections;
  };

  // Parse top content (simpler structure)
  const parseTopContent = (htmlContent: string) => {
    console.log('Parsing top content:', htmlContent);
    
    const divs = htmlContent.split(/<\/?div[^>]*>/);
    const cleanDivs = divs.filter(div => div.trim()).map(div => {
      // Remove all HTML tags including <strong> but keep the text content
      return div.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }).filter(div => div); // Remove empty strings
    
    console.log('Top content divs:', cleanDivs);
    
    const result = {
      title: cleanDivs[0] || '',
      description: cleanDivs[1] || ''
    };
    
    console.log('Parsed top content:', result);
    return result;
  };

  // Fetch privacy policy data from API
  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getApiData('privacy_policy');
        console.log('Privacy Policy API Response:', response);
        
        if (response.status === 'success' && response.data) {
          console.log('Privacy Policy Data:', response.data);
          setPrivacyData(response.data);
        } else {
          console.log('API Response Error:', response);
          // Provide fallback content instead of error
          const fallbackData: PrivacyPolicyData = {
            id: 1,
            page_name: 'privacy_policy',
            page_title: 'Privacy Policy',
            top_content: '<div>Privacy Policy</div><div>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</div>',
            page_content: '<strong>Information We Collect</strong>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.<strong>How We Use Your Information</strong>We use the information we collect to provide, maintain, and improve our services, send you prayer reminders and spiritual content, respond to your comments and questions, and ensure the security of our services.<strong>Information Sharing</strong>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.<strong>Data Security</strong>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.<strong>Your Rights</strong>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.<strong>Contact Us</strong>If you have any questions about this Privacy Policy, please contact us through the app or visit our website.',
            page_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setPrivacyData(fallbackData);
        }
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
        // Provide fallback content instead of error
        const fallbackData: PrivacyPolicyData = {
          id: 1,
          page_name: 'privacy_policy',
          page_title: 'Privacy Policy',
          top_content: '<div>Privacy Policy</div><div>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</div>',
          page_content: '<strong>Information We Collect</strong>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.<strong>How We Use Your Information</strong>We use the information we collect to provide, maintain, and improve our services, send you prayer reminders and spiritual content, respond to your comments and questions, and ensure the security of our services.<strong>Information Sharing</strong>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.<strong>Data Security</strong>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.<strong>Your Rights</strong>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.<strong>Contact Us</strong>If you have any questions about this Privacy Policy, please contact us through the app or visit our website.',
          page_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPrivacyData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              // Check if More screen exists in navigation state
              const state = navigation.getState();
              const hasMoreScreen = state.routes.some((route: any) => route.name === 'More');
              
              if (hasMoreScreen) {
                navigation.navigate('More');
              } else {
                navigation.goBack();
              }
            }} 
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading privacy policy...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !privacyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              // Check if More screen exists in navigation state
              const state = navigation.getState();
              const hasMoreScreen = state.routes.some((route: any) => route.name === 'More');
              
              if (hasMoreScreen) {
                navigation.navigate('More');
              } else {
                navigation.goBack();
              }
            }} 
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load content'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const topContent = parseTopContent(privacyData.top_content);
  const contentSections = parseHtmlContent(privacyData.page_content);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            // Check if More screen exists in navigation state
            const state = navigation.getState();
            const hasMoreScreen = state.routes.some((route: any) => route.name === 'More');
            
            if (hasMoreScreen) {
              navigation.navigate('More');
            } else {
              navigation.goBack();
            }
          }} 
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section - Dynamic from API */}
        <Text style={styles.topTitle}>{topContent.title}</Text>
        <Text style={styles.topDescription}>
          {topContent.description}
        </Text>

        {/* Dynamic Content Sections from API */}
        {contentSections.map((section, index) => (
          <View key={index} style={styles.contentCard}>
            <View style={styles.cardBorder} />
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Image source={require('../../../../assets/images/footer-icon.png')} style={styles.footerIcon} resizeMode="contain" />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Newsreader',
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  topDescription: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 10,
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
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
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
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  footerIcon: {
    width: 12,
    height: 14,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.medium,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;