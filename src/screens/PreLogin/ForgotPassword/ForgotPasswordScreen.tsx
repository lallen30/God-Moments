import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import { styles } from './Styles';
import { environment } from '../../../config/environment';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendEmail = async () => {
    try {
      const response = await axios.post(`${environment.apiURL}/custom/v1/forgotPassword`, {
        email: email
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'OTP sent to your email successfully!');
        setStep(2);
      } else {
        Alert.alert('Error', response.data.errormsg || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.errormsg || 'An error occurred');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${environment.apiURL}/custom/v1/checkOtp`, {
        otp: otp,
        email: email
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'OTP verified successfully!');
        setStep(3);
      } else {
        Alert.alert('Error', response.data.errormsg || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.errormsg || 'An error occurred');
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${environment.apiURL}/custom/v1/updatePassword`, {
        password: password,
        email: email
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Password reset successfully!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.errormsg || 'Failed to reset password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.errormsg || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
        />
      </View>
      
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.backToLoginContainer}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backToLoginText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;
