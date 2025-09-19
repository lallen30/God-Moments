#!/bin/bash

# Check Xcode Project Push Configuration
# This script checks if Push Notifications and Background Modes are properly enabled

echo "🔍 Checking Xcode Project Push Configuration..."
echo "================================================"

PROJECT_PATH="ios/LAReactNative.xcodeproj/project.pbxproj"
PLIST_PATH="ios/LAReactNative/Info.plist"
ENTITLEMENTS_PATH="ios/LAReactNative/LAReactNative.entitlements"

# Check if project files exist
if [ ! -f "$PROJECT_PATH" ]; then
    echo "❌ Project file not found: $PROJECT_PATH"
    exit 1
fi

if [ ! -f "$PLIST_PATH" ]; then
    echo "❌ Info.plist not found: $PLIST_PATH"
    exit 1
fi

echo "📱 Bundle ID Check:"
echo "==================="
BUNDLE_ID=$(grep -A1 "PRODUCT_BUNDLE_IDENTIFIER" "$PROJECT_PATH" | grep -o 'com\.[^"]*' | head -1)
echo "Bundle ID from project: $BUNDLE_ID"

# Check for Push Notifications capability
echo ""
echo "🔔 Push Notifications Capability:"
echo "=================================="
if grep -q "com.apple.developer.aps-environment" "$PROJECT_PATH"; then
    echo "✅ Push Notifications capability found in project"
    APS_ENV=$(grep -A1 "com.apple.developer.aps-environment" "$PROJECT_PATH" | grep -o 'development\|production' | head -1)
    echo "   APS Environment: $APS_ENV"
else
    echo "❌ Push Notifications capability NOT found in project"
    echo "   You need to enable Push Notifications in Xcode:"
    echo "   1. Open ios/LAReactNative.xcworkspace in Xcode"
    echo "   2. Select LAReactNative target"
    echo "   3. Go to Signing & Capabilities"
    echo "   4. Click + and add 'Push Notifications'"
fi

# Check for Background Modes
echo ""
echo "🔄 Background Modes Capability:"
echo "==============================="
if grep -q "UIBackgroundModes" "$PLIST_PATH"; then
    echo "✅ Background Modes found in Info.plist"
    echo "   Background modes:"
    grep -A10 "UIBackgroundModes" "$PLIST_PATH" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/   - \1/'
    
    # Check for remote notifications specifically
    if grep -A10 "UIBackgroundModes" "$PLIST_PATH" | grep -q "remote-notification"; then
        echo "✅ Remote notifications background mode enabled"
    else
        echo "❌ Remote notifications background mode NOT enabled"
        echo "   You need to enable Background App Refresh - Remote notifications in Xcode"
    fi
else
    echo "❌ Background Modes capability NOT found"
    echo "   You need to enable Background Modes in Xcode:"
    echo "   1. Open ios/LAReactNative.xcworkspace in Xcode"
    echo "   2. Select LAReactNative target"
    echo "   3. Go to Signing & Capabilities"
    echo "   4. Click + and add 'Background Modes'"
    echo "   5. Check 'Background App Refresh' and 'Remote notifications'"
fi

# Check for entitlements file
echo ""
echo "🔐 Entitlements File:"
echo "===================="
if [ -f "$ENTITLEMENTS_PATH" ]; then
    echo "✅ Entitlements file found: $ENTITLEMENTS_PATH"
    if grep -q "aps-environment" "$ENTITLEMENTS_PATH"; then
        APS_ENV=$(grep -A1 "aps-environment" "$ENTITLEMENTS_PATH" | grep -o 'development\|production' | head -1)
        echo "   APS Environment in entitlements: $APS_ENV"
    else
        echo "❌ APS environment not found in entitlements"
    fi
else
    echo "❌ Entitlements file not found"
    echo "   This should be automatically created when you add Push Notifications capability"
fi

# Check provisioning profile reference
echo ""
echo "📋 Provisioning Profile:"
echo "========================"
if grep -q "PROVISIONING_PROFILE" "$PROJECT_PATH"; then
    echo "✅ Provisioning profile configured"
    PROFILE_SPECIFIER=$(grep -A1 "PROVISIONING_PROFILE_SPECIFIER" "$PROJECT_PATH" | grep -v "PROVISIONING_PROFILE_SPECIFIER" | sed 's/.*= \(.*\);/\1/' | tr -d '"' | head -1)
    if [ ! -z "$PROFILE_SPECIFIER" ]; then
        echo "   Profile Specifier: $PROFILE_SPECIFIER"
    fi
else
    echo "⚠️  No specific provisioning profile configured (using automatic)"
fi

# Check signing configuration
echo ""
echo "✍️  Code Signing:"
echo "================="
TEAM_ID=$(grep -A1 "DEVELOPMENT_TEAM" "$PROJECT_PATH" | grep -v "DEVELOPMENT_TEAM" | sed 's/.*= \(.*\);/\1/' | tr -d '"' | head -1)
if [ ! -z "$TEAM_ID" ]; then
    echo "✅ Development Team: $TEAM_ID"
else
    echo "❌ No development team configured"
fi

CODE_SIGN_STYLE=$(grep -A1 "CODE_SIGN_STYLE" "$PROJECT_PATH" | grep -v "CODE_SIGN_STYLE" | sed 's/.*= \(.*\);/\1/' | tr -d '"' | head -1)
echo "   Code Sign Style: $CODE_SIGN_STYLE"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. If Push Notifications or Background Modes are missing, add them in Xcode"
echo "2. Rebuild the app after making capability changes"
echo "3. Run 'npm run ios' to test with verbose OneSignal logging"
echo "4. Check Xcode console or run './log-ios.sh' for APNs device token logs"
echo "5. Look for logs like 'APNs device token' or 'OneSignal registration'"
