import { environment } from './environment';

interface AppConstType {
  APP_NAME: string;
  VERSION: string;
}

interface APIEndpoints {
  LOGIN: string;
  MOBILEAPI: string;
  GET_PROFILE: string;
  UPDATE_PROFILE: string;
  CHANGE_PASSWORD: string;
  GET_ABOUTUS: string;
  DELETE_USER: string;
  VERIFY_EMAIL_OTP: string;
  REGISTER: string;
  GET_EVENTS: string;
  GET_AI_API_URL: string;
  GET_AI_WELCOME: string;
  SAVE_AI_QNA: string;
  ASK_BLUESTONEAI: string;
  GET_AI_CREDENTIALS: string;
  GET_TERMS_DATE: string;
  GET_PRIVACY_DATE: string;
  GET_TERMS_PAGE: string;
  GET_PRIVACY_PAGE: string;
  APP_VERSION: string;
}

interface APIConfig {
  BASE_URL: string;
  ENDPOINTS: APIEndpoints;
}

export const AppConst: AppConstType = {
  APP_NAME: 'LA React Native',
  VERSION: '1.5.0',
};

// Import the BackendType type from environment
type BackendType = 'wordpress' | 'laravel';

// Define backend-specific endpoints
const wordpressEndpoints = {
  // WordPress uses the wp-json prefix for all endpoints
  LOGIN: 'jwt-auth/v1/token',
  MOBILEAPI: 'mobileapi/v1',
  GET_PROFILE: 'mobileapi/v1/getProfile',
  UPDATE_PROFILE: 'mobileapi/v1/updateProfile',
  GET_EVENTS: 'mobileapi/v1/getEvents',
  GET_TERMS_DATE: 'mobileapi/v1/getTermsPublishedDate',
  GET_PRIVACY_DATE: 'mobileapi/v1/getPrivacyPublishedDate',
  GET_TERMS_PAGE: 'mobileapi/v1/getTermsPage',
  GET_PRIVACY_PAGE: 'mobileapi/v1/getPrivacyPage',
  GET_ABOUTUS: 'mobileapi/v1/get_aboutus',
  APP_VERSION: 'mobileapi/v1/app_version',
  GET_AI_WELCOME: 'mobileapi/v1/get_ai_welcome',
  ASK_BLUESTONEAI: 'mobileapi/v1/ask_bluestoneai',
  VERIFY_EMAIL_OTP: 'mobileapi/v1/verifyemail_and_send_otp',
  REGISTER: 'mobileapi/v1/register',
  DELETE_USER: 'mobileapi/v1/delete_user',
  CHANGE_PASSWORD: 'mobileapi/v1/updatePassword'
};

const laravelEndpoints = {
  // Laravel uses the api prefix for all endpoints
  LOGIN: 'jwt-auth/v1/token',
  MOBILEAPI: 'mobileapi/v1',
  GET_PROFILE: 'mobileapi/v1/getProfile',
  UPDATE_PROFILE: 'mobileapi/v1/updateProfile',
  GET_EVENTS: 'mobileapi/v1/getEvents',
  GET_TERMS_DATE: 'mobileapi/v1/getTermsPublishedDate',
  GET_PRIVACY_DATE: 'mobileapi/v1/getPrivacyPublishedDate',
  GET_TERMS_PAGE: 'mobileapi/v1/getTermsPage',
  GET_PRIVACY_PAGE: 'mobileapi/v1/getPrivacyPage',
  GET_ABOUTUS: 'mobileapi/v1/get_aboutus',
  APP_VERSION: 'mobileapi/v1/app_version',
  GET_AI_WELCOME: 'mobileapi/v1/get_ai_welcome',
  ASK_BLUESTONEAI: 'mobileapi/v1/ask_bluestoneai',
  VERIFY_EMAIL_OTP: 'mobileapi/v1/verifyemail_and_send_otp',
  REGISTER: 'mobileapi/v1/register',
  DELETE_USER: 'mobileapi/v1/delete_user',
  CHANGE_PASSWORD: 'mobileapi/v1/updatePassword'
};

// Define a type for the endpoints that includes all possible keys
type EndpointConfig = typeof laravelEndpoints;

// Create an endpoints map
const endpointsMap: Record<BackendType, EndpointConfig> = {
  wordpress: wordpressEndpoints,
  laravel: laravelEndpoints
};

// Helper function to get the correct endpoint based on backend type
function getEndpoint(key: keyof EndpointConfig): string {
  return endpointsMap[environment.backendType][key];
}

// Select the appropriate endpoints based on backend type
const activeEndpoints = endpointsMap[environment.backendType];

// Helper function to construct full endpoint paths
function constructEndpoint(path: string): string {
  // For Laravel backend, ensure we're using the correct API path structure
  if (environment.backendType === 'laravel') {
    return `api/${path}`;
  }
  // For WordPress backend
  return path;
}

export const API: APIConfig = {
  BASE_URL: environment.apiURL,
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: getEndpoint('LOGIN'),
    MOBILEAPI: getEndpoint('MOBILEAPI'),
    GET_PROFILE: getEndpoint('GET_PROFILE'),
    UPDATE_PROFILE: getEndpoint('UPDATE_PROFILE'),
    CHANGE_PASSWORD: getEndpoint('CHANGE_PASSWORD'),
    
    // User management
    DELETE_USER: getEndpoint('DELETE_USER'),
    VERIFY_EMAIL_OTP: getEndpoint('VERIFY_EMAIL_OTP'),
    REGISTER: getEndpoint('REGISTER'),
    
    // Mobile API endpoints
    GET_EVENTS: getEndpoint('GET_EVENTS'),
    
    // AI-related endpoints
    GET_AI_WELCOME: getEndpoint('GET_AI_WELCOME'),
    ASK_BLUESTONEAI: getEndpoint('ASK_BLUESTONEAI'),
    
    // About Us endpoint - use simple path like in the working version
    GET_ABOUTUS: 'get_aboutus',
    
    // Legacy endpoints that may still be used
    GET_AI_API_URL: constructEndpoint('get_ai_api_url'),
    SAVE_AI_QNA: constructEndpoint('save_ai_qna'),
    GET_AI_CREDENTIALS: constructEndpoint('get_ai_credentials'),
    
    // Content endpoints
    GET_TERMS_DATE: getEndpoint('GET_TERMS_DATE'),
    GET_PRIVACY_DATE: getEndpoint('GET_PRIVACY_DATE'),
    GET_TERMS_PAGE: getEndpoint('GET_TERMS_PAGE'),
    GET_PRIVACY_PAGE: getEndpoint('GET_PRIVACY_PAGE'),
    APP_VERSION: getEndpoint('APP_VERSION')
  }
};
