#!/bin/bash

# Troubleshoot Push Notifications Capability Addition

echo "🔍 Troubleshooting Push Notifications Capability..."
echo "=================================================="

# Check if Xcode is running
echo "1. 📱 Checking if Xcode is running..."
if pgrep -x "Xcode" > /dev/null; then
    echo "   ✅ Xcode is running"
else
    echo "   ❌ Xcode is not running - opening it now..."
    open ios/LAReactNative.xcworkspace
    echo "   ✅ Opened Xcode workspace"
fi

echo ""
echo "2. 🔍 Checking current project state..."
if grep -q "com.apple.developer.aps-environment" ios/LAReactNative.xcodeproj/project.pbxproj; then
    echo "   ✅ Push Notifications capability found in project file"
else
    echo "   ❌ Push Notifications capability NOT found in project file"
fi

echo ""
echo "3. 📋 Step-by-step verification in Xcode:"
echo "   a) In Xcode, look at the top of the window - what project/target is selected?"
echo "   b) Is 'LAReactNative' (the app target) selected, or 'LAReactNative' (the project)?"
echo "   c) When you click on 'Signing & Capabilities', do you see other capabilities?"
echo "   d) What capabilities do you currently see listed?"

echo ""
echo "4. 🔧 Common issues and solutions:"
echo "   ❌ Selected the PROJECT instead of the TARGET"
echo "      → Select the target with the app icon, not the folder icon"
echo ""
echo "   ❌ Added capability but didn't save"
echo "      → Press Cmd+S to save in Xcode"
echo ""
echo "   ❌ Wrong scheme/configuration selected"
echo "      → Make sure you're in the main app target"

echo ""
echo "5. 🎯 What to look for in 'Signing & Capabilities':"
echo "   You should see these capabilities:"
echo "   ✅ Background Modes (should already be there)"
echo "   ❌ Push Notifications (this is what we're adding)"

echo ""
echo "6. 📝 After adding Push Notifications, you should see:"
echo "   - Push Notifications capability in the list"
echo "   - No additional configuration needed for this capability"
echo "   - Entitlements file should be automatically linked"

echo ""
echo "Press any key to continue..."
read -n 1 -s
echo ""
echo "Now try these steps in Xcode:"
echo "1. Make sure LAReactNative TARGET is selected (not project)"
echo "2. Go to Signing & Capabilities tab"
echo "3. Click + Capability"
echo "4. Type 'Push' and add 'Push Notifications'"
echo "5. Press Cmd+S to save"
echo "6. Come back and run: ./check-xcode-push-config.sh"
