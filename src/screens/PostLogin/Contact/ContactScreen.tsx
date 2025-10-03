import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { API } from '../../../config/apiConfig';
import axiosRequest from '../../../utils/axiosUtils';
import { colors } from '../../../theme/colors';
import { styles } from './Styles';

const ContactScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.userData) {
          setName(userData.userData.display_name || '');
          setEmail(userData.userData.user_email || '');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const userData = await AsyncStorage.getItem('userData');
      const token = userData ? JSON.parse(userData).token : null;
      
      // Create URL-encoded form data
      const params = new URLSearchParams();
      params.append('name', name.trim());
      params.append('email', email.trim());
      params.append('subject', 'Contact Form Message'); // Default subject
      params.append('message', message.trim());

      const response = await axiosRequest.post(`${API.ENDPOINTS.MOBILEAPI}/contact_us`, 
        params.toString(),
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        }
      );

      if (response?.data?.success) {
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
        
        // Show success and navigate
        Alert.alert(
          'Success',
          response.data.message || 'Your message has been sent successfully.',
          [{
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
            style: 'default'
          }]
        );
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact submission error:', error.message);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <Text style={styles.sectionTitle}>Send us a message</Text>
          
          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Smith"
              placeholderTextColor="#999"
              returnKeyType="next"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Your message"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        </ScrollView>

        {/* Button and Footer */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit();
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Image source={require('../../../assets/images/footer-icon.png')} style={styles.footerIcon} resizeMode="contain" />
            <Text style={styles.footerTitle}>God Moments</Text>
            <Text style={styles.footerSubtitle}>Made with ♡ for your spiritual journey</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContactScreen;
