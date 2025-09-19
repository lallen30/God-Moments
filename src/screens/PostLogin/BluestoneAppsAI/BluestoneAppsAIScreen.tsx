import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from './Styles';
import axiosRequest from '../../../utils/axiosUtils';
import { API } from '../../../config/apiConfig';
import HTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const defaultSystemFonts = [
  'Arial',
  'Helvetica',
  'Helvetica Neue',
  'System',
  '-apple-system',
  'sans-serif',
];

const renderersProps = {
  img: {
    enableExperimentalPercentWidth: true,
  },
};

const BluestoneAppsAIScreen = ({ navigation }: any) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [question, setQuestion] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [aiWelcomeMessage, setAiWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    getAIWelcome();
  }, []);

  const getAIWelcome = async () => {
    try {
      console.log('Fetching AI welcome message...');
      const response = await axiosRequest.get(
        `${API.ENDPOINTS.MOBILEAPI}/${API.ENDPOINTS.GET_AI_WELCOME}`
      );
      
      console.log('AI Welcome Response:', response?.data);
      if (response?.data?.status === "success") {
        console.log('Setting welcome message:', response.data.message);
        setAiWelcomeMessage(response.data.message);
      } else {
        console.log('No success status in response');
        setAiWelcomeMessage('Welcome to Bluestone AI! How can I help you today?');
      }
    } catch (error) {
      console.error('Error getting AI welcome message:', error);
      setAiWelcomeMessage('Welcome to Bluestone AI! How can I help you today?');
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting question to ask_bluestoneai endpoint...');
      const response = await axiosRequest.post(
        `${API.ENDPOINTS.MOBILEAPI}/${API.ENDPOINTS.ASK_BLUESTONEAI}`,
        { question: question.trim() }
      );

      console.log('Question response:', response?.data);

      if (response?.data?.reply) {
        setReplyContent(response.data.reply);
        setShowWelcomeMessage(false);
        setQuestion('');
      } else {
        console.error('No reply in response');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHtmlContent = (content: string) => {
    if (!content) return null;

    return (
      <HTML 
        source={{ html: content }} 
        contentWidth={width - 64}
        systemFonts={defaultSystemFonts}
        renderersProps={renderersProps}
        baseStyle={styles.htmlContent}
        tagsStyles={{
          p: styles.paragraph,
          h1: styles.heading1,
          h2: styles.heading2,
          body: { color: '#333' },
        }}
        enableExperimentalBRCollapsing
        enableExperimentalGhostLinesPrevention
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {showWelcomeMessage ? (
          <View style={styles.messageContainer}>
            {aiWelcomeMessage ? (
              renderHtmlContent(aiWelcomeMessage)
            ) : (
              <Text style={styles.loadingText}>Loading welcome message...</Text>
            )}
          </View>
        ) : null}

        {replyContent ? (
          <View style={styles.messageContainer}>
            {renderHtmlContent(replyContent)}
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask a question"
            multiline
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitQuestion}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default BluestoneAppsAIScreen;
