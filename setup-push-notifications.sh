#!/bin/bash

# Quick Setup Script for Push Notifications Fix

echo "🚀 Setting up Push Notifications - Quick Fix"
echo "============================================="

echo "1. 📱 Opening Xcode workspace..."
open ios/LAReactNative.xcworkspace

echo ""
echo "2. 🧹 Cleaning iOS build cache..."
cd ios
rm -rf build/
xcodebuild clean -workspace LAReactNative.xcworkspace -scheme LAReactNative >/dev/null 2>&1
cd ..

echo ""
echo "3. 📋 Manual Steps Required in Xcode:"
echo "   ✅ Add 'Push Notifications' capability"
echo "   ✅ Verify entitlements file is linked"
echo "   ✅ Check code signing/provisioning"
echo ""
echo "4. 🔧 After making changes in Xcode, run:"
echo "   npm run ios"
echo ""
echo "5. 🔍 Monitor logs with:"
echo "   ./log-ios.sh"
echo ""
echo "📖 See PUSH_NOTIFICATIONS_SETUP.md for detailed instructions"
