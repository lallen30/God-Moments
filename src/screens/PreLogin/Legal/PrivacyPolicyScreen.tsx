import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../theme/colors';
import { API } from '../../../config/apiConfig';
import { NavigationMonitorService } from '../../../services/NavigationMonitorService';
import axiosRequest from '../../../utils/axiosUtils';
import HTML from 'react-native-render-html';

interface PrivacyResponse {
  status: number;
  privacy_page: Array<{
    post_title: string;
    post_content: string;
  }>;
}

const PrivacyPolicyScreen = ({ navigation, route }: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const fromUpdate = route.params?.fromUpdate || false;
  useEffect(() => {
    fetchPrivacyContent();
  }, []);

  const fetchPrivacyContent = async () => {
    try {
      const response = await axiosRequest.get<PrivacyResponse>(`${API.BASE_URL}/${API.ENDPOINTS.GET_PRIVACY_PAGE}`);
      
      if (response.data?.privacy_page?.[0]) {
        setTitle(response.data.privacy_page[0].post_title);
        setContent(response.data.privacy_page[0].post_content);
      } else {
        setError('No privacy policy content found');
      }
    } catch (err) {
      setError('Failed to load privacy policy content');
      console.error('Error fetching privacy policy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await NavigationMonitorService.storeAcceptanceDate('privacy');
      
      if (fromUpdate) {
        navigation.goBack();
      }
    } catch (err) {
      console.error('Error saving acceptance date:', err);
      Alert.alert('Error', 'Failed to save your acceptance. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPrivacyContent}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'Privacy Policy'}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <HTML source={{ html: content }} contentWidth={300} />
        </View>
      </ScrollView>
      {fromUpdate && (
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept Privacy Policy</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: colors.primary,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary,
    marginBottom: 15,
  },
});

export default PrivacyPolicyScreen;
