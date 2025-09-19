import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './Styles';
import userService from '../../../services/userService';

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

const EditProfileScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');

  useEffect(() => {
    // Set up the navigation header
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Edit Profile',
      headerLeft: () => (
        <TouchableOpacity 
          style={{ marginLeft: 10 }}
          onPress={() => navigation.navigate('MyProfile')}
        >
          <Icon style={styles.backButton} name="chevron-back" size={24} />
        </TouchableOpacity>
      ),
    });
    
    loadUserData();
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const { loginInfo } = userData;
        setFormData({
          first_name: loginInfo.first_name || '',
          last_name: loginInfo.last_name || '',
          phone: loginInfo.phone || '',
          email: loginInfo.email || '',
        });
        setCurrentAvatar(loginInfo.user_avatar || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }
      if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0]);
      }
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        profile_img: profileImage,
      });

      // The response is already successful if we reach this point
      // Store the updated user data
      await AsyncStorage.setItem('userData', JSON.stringify(response));
      Alert.alert('Success', 'Profile updated successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            if (navigation) {
              navigation.navigate('MyProfile');
            }
          }
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
          {profileImage ? (
            <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
          ) : currentAvatar ? (
            <Image source={{ uri: currentAvatar }} style={styles.profileImage} />
          ) : (
            <Image
              source={require('../../../assets/images/default_profile_pic.png')}
              style={styles.profileImage}
            />
          )}
          <View style={styles.cameraIconContainer}>
            <Icon name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              value={formData.first_name}
              onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            />
          </View>
          {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />
          </View>
          {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#666' }]}
              value={formData.email}
              editable={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
