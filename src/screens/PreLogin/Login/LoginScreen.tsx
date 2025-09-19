import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './Styles';
import authService from '../../../services/authService';
import { AuthError, LoginResponse } from '../../../config/types';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  DrawerNavigator: undefined;
  ForgotPassword: undefined;
  SignUp: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkPreviousLogin();
  }, []);

  const checkPreviousLogin = async () => {
    try {
      const rememberMeStatus = await AsyncStorage.getItem('rememberMe');
      if (rememberMeStatus === 'true') {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');
        const userData = await AsyncStorage.getItem('userData');

        if (savedEmail && savedPassword && userData) {
          // If we have all the necessary data and Remember Me is true,
          // automatically navigate to DrawerNavigator
          navigation.replace('DrawerNavigator');
        } else {
          // If we're missing any data, clear everything to ensure a fresh state
          await AsyncStorage.removeItem('rememberMe');
          await AsyncStorage.removeItem('userEmail');
          await AsyncStorage.removeItem('userPassword');
          await AsyncStorage.removeItem('userData');
        }
      }
    } catch (error) {
      console.error('Error checking previous login:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      console.log('Attempting login with:', { email: trimmedEmail });

      const response = await authService.login(trimmedEmail, password);
    
    // Check for both response structures to handle both Laravel and WordPress backends
    const loginInfo = response?.loginInfo || response?.data?.loginInfo;
    
    if (loginInfo?.token) {
      await AsyncStorage.setItem('rememberMe', rememberMe.toString());
      // Store user credentials if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', trimmedEmail);
        await AsyncStorage.setItem('userPassword', password);
      } else {
        // Clear stored credentials if remember me is unchecked
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userPassword');
      }
      // Store data in the correct format expected by the profile screen
      const userData = { loginInfo };
      console.log('Storing userData:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('Login successful, navigating to DrawerNavigator');
      navigation.replace('DrawerNavigator');
      } else {
        console.log('No token in response:', response);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error:', authError);
      Alert.alert(
        'Error',
        authError.response?.data?.message?.replace(/<[^>]*>/g, '') || 
        authError.response?.data?.errormsg || 
        'An error occurred during login. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#2c3e50"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase().trim())}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { marginBottom: 0, color: '#2c3e50' }]}
            placeholder="Password"
            placeholderTextColor="#2c3e50"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#2c3e50"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.customCheckbox, rememberMe && styles.customCheckboxChecked]}
            onPress={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && (
              <Icon name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
