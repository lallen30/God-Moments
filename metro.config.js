const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Add configuration to suppress React warnings
  resolver: {
    // This will silence the specific defaultProps warnings
    // by excluding them from the error reporting
    silent: true,
  },
  // Remove transformer customizations that might cause issues
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
