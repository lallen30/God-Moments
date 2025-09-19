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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../../config/apiConfig';
import axiosRequest from '../../../utils/axiosUtils';
import { styles } from './Styles';
import { colors } from '../../../theme/colors';

const ContactScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
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
          setPhone(userData.userData.phone || '');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!name || !email || !subject || !message) {
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
      if (phone) params.append('phone', phone.trim());
      params.append('subject', subject.trim());
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
        setPhone('');
        setSubject('');
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
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.dark}
                returnKeyType="next"
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.dark}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.dark}
                keyboardType="phone-pad"
                returnKeyType="next"
              />

              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter subject"
                placeholderTextColor={colors.dark}
                returnKeyType="next"
              />

              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Enter a brief message"
                placeholderTextColor={colors.dark}
                multiline
                numberOfLines={4}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </ScrollView>

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
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContactScreen;
