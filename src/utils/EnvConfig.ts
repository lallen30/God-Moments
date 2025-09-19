import Config from 'react-native-config';

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = ['ONESIGNAL_APP_ID', 'ONESIGNAL_REST_API_KEY'];
  const missingVars = requiredVars.filter(varName => !Config[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

// Export environment variables with validation
export const EnvConfig = {
  ONESIGNAL_APP_ID: Config.ONESIGNAL_APP_ID || '',
  ONESIGNAL_REST_API_KEY: Config.ONESIGNAL_REST_API_KEY || '',
  IS_CONFIGURED: validateEnvVars(),
};

export default EnvConfig;
