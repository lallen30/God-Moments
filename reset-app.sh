#!/bin/bash

# Script to completely reset the React Native app

echo "Completely resetting the React Native app"
echo "========================================"

# Stop any running processes
echo "Stopping any running processes..."
pkill -f "node.*metro" || true
killall node || true
killall "Simulator" || true

# Clean watchman
echo "Cleaning watchman..."
watchman watch-del-all || true

# Clean temp files
echo "Cleaning temporary files..."
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true

# Clean node modules
echo "Cleaning node modules..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

# Clean iOS build
echo "Cleaning iOS build..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
xcodebuild clean -workspace LAReactNative.xcworkspace -scheme LAReactNative || true
cd ..

# Clean Android build
echo "Cleaning Android build..."
cd android
./gradlew clean || true
rm -rf build
rm -rf app/build
cd ..

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Reinstall pods
echo "Reinstalling pods..."
cd ios
pod install --repo-update
cd ..

# Create minimal app
echo "Creating minimal app..."
cat > MinimalApp.js << 'EOL'
import React from 'react';
import {SafeAreaView, Text, StyleSheet} from 'react-native';

const MinimalApp = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Hello, World!</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default MinimalApp;
EOL

# Update index.js
echo "Updating index.js..."
cat > index.js << 'EOL'
/**
 * @format
 */

// Absolute minimal setup
import {AppRegistry} from 'react-native';
import MinimalApp from './MinimalApp';
import {name as appName} from './app.json';

// Register the minimal app component
AppRegistry.registerComponent(appName, () => MinimalApp);
EOL

echo "App reset complete!"
echo "Run the following commands to start the app:"
echo "npx react-native start --reset-cache"
echo "npx react-native run-ios"
