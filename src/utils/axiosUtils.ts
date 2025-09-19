import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../config/apiConfig';

const axiosRequest = axios.create({
  baseURL: API.BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  transformRequest: [(data, headers) => {
    // Don't transform FormData
    if (data instanceof FormData) {
      return data;
    }
    
    // Check if the Content-Type is set to JSON
    if (headers['Content-Type'] === 'application/json') {
      // Return JSON string for JSON content type
      return data ? JSON.stringify(data) : data;
    }
    
    // For form-urlencoded content type
    if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && data && typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    }
    
    return data;
  }]
});

// Request interceptor
axiosRequest.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    console.log('Request method:', config.method);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosRequest.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosRequest;
