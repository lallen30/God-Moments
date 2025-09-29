import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../../theme/colors';
import { apiService } from '../../../../services/apiService';

interface TermsConditionsScreenProps {
  navigation: any;
}

interface TermsConditionsData {
  id: number;
  page_name: string;
  page_title: string;
  top_content: string;
  page_content: string;
  page_url: string;
  created_at: string;
  updated_at: string;
}

const TermsConditionsScreen: React.FC<TermsConditionsScreenProps> = ({ navigation }) => {
  const [termsData, setTermsData] = useState<TermsConditionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse HTML content to extract text and structure
  const parseHtmlContent = (htmlContent: string) => {
    console.log('Parsing Terms HTML content:', htmlContent);
    
    const sections: Array<{title: string, content: string}> = [];
    
    // Split by <strong> tags to identify sections
    const parts = htmlContent.split(/<\/?strong>/);
    console.log('Terms HTML parts after splitting:', parts);
    
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        const title = parts[i + 1]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        
        // Get content from the next part and clean it up
        let content = '';
        if (i + 2 < parts.length) {
          content = parts[i + 2]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        console.log(`Terms Section ${Math.floor(i/2)}: Title="${title}", Content="${content}"`);
        
        if (title && content) {
          sections.push({ title, content });
        }
      }
    }
    
    console.log('Parsed terms sections:', sections);
    return sections;
  };

  // Parse top content (handles different HTML structures)
  const parseTopContent = (htmlContent: string) => {
    console.log('Parsing terms top content:', htmlContent);
    
    if (!htmlContent || htmlContent.trim() === '') {
      console.log('Empty top content');
      return { title: '', description: '' };
    }
    
    // Remove outer div tags and get inner content
    let innerContent = htmlContent.replace(/<\/?div[^>]*>/g, '').trim();
    console.log('Inner content after removing divs:', innerContent);
    
    // Check if we have <strong> and <br> structure
    if (innerContent.includes('<strong>') && innerContent.includes('<br>')) {
      // Split by <br> first
      const parts = innerContent.split(/<br\s*\/?>/i);
      console.log('Parts split by <br>:', parts);
      
      if (parts.length >= 2) {
        // Extract title from first part (remove <strong> tags)
        const title = parts[0].replace(/<\/?strong>/gi, '').trim();
        // Get description from remaining parts
        const description = parts.slice(1).join(' ').trim();
        
        const result = {
          title: title,
          description: description
        };
        console.log('Parsed terms top content (strong/br structure):', result);
        return result;
      }
    }
    
    // Try splitting by <strong> tags if no <br>
    if (innerContent.includes('<strong>')) {
      const strongParts = innerContent.split(/<\/?strong>/);
      console.log('Parts split by <strong>:', strongParts);
      
      if (strongParts.length >= 3) {
        const title = strongParts[1].trim();
        const description = strongParts[2].trim();
        
        const result = {
          title: title,
          description: description
        };
        console.log('Parsed terms top content (strong only):', result);
        return result;
      }
    }
    
    // Fallback: try the Privacy Policy structure (split by divs)
    const divs = htmlContent.split(/<\/?div[^>]*>/);
    const cleanDivs = divs.filter(div => div.trim()).map(div => {
      // Remove all HTML tags including <strong> but keep the text content
      return div.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }).filter(div => div); // Remove empty strings
    console.log('Fallback - clean divs:', cleanDivs);
    
    if (cleanDivs.length >= 2) {
      const result = {
        title: cleanDivs[0] || '',
        description: cleanDivs[1] || ''
      };
      console.log('Parsed terms top content (fallback divs):', result);
      return result;
    }
    
    // Final fallback: use entire content as title
    const cleanContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    const result = {
      title: cleanContent,
      description: ''
    };
    console.log('Parsed terms top content (final fallback):', result);
    return result;
  };

  // Fetch terms & conditions data from API
  useEffect(() => {
    const fetchTermsConditions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the mobile API endpoint that should work
        console.log('Fetching Terms from mobile API endpoint...');
        const response = await apiService.getData('terms-conditions');
        console.log('Full Terms API Response:', JSON.stringify(response, null, 2));
        
        if (response && response.status === 'success' && response.data) {
          console.log('Terms Data received:', response.data);
          console.log('Terms top_content:', response.data.top_content);
          console.log('Terms page_content:', response.data.page_content);
          setTermsData(response.data);
        } else {
          console.log('Terms API endpoint failed:', response);
          // Provide fallback content instead of error
          const fallbackData: TermsConditionsData = {
            id: 1,
            page_name: 'terms_conditions',
            page_title: 'Terms & Conditions',
            top_content: '<div>Terms & Conditions</div><div>Please read and understand our terms of service for using God Moments.</div>',
            page_content: '<strong>Acceptance of Terms</strong>By using God Moments, you agree to be bound by these Terms & Conditions.<strong>Description of Service</strong>God Moments is a spiritual app designed to provide prayer reminders, spiritual content, and help you connect with your faith throughout the day.<strong>User Responsibilities</strong>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.<strong>Privacy</strong>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.<strong>Prohibited Uses</strong>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.<strong>Content</strong>All spiritual content, prayers, and materials provided through the app are for personal use and spiritual growth.<strong>Modifications</strong>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.<strong>Contact Information</strong>If you have questions about these Terms & Conditions, please contact us through the app.',
            page_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setTermsData(fallbackData);
        }
      } catch (err) {
        console.error('Error fetching terms & conditions:', err);
        // Provide fallback content instead of error
        const fallbackData: TermsConditionsData = {
          id: 1,
          page_name: 'terms_conditions',
          page_title: 'Terms & Conditions',
          top_content: '<div>Terms & Conditions</div><div>Please read and understand our terms of service for using God Moments.</div>',
          page_content: '<strong>Acceptance of Terms</strong>By using God Moments, you agree to be bound by these Terms & Conditions.<strong>Description of Service</strong>God Moments is a spiritual app designed to provide prayer reminders, spiritual content, and help you connect with your faith throughout the day.<strong>User Responsibilities</strong>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.<strong>Privacy</strong>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.<strong>Prohibited Uses</strong>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.<strong>Content</strong>All spiritual content, prayers, and materials provided through the app are for personal use and spiritual growth.<strong>Modifications</strong>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.<strong>Contact Information</strong>If you have questions about these Terms & Conditions, please contact us through the app.',
          page_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setTermsData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsConditions();
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading terms & conditions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !termsData) {
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load content'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const topContent = parseTopContent(termsData.top_content);
  const contentSections = parseHtmlContent(termsData.page_content);
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
        >
          <Icon name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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

export default TermsConditionsScreen;
