module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    // Add a plugin to suppress specific React warnings
    ['transform-remove-console', { exclude: ['error', 'info', 'log'] }],
  ],
  env: {
    production: {
      plugins: [
        'react-native-reanimated/plugin',
        'transform-remove-console',
      ],
    },
  },
};
