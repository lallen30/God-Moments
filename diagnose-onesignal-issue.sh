#!/bin/bash

echo "🔍 OneSignal Push Notification Diagnostic Script"
echo "================================================"

PROJECT_ROOT=$(pwd)
IOS_PROJECT="$PROJECT_ROOT/ios/LAReactNative.xcodeproj"
INFO_PLIST="$PROJECT_ROOT/ios/LAReactNative/Info.plist"
ENTITLEMENTS="$PROJECT_ROOT/ios/LAReactNative/LAReactNative.entitlements"

echo ""
echo "📱 1. CHECKING PROJECT CONFIGURATION"
echo "======================================="

# Check Bundle ID
echo "Bundle ID:"
/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$INFO_PLIST" 2>/dev/null || echo "❌ Could not read Bundle ID"

# Check if entitlements file exists and has push notification capability
echo ""
echo "Entitlements file:"
if [ -f "$ENTITLEMENTS" ]; then
    echo "✅ Found entitlements file"
    echo "APS Environment:"
    /usr/libexec/PlistBuddy -c "Print :aps-environment" "$ENTITLEMENTS" 2>/dev/null || echo "❌ No aps-environment found"
else
    echo "❌ No entitlements file found"
fi

echo ""
echo "📦 2. CHECKING ONESIGNAL INSTALLATION"
echo "======================================"

# Check package.json
echo "OneSignal package:"
grep -o '"react-native-onesignal": "[^"]*"' package.json || echo "❌ OneSignal not found in package.json"

# Check if OneSignal is in node_modules
if [ -d "node_modules/react-native-onesignal" ]; then
    echo "✅ OneSignal found in node_modules"
    echo "Version:"
    grep '"version"' node_modules/react-native-onesignal/package.json | head -1
else
    echo "❌ OneSignal not found in node_modules"
fi

# Check Pods
echo ""
echo "OneSignal in Pods:"
if [ -d "ios/Pods/OneSignalXCFramework" ]; then
    echo "✅ OneSignalXCFramework found in Pods"
else
    echo "❌ OneSignalXCFramework not found in Pods"
fi

echo ""
echo "🔧 3. CHECKING NATIVE CONFIGURATION"
echo "===================================="

# Check if push notifications capability is in project file
echo "Push Notifications capability in project:"
if grep -q "com.apple.Push" "$IOS_PROJECT/project.pbxproj"; then
    echo "✅ Push Notifications capability found in project"
else
    echo "❌ Push Notifications capability NOT found in project"
fi

# Check AppDelegate for OneSignal setup (v5+ doesn't require this)
echo ""
echo "AppDelegate OneSignal setup:"
if grep -q -i "onesignal" ios/LAReactNative/AppDelegate.mm; then
    echo "✅ OneSignal found in AppDelegate (not required for v5+)"
    grep -n -i "onesignal" ios/LAReactNative/AppDelegate.mm
else
    echo "✅ OneSignal NOT in AppDelegate (correct for v5+ - auto-initializes via React Native)"
fi

echo ""
echo "🌐 4. CHECKING NETWORK AND PERMISSIONS"
echo "======================================="

# Check if we can reach OneSignal API
echo "OneSignal API connectivity:"
if curl -s --max-time 5 https://onesignal.com/api/v1 >/dev/null; then
    echo "✅ Can reach OneSignal API"
else
    echo "❌ Cannot reach OneSignal API"
fi

echo ""
echo "📱 5. CHECKING DEVICE INFORMATION"
echo "=================================="

# Check if device is connected
echo "Connected iOS devices:"
xcrun simctl list devices | grep "Booted" || echo "No simulators running"
xcrun devicectl list devices 2>/dev/null | grep "Connected" || echo "No physical devices connected"

echo ""
echo "🔍 6. RECOMMENDATIONS"
echo "====================="

ISSUES_FOUND=0

# Check for common issues
if ! grep -q "com.apple.Push" "$IOS_PROJECT/project.pbxproj"; then
    echo "❌ Issue: Push Notifications capability not found in Xcode project"
    echo "   Recommendation: Add Push Notifications capability in Xcode"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! grep -q -i "onesignal" ios/LAReactNative/AppDelegate.mm; then
    echo "✅ No issue: OneSignal v5+ auto-initializes via React Native (no AppDelegate setup needed)"
fi

if [ ! -f "$ENTITLEMENTS" ]; then
    echo "❌ Issue: No entitlements file found"
    echo "   Recommendation: Create entitlements file with aps-environment"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ No obvious configuration issues found"
    echo "   The issue might be:"
    echo "   - Device not registered with Apple Developer portal"
    echo "   - Provisioning profile doesn't include push notifications"
    echo "   - Network connectivity issues"
    echo "   - OneSignal app configuration issues"
fi

echo ""
echo "📋 Next steps:"
echo "1. Check device logs in Xcode > Window > Devices and Simulators"
echo "2. Look for APNs registration errors in device console"
echo "3. Verify device is included in provisioning profile"
echo "4. Test with a different device/simulator"

echo ""
echo "Diagnostic complete!"
