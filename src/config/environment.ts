// Backend type selector - change this to switch between backends
// Options: 'wordpress' or 'laravel'
import { BackendType } from './types';
export const backendType: BackendType = 'laravel';
// export const backendType: BackendType = 'wordpress';

// Define a common interface for both configurations
interface ServerConfig { 
  serverHost: string;
  serverProtocol: string;
  serverPath: string;
  apiPath: string;
}

// WordPress configuration
const wordpressConfig: ServerConfig = {
  serverHost: 'app.godmoments.info',
  serverProtocol: 'https',
  serverPath: '/',
  apiPath: 'wp-json'
};

// Laravel configuration
// Local development server - localhost works for iOS Simulator
// Physical device: use Mac's IP address (192.168.0.100:8000)
const laravelConfig: ServerConfig = {
  serverHost: 'app.godmoments.info',
  serverProtocol: 'https',
  serverPath: '/',
  apiPath: 'api'
};

// Create a configuration map
const configMap: Record<BackendType, ServerConfig> = {
  wordpress: wordpressConfig,
  laravel: laravelConfig
};

// Select the active configuration based on backend type
const activeConfig = configMap[backendType];

// Construct the server URLs
const serverUrl = `${activeConfig.serverHost}${activeConfig.serverPath}`;
const fullServerUrl = `${activeConfig.serverProtocol}://${serverUrl}`;
const apiUrl = `${fullServerUrl}${activeConfig.apiPath}/`;

export const environment = {
  production: false,
  
  // Current configuration using variables
  server: serverUrl,
  baseURL: fullServerUrl,
  apiURL: apiUrl,
  serverProtocol: activeConfig.serverProtocol,
  
  // Backend type for reference in other files
  backendType: backendType,
  
  // API paths based on backend type
  apiPath: activeConfig.apiPath
};
