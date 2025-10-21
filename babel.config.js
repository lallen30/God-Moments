module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    // Strip only noisy console calls but keep logs needed for diagnostics
    ['transform-remove-console', { exclude: ['error', 'warn', 'info', 'log'] }],
  ],
  env: {
    production: {
      plugins: [
        'react-native-reanimated/plugin',
        ['transform-remove-console', { exclude: ['error', 'warn', 'info', 'log'] }],
      ],
    },
  },
};
