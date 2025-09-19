#!/bin/bash

# Script to help debug extreme issues with React Native

echo "Extreme Debugging for React Native"
echo "=================================="

# Stop any running processes
echo "Stopping any running processes..."
pkill -f "node.*metro" || true
killall node || true

# Clean watchman
echo "Cleaning watchman..."
watchman watch-del-all || true

# Clean temp files
echo "Cleaning temporary files..."
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true

# Clean build folders
echo "Cleaning build folders..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
xcodebuild clean -workspace LAReactNative.xcworkspace -scheme LAReactNative || true
cd ..

# Switch to super simple app
echo "Switching to super simple app..."
./switch-app-version.sh super-simple

# Reinstall pods
echo "Reinstalling pods..."
cd ios
pod deintegrate || true
pod install --repo-update
cd ..

# Start Metro with clean cache
echo "Starting Metro bundler with clean cache..."
npx react-native start --reset-cache --port 8085 &
METRO_PID=$!

# Wait for Metro to start
echo "Waiting for Metro to start..."
sleep 10

# Run the app
echo "Running the app..."
npx react-native run-ios --port 8085

# Wait for user input
read -p "Press Enter to stop Metro bundler..." INPUT

# Kill Metro
kill $METRO_PID || true

echo "Extreme debugging complete!"
