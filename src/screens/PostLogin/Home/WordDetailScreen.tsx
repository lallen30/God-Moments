import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';

// Import theme colors for consistency across the app
import { colors } from '../../../theme/colors';

type RootStackParamList = {
  WordDetail: { 
    word: {
      notification_id: number;
      daily_word: string;
      content: string;
      date: string;
      full_date?: string;
      created_at?: string;
      link?: string; // Added link property
    };
    sourceScreen?: string; // Added sourceScreen parameter
  };
};

type WordDetailScreenRouteProp = RouteProp<RootStackParamList, 'WordDetail'>;
type WordDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WordDetail'>;

interface Props {
  route: WordDetailScreenRouteProp;
  navigation: WordDetailScreenNavigationProp;
}

// Helper function to format date as MM-DD-YYYY
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // If date is already in DD-MM-YYYY format, convert it to MM-DD-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      return `${month}-${day}-${year}`;
    }
    
    // For other formats, try to parse as Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    // Format as MM-DD-YYYY
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if error
  }
};

const WordDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { word, sourceScreen } = route.params;
  const [showWebView, setShowWebView] = useState(false);

  const handleBackPress = () => {
    if (sourceScreen === 'DailyWords') {
      navigation.navigate('Daily Words' as never);
    } else {
      navigation.navigate('Home' as never);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress} style={{ marginLeft: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.headerFont} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, sourceScreen]);

  if (!word) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No word data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {showWebView && word.link ? (
        <View style={styles.webviewContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowWebView(false)}
          >
            <Ionicons name="close" size={24} color={colors.headerBg} />
          </TouchableOpacity>
          <WebView
            source={{ uri: word.link }}
            style={styles.webview}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.wordOfTheDayLabel}>WORD OF THE DAY</Text>
          <Text style={styles.dailyWordText}>{word.daily_word}</Text>
          <Text style={styles.wordContent}>{word.content}</Text>
          {word.link && (
            <TouchableOpacity 
              style={styles.learnMoreButton} 
              onPress={() => setShowWebView(true)}
            >
              <Text style={styles.learnMoreButtonText}>OPD</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F0FD',
  },
  scrollViewContent: {
    padding: 16,
  },
  wordOfTheDayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  dailyWordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  wordContent: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  learnMoreButton: {
    backgroundColor: '#B565A7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
  },
  learnMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#E9F0FD',
    alignSelf: 'flex-end',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default WordDetailScreen;
