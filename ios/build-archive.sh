#!/bin/bash

# Build script for iOS Archive with proper dSYM handling
# This script ensures that Hermes framework dSYM files are properly included

set -e

echo "🧹 Cleaning build folder..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LAReactNative-*

echo "📦 Installing pods..."
cd ios
pod install
cd ..

echo "🔨 Building archive..."
cd ios

# Build the archive with proper dSYM settings
xcodebuild -workspace LAReactNative.xcworkspace \
  -scheme LAReactNative \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath ./build/LAReactNative.xcarchive \
  archive \
  DEBUG_INFORMATION_FORMAT=dwarf-with-dsym \
  COPY_PHASE_STRIP=NO \
  STRIP_INSTALLED_PRODUCT=NO

echo "✅ Archive created successfully!"
echo "📁 Archive location: ./ios/build/LAReactNative.xcarchive"

# Fix Hermes dSYM issue
echo "🔧 Fixing Hermes dSYM issue..."
./fix-hermes-dsym.sh "./build/LAReactNative.xcarchive"

# Verify dSYM files are present
echo "🔍 Checking for dSYM files..."
if [ -d "./build/LAReactNative.xcarchive/dSYMs" ]; then
  echo "✅ dSYMs folder found"
  ls -la "./build/LAReactNative.xcarchive/dSYMs/"
else
  echo "❌ dSYMs folder not found"
fi

cd ..

echo "🎉 Archive build complete! You can now upload to App Store Connect." 