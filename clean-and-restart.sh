#!/bin/bash

# Script to clean and restart the React Native app

echo "Cleaning and restarting React Native app..."

# Stop Metro if running
echo "Stopping Metro bundler..."
pkill -f "node.*metro" || true

# Clean watchman watches
echo "Cleaning Watchman watches..."
watchman watch-del-all || true

# Clean node modules
echo "Cleaning node_modules..."
rm -rf node_modules

# Clean iOS build
echo "Cleaning iOS build..."
cd ios
xcodebuild clean -workspace LAReactNative.xcworkspace -scheme LAReactNative || true
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
cd ..

# Clean Android build
echo "Cleaning Android build..."
cd android
./gradlew clean || true
cd ..

# Clean React Native caches
echo "Cleaning React Native caches..."
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Reinstall pods
echo "Reinstalling pods..."
cd ios
pod install --repo-update
cd ..

# Start Metro bundler
echo "Starting Metro bundler..."
npx react-native start --reset-cache
