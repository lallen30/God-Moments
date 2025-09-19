import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './Styles';
import userService from '../../../services/userService';
import { colors } from '../../../theme/colors';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordVisibility {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

const ChangePasswordScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState<PasswordVisibility>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set up the navigation header
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Change Password',
      headerLeft: () => (
        <TouchableOpacity 
          style={{ marginLeft: 10 }}
          onPress={() => navigation.navigate('MyProfile')}
        >
          <Icon style={styles.backButton} name="chevron-back" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Login');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Please enter your current password and choose a new password</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.currentPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, currentPassword: text });
                if (errors.currentPassword) {
                  setErrors({ ...errors, currentPassword: '' });
                }
              }}
              placeholder="Enter current password"
              placeholderTextColor={colors.dark}
              secureTextEntry={!showPassword.currentPassword}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('currentPassword')}>
              <Icon 
                name={showPassword.currentPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.currentPassword && (
            <Text style={styles.errorText}>{errors.currentPassword}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.newPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, newPassword: text });
                if (errors.newPassword) {
                  setErrors({ ...errors, newPassword: '' });
                }
              }}
              placeholder="Enter new password"
              placeholderTextColor={colors.dark}
              secureTextEntry={!showPassword.newPassword}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('newPassword')}>
              <Icon 
                name={showPassword.newPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.newPassword && (
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              placeholder="Confirm new password"
              placeholderTextColor={colors.dark}
              secureTextEntry={!showPassword.confirmPassword}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('confirmPassword')}>
              <Icon 
                name={showPassword.confirmPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ChangePasswordScreen;
