import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { styles } from './Styles.ts';
import { API } from '../../../config/apiConfig';
import { colors } from '../../../theme/colors';

const SignUpScreen = ({ navigation }: any) => {
  console.log('SignUpScreen rendered');

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Name validation
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        `${API.BASE_URL}${API.ENDPOINTS.MOBILEAPI}/verifyemail_and_send_otp`,
        {
          ...formData,
          emailVerification: 'pending',
          acceptTermsConditions: acceptTerms,
        }
      );

      if (response.data.status === 'ok') {
        Alert.alert('Success', response.data.msg);
        navigation.navigate('VerifyEmail', {
          registerData: formData,
          otp: response.data.otp,
        });
      } else {
        Alert.alert('Error', response.data.msg || 'Registration failed');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.msg || 'An error occurred during registration'
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#2c3e50"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#2c3e50"
          value={formData.first_name}
          onChangeText={(text) => setFormData({ ...formData, first_name: text })}
        />
        {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#2c3e50"
          value={formData.last_name}
          onChangeText={(text) => setFormData({ ...formData, last_name: text })}
        />
        {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#2c3e50"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#2c3e50"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.customCheckbox, acceptTerms && styles.customCheckboxChecked]}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            {acceptTerms && (
              <Icon name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I accept the{' '}
            <Text 
              style={[styles.checkboxLabel, styles.link]}
              onPress={() => navigation.navigate('TermsAndConditions')}
            >
              Terms and Conditions
            </Text>
            {' '}and{' '}
            <Text 
              style={[styles.checkboxLabel, styles.link]}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUpScreen;
