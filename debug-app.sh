#!/bin/bash

# Script to help debug React Native app issues

echo "React Native App Debugging Helper"
echo "================================="

# Check if Metro is running
if pgrep -f "node.*metro" > /dev/null; then
  echo "✅ Metro bundler is running"
else
  echo "❌ Metro bundler is NOT running"
  echo "   Run: npx react-native start --reset-cache"
fi

# Check if the app is installed on the simulator
if xcrun simctl list apps | grep -q "org.reactjs.native.example.LAReactNative"; then
  echo "✅ App is installed on simulator"
else
  echo "❌ App is NOT installed on simulator"
  echo "   Run: npx react-native run-ios"
fi

# Check for common issues
echo -e "\nChecking for common issues:"

# Check for node_modules
if [ -d "node_modules" ]; then
  echo "✅ node_modules directory exists"
else
  echo "❌ node_modules directory is missing"
  echo "   Run: npm install"
fi

# Check for iOS build directory
if [ -d "ios/build" ]; then
  echo "✅ iOS build directory exists"
else
  echo "❌ iOS build directory is missing"
  echo "   This is normal if you haven't built the app yet"
fi

# Check for Podfile.lock
if [ -f "ios/Podfile.lock" ]; then
  echo "✅ Podfile.lock exists"
else
  echo "❌ Podfile.lock is missing"
  echo "   Run: cd ios && pod install"
fi

# Check for common error logs
echo -e "\nChecking for error logs:"

# Check for red box errors in the Metro logs
if [ -f "metro.log" ]; then
  if grep -q "Error:" metro.log; then
    echo "❌ Found errors in Metro logs:"
    grep -A 3 "Error:" metro.log | head -n 10
  else
    echo "✅ No errors found in Metro logs"
  fi
fi

echo -e "\nDebugging Tips:"
echo "1. Clear Metro cache: npx react-native start --reset-cache"
echo "2. Clean iOS build: cd ios && xcodebuild clean"
echo "3. Reinstall pods: cd ios && pod install --repo-update"
echo "4. Check API endpoints in src/config/environment.ts"
echo "5. Enable network debugging in the dev menu"
echo "6. Check for console.log messages in the Metro output"

echo -e "\nTo restart the app with a clean slate:"
echo "./clean-and-restart.sh"

echo -e "\nTo implement robust error handling fixes:"
echo "./implement-robust-fixes.sh"
