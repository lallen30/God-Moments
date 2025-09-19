import axiosRequest from '../utils/axiosUtils';
import { API } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_avatar?: string;
  access_token: string;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No auth token found');
      }

      const response = await axiosRequest.post(`${API.ENDPOINTS.MOBILEAPI}/getProfile`, {
        token: userToken,
      });

      console.log('Profile API Response:', response);

      if (response.status === 'success' && response.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        return response.data;
      }

      throw new Error(response.message || 'Failed to get profile');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<any> {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }
      
      const userData = JSON.parse(userDataString);
      const token = userData.loginInfo?.token;
      const email = userData.loginInfo?.email;
      
      if (!token || !email) {
        throw new Error('User information not found');
      }

      const formData = {
        old_password: oldPassword,
        password: newPassword,
        token: token,
        email: email
      };

      console.log('Sending password change request:', formData);

      const response = await axiosRequest.post(
        `${API.ENDPOINTS.MOBILEAPI}/updatePassword`,
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Handle both direct response and axios wrapped response
      const apiResponse = response.data || response;
      console.log('API response:', apiResponse);

      // If we have a successful response from the API
      if (apiResponse && (apiResponse.status === 'ok' || apiResponse.status === 'success')) {
        // Password was changed successfully, now try to re-login
        try {
          const loginResponse = await axiosRequest.post(
            API.ENDPOINTS.LOGIN,
            {
              email: email,
              password: newPassword
            },
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );

          console.log('Re-login response:', loginResponse);

          if (loginResponse.data?.loginInfo?.token || loginResponse.loginInfo?.token) {
            const finalLoginData = loginResponse.data || loginResponse;
            await AsyncStorage.setItem('userData', JSON.stringify(finalLoginData));
            return { status: 'ok', message: 'Password changed successfully' };
          }

          // If we get here, login succeeded but didn't return expected data
          return { status: 'ok', message: 'Password changed successfully, please log in again' };
        } catch (loginError) {
          console.error('Re-login error:', loginError);
          // Even if re-login fails, password was changed successfully
          return { status: 'ok', message: 'Password changed successfully, please log in again' };
        }
      }

      // If we get here, the password change failed
      const errorMsg = apiResponse.errormsg || apiResponse.message || 'Failed to change password';
      throw new Error(errorMsg);
    } catch (error: any) {
      console.error('Change password error:', error);
      // If we have a successful response but hit this block, return success
      if (error.response?.data?.status === 'ok' || error.response?.status === 'ok') {
        return { status: 'ok', message: 'Password changed successfully' };
      }
      // Otherwise handle the error
      if (error.response?.data?.errormsg) {
        throw new Error(error.response.data.errormsg);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  }

  async updateProfile(data: {
    first_name: string;
    last_name: string;
    phone: string;
    profile_img?: any;
  }): Promise<any> {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }
      
      const userData = JSON.parse(userDataString);
      const token = userData.loginInfo?.token;
      
      if (!token) {
        throw new Error('User token not found');
      }

      const formData = new FormData();
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('phone', data.phone);
      formData.append('token', token);

      if (data.profile_img) {
        formData.append('profile_img', {
          uri: data.profile_img.uri,
          type: data.profile_img.type,
          name: data.profile_img.fileName || 'profile.jpg',
        });
      }

      const response = await axiosRequest.post(API.ENDPOINTS.UPDATE_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Raw API Response:', response);

      // The response might be wrapped in a data property
      const responseData = response.data || response;

      // Check if we have a successful response
      if (responseData.code === 200 && responseData.status === 'ok') {
        // The API returns the complete updated user data
        return responseData;
      }
      
      // If we have an error message from the API, use it
      if (responseData.errormsg) {
        throw new Error(responseData.errormsg);
      }
      
      throw new Error('Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      // If it's an API error response
      if (error.response?.data?.errormsg) {
        throw new Error(error.response.data.errormsg);
      }
      // If it's our own error message
      if (error.message) {
        throw error;
      }
      // Generic error
      throw new Error('Failed to update profile');
    }
  }
}

export default new UserService();
