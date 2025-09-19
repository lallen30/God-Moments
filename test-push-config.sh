#!/bin/bash

# Test Push Notifications After Capability Addition

echo "🧪 Testing Push Notifications Configuration"
echo "=========================================="

echo "1. 🔍 Checking if capability was saved to project..."
if grep -q "com.apple.developer.aps-environment" ios/LAReactNative.xcodeproj/project.pbxproj; then
    echo "   ✅ Push Notifications capability found in project file"
    
    # Check which environment
    APS_ENV=$(grep -A1 "com.apple.developer.aps-environment" ios/LAReactNative.xcodeproj/project.pbxproj | grep -o 'development\|production' | head -1)
    if [ ! -z "$APS_ENV" ]; then
        echo "   📱 APS Environment: $APS_ENV"
    fi
else
    echo "   ❌ Push Notifications capability NOT found in project file"
    echo "   ⚠️  This might be OK if Xcode hasn't saved yet"
fi

echo ""
echo "2. 🔐 Checking entitlements file..."
if [ -f "ios/LAReactNative/LAReactNative.entitlements" ]; then
    echo "   ✅ Entitlements file exists"
    if grep -q "aps-environment" ios/LAReactNative/LAReactNative.entitlements; then
        echo "   ✅ APNs environment configured in entitlements"
    else
        echo "   ❌ APNs environment missing from entitlements"
    fi
else
    echo "   ❌ Entitlements file missing"
fi

echo ""
echo "3. 📋 Next: Wait for build to complete, then test:"
echo "   • Navigate to OneSignal Debug screen"
echo "   • Check if User ID shows actual ID (not 'pending')"
echo "   • Look for APNs device token in logs"
echo "   • Test notification from OneSignal dashboard"

echo ""
echo "4. 🔍 To monitor logs during testing:"
echo "   ./log-ios.sh"

echo ""
echo "5. ✅ Expected success indicators:"
echo "   • OneSignal User ID: actual ID instead of 'Initialized - ID pending...'"
echo "   • Console logs: 'APNs device token' and 'OneSignal registration'"
echo "   • Notifications deliverable from OneSignal dashboard"
