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
  ImageBackground,
  Dimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';

const { width, height } = Dimensions.get('window');

interface OurMissionScreenProps {
  navigation: any;
}

interface MissionData {
  id: number;
  page_name: string;
  page_title: string;
  top_content: string;
  page_content: string;
  page_url: string;
  created_at: string;
  updated_at: string;
}

const OurMissionScreen: React.FC<OurMissionScreenProps> = ({ navigation }) => {
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse HTML content to extract text and structure
  const parseHtmlContent = (htmlContent: string) => {
    console.log('Parsing Mission HTML content:', htmlContent);
    
    const sections: Array<{title: string, content: string}> = [];
    
    // Split by <strong> tags to identify sections
    const parts = htmlContent.split(/<\/?strong>/);
    console.log('Mission HTML parts after splitting:', parts);
    
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        const title = parts[i + 1]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        
        // Get content from the next part and clean it up
        let content = '';
        if (i + 2 < parts.length) {
          content = parts[i + 2]?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        console.log(`Mission Section ${Math.floor(i/2)}: Title="${title}", Content="${content}"`);
        
        if (title && content) {
          sections.push({ title, content });
        }
      }
    }
    
    console.log('Parsed mission sections:', sections);
    return sections;
  };

  // Parse top content with proper strong tag and blockquote handling
  const parseTopContent = (htmlContent: string) => {
    console.log('Parsing mission top content:', htmlContent);
    
    // Extract blockquote content first
    const blockquoteMatch = htmlContent.match(/<blockquote>(.*?)<\/blockquote>/);
    const tagline = blockquoteMatch ? blockquoteMatch[1].trim() : '';
    
    // Remove blockquote from content for further processing
    const contentWithoutBlockquote = htmlContent.replace(/<blockquote>.*?<\/blockquote>/g, '');
    
    // Split content by div tags
    const divs = contentWithoutBlockquote.split(/<\/?div[^>]*>/);
    const cleanDivs = divs.filter(div => div.trim()).map(div => div.trim()).filter(div => div);
    
    console.log('Mission content divs:', cleanDivs);
    
    // Parse the content to separate strong tags from regular text
    const parsedContent: Array<{type: 'strong' | 'text', content: string}> = [];
    
    cleanDivs.forEach(div => {
      if (div.includes('<strong>') && div.includes('</strong>')) {
        // Split by strong tags
        const parts = div.split(/<\/?strong>/);
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
          if (part) {
            if (i % 2 === 1) {
              // This is content inside strong tags
              parsedContent.push({ type: 'strong', content: part });
            } else {
              // This is regular text
              parsedContent.push({ type: 'text', content: part });
            }
          }
        }
      } else {
        // Regular text content
        const cleanText = div.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (cleanText) {
          parsedContent.push({ type: 'text', content: cleanText });
        }
      }
    });
    
    console.log('Parsed mission top content:', { parsedContent, tagline });
    return { parsedContent, tagline };
  };

  // Simulate API data (in real app, this would be an API call)
  useEffect(() => {
    const loadMissionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API response with the provided data
        const simulatedData: MissionData = {
          id: 1,
          page_name: 'our_mission',
          page_title: 'Our Mission',
          top_content: '<div><strong>About God Moments</strong><br><br>Our app is a simple way to awaken you to the presence of God before you. Twice each day, at random times, your phone will gently chime with a bell and display a short scripture verse, inviting you to pause for a sacred moment of gratitude and prayer.<br><br></div><blockquote>Stop. Breathe. Give thanks.</blockquote>',
          page_content: '<div><strong>Our Mission</strong><br><br>We are a ministry of evangelization offered by the Vincentian priests and brothers of St. Vincent de Paul. If you\'re seeking a deeper prayer experience, discover our companion app, The God Minute—a 10-minute daily prayer that weaves together music, scripture, and reflection.</div>',
          page_url: 'our-mission',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setMissionData(simulatedData);
      } catch (err) {
        console.error('Error loading mission data:', err);
        setError('Failed to load mission content');
      } finally {
        setLoading(false);
      }
    };

    loadMissionData();
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
          <Text style={styles.loadingText}>Loading mission content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !missionData) {
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
          <Text style={styles.errorText}>{error || 'Failed to load mission content'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const topContent = parseTopContent(missionData.top_content);
  const contentSections = parseHtmlContent(missionData.page_content);

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
        source={require('../../../assets/images/vincent.png')}
        style={styles.heroSection}
        resizeMode="cover"
      >

      </ImageBackground>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Content Sections */}
        {contentSections.map((section, index) => (
          <View key={index} style={styles.contentCard}>
            <View style={styles.cardBorder} />
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.content}</Text>
          </View>
        ))}

        {/* God Minute Button */}
        <TouchableOpacity 
          style={styles.godMinuteButton}
          onPress={() => Linking.openURL('https://www.thegodminute.org/')}
          activeOpacity={0.8}
        >
          <Text style={styles.godMinuteButtonText}>Visit The God Minute</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Image source={require('../../../assets/images/footer-icon.png')} style={styles.footerIcon} resizeMode="contain" />
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
  heroSection: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.medium,
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
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  topContentContainer: {
    marginBottom: 20,
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
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  blockquote: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Newsreader',
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingVertical: 16
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
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 30,
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
  godMinuteButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  godMinuteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default OurMissionScreen;
