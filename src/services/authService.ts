import axiosRequest from '../utils/axiosUtils';
import {API} from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, AuthError } from '../config/types';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', { email });

      const data = {
        email: email.trim(),
        password: password
      };

      console.log('Making request to:', API.ENDPOINTS.LOGIN, 'with data:', data);

      const response = await axiosRequest.post<LoginResponse>(
        API.ENDPOINTS.LOGIN,
        data
      );

      console.log('Login response:', response);

      if (response?.loginInfo?.token) {
        await AsyncStorage.setItem('userToken', response.loginInfo.token);
        // Store data in the correct format expected by the profile screen
        const userData = { loginInfo: response.loginInfo };
        console.log('Storing userData in AuthService:', userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error as AuthError;
    }
  }

  async logout(): Promise<void> {
    try {
      // Try to remove items individually first
      const keys = ['userToken', 'userData', 'rememberMe'];
      
      for (const key of keys) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (err) {
          console.warn(`Error removing ${key}:`, err);
          // Continue with other keys even if one fails
        }
      }
      
      // If we're still here, try to perform any navigation or state resets
      return;
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw the error, just log it and continue
      // This prevents the error from bubbling up to the UI
      return;
    }
  }

  // Add other auth-related methods here
}

export default new AuthService();
