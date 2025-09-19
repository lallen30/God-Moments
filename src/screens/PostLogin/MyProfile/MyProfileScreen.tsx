import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './Styles';

interface UserProfile {
  loginInfo: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_avatar?: string;
    display_name: string;
    city_state?: string;
  };
}

const MyProfileScreen = ({ navigation }: any) => {
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting to load user data...');
      
      // Clear AsyncStorage for testing
      // await AsyncStorage.clear();
      
      const userDataString = await AsyncStorage.getItem('userData');
      console.log('Raw userData from AsyncStorage:', userDataString);
      
      if (!userDataString) {
        console.log('No userData found in AsyncStorage');
        setUserInfo(null);
        return;
      }

      const userData = JSON.parse(userDataString);
      console.log('Parsed userData:', userData);
      console.log('userData.loginInfo:', userData.loginInfo);
      
      if (userData.loginInfo) {
        console.log('first_name:', userData.loginInfo.first_name);
        console.log('last_name:', userData.loginInfo.last_name);
        console.log('display_name:', userData.loginInfo.display_name);
        console.log('user_avatar:', userData.loginInfo.user_avatar);
      }

      // Ensure the data has the expected structure
      if (!userData?.loginInfo) {
        console.error('Invalid user data structure:', userData);
        setUserInfo(null);
        return;
      }

      console.log('Setting valid user data:', userData);
      setUserInfo(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );
  
  const clearStorageAndLogout = async () => {
    try {
      console.log('Clearing AsyncStorage and logging out...');
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!userInfo?.loginInfo) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  const { loginInfo } = userInfo;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {loginInfo.user_avatar ? (
            <Image source={{ uri: loginInfo.user_avatar }} style={styles.profileImage} />
          ) : (
            <Image 
              source={require('../../../assets/images/default_profile_pic.png')} 
              style={styles.profileImage}
            />
          )}
        </View>
        <Text style={styles.name}>{loginInfo.display_name}</Text>
        {loginInfo.city_state && (
          <Text style={styles.location}>{loginInfo.city_state}</Text>
        )}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Icon name="person-outline" size={24} color="#666" style={styles.icon} />
          <View>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>
              {`${loginInfo.first_name} ${loginInfo.last_name}`}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Icon name="call-outline" size={24} color="#666" style={styles.icon} />
          <View>
            <Text style={styles.label}>Mobile Number</Text>
            <Text style={styles.value}>{loginInfo.phone || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Icon name="mail-outline" size={24} color="#666" style={styles.icon} />
          <View>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{loginInfo.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.buttonText}>Edit Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Change Password</Text>
        </TouchableOpacity>
        
        {/* Debug button to clear storage and force re-login */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ff6347', marginTop: 10 }]}
          onPress={clearStorageAndLogout}
        >
          <Text style={styles.buttonText}>Debug: Clear Storage & Re-Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MyProfileScreen;
