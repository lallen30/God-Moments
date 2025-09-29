import React, { useState, useEffect } from 'react';
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
import { colors } from '../../../theme/colors';
import { apiService } from '../../../services/apiService';

interface AboutUsScreenProps {
  navigation: any;
}

interface AboutUsData {
  id: number;
  page_name: string;
  page_title: string;
  top_content: string;
  page_content: string;
  page_url: string;
  created_at: string;
  updated_at: string;
}

const AboutUsScreen: React.FC<AboutUsScreenProps> = ({ navigation }) => {
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse top content and extract blockquote separately
  const parseTopContent = (htmlContent: string) => {
    console.log('Parsing About Us top content:', htmlContent);
    
    if (!htmlContent || htmlContent.trim() === '') {
      console.log('Empty top content');
      return { title: '', description: '', tagline: '' };
    }

    // Check for blockquote first
    const blockquoteMatch = htmlContent.match(/<blockquote[^>]*>(.*?)<\/blockquote>/i);
    const tagline = blockquoteMatch ? blockquoteMatch[1].trim() : '';
    
    // Remove blockquote from content for processing
    let contentWithoutBlockquote = htmlContent.replace(/<blockquote[^>]*>.*?<\/blockquote>/gi, '').trim();
    
    // Remove outer div tags and get inner content
    let innerContent = contentWithoutBlockquote.replace(/<\/?div[^>]*>/g, '').trim();
    console.log('Inner content after removing divs:', innerContent);
    
    // Check if we have <strong> and <br> structure
    if (innerContent.includes('<strong>') && innerContent.includes('<br>')) {
      // Split by <br> first
      const parts = innerContent.split(/<br\s*\/?>/i);
      console.log('Parts split by <br>:', parts);
      
      if (parts.length >= 2) {
        // Extract title from first part (remove <strong> tags)
        const title = parts[0].replace(/<\/?strong>/gi, '').trim();
        // Get description from remaining parts, clean up extra <br> tags
        const description = parts.slice(1).join(' ').replace(/<br\s*\/?>/gi, ' ').trim();
        
        const result = {
          title: title,
          description: description,
          tagline: tagline
        };
        console.log('Parsed About Us top content:', result);
        return result;
      }
    }
    
    // Fallback: use entire content as description
    const cleanContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    const result = {
      title: '',
      description: cleanContent,
      tagline: tagline
    };
    console.log('Parsed About Us top content (fallback):', result);
    return result;
  };

  // Parse page content to extract sections
  const parsePageContent = (htmlContent: string) => {
    console.log('Parsing About Us page content:', htmlContent);
    
    const sections: Array<{title: string, content: string}> = [];
    
    // Split by <strong> tags to identify sections
    const parts = htmlContent.split(/<\/?strong>/);
    console.log('Page content parts after splitting:', parts);
    
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        const title = parts[i + 1]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        
        // Get content from the next part and clean it up
        let content = '';
        if (i + 2 < parts.length) {
          content = parts[i + 2]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        console.log(`About Us Section ${Math.floor(i/2)}: Title="${title}", Content="${content}"`);
        
        if (title && content) {
          sections.push({ title, content });
        }
      }
    }
    
    console.log('Parsed About Us sections:', sections);
    return sections;
  };

  // Fetch About Us data from API
  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching About Us from mobile API endpoint...');
        const response = await apiService.getData('get_aboutus');
        console.log('Full About Us API Response:', JSON.stringify(response, null, 2));
        
        if (response && response.status === 'ok' && response.pageData) {
          console.log('About Us Data received:', response.pageData);
          console.log('About Us top_content:', response.pageData.top_content);
          console.log('About Us page_content:', response.pageData.page_content);
          setAboutUsData(response.pageData);
        } else {
          console.log('About Us API endpoint failed:', response);
          setError('Failed to load about us content');
        }
      } catch (err) {
        console.error('Error fetching about us:', err);
        setError('Failed to load about us content');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('More')} 
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Our Mission</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading our mission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !aboutUsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('More')} 
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Our Mission</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load content'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const topContent = parseTopContent(aboutUsData.top_content);
  const pageContentSections = parsePageContent(aboutUsData.page_content);

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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Content Section */}
        {topContent.title && (
          <Text style={styles.topTitle}>{topContent.title}</Text>
        )}
        {topContent.description && (
          <Text style={styles.topDescription}>
            {topContent.description}
          </Text>
        )}
        {topContent.tagline && (
          <Text style={styles.tagline}>{topContent.tagline}</Text>
        )}

        {/* Page Content Sections */}
        {pageContentSections.map((section, index) => (
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
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  topDescription: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  contentCard: {
    backgroundColor: colors.white,
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
  cardBorder: {
    width: 4,
    height: 40,
    backgroundColor: '#8B4513',
    position: 'absolute',
    left: 0,
    top: 20,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
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

export default AboutUsScreen;
