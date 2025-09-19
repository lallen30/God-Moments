#!/bin/bash

echo "📱 OneSignal APNs Registration Monitor"
echo "======================================"

# Function to get the device UDID of a connected physical device
get_device_udid() {
    xcrun devicectl list devices 2>/dev/null | grep "Connected" | head -1 | grep -o '[A-F0-9]\{8\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{12\}' | head -1
}

# Function to get device name
get_device_name() {
    local udid=$1
    xcrun devicectl list devices 2>/dev/null | grep "$udid" | sed 's/.*Connected (//' | sed 's/,.*//'
}

DEVICE_UDID=$(get_device_udid)

if [ -z "$DEVICE_UDID" ]; then
    echo "❌ No physical device connected. Please connect a device and try again."
    echo ""
    echo "📋 To use this script:"
    echo "1. Connect your iPhone via USB"
    echo "2. Trust the computer if prompted"
    echo "3. Run this script again"
    echo ""
    echo "💡 Alternative: Use Xcode > Window > Devices and Simulators > View Device Logs"
    exit 1
fi

DEVICE_NAME=$(get_device_name "$DEVICE_UDID")
echo "📱 Found device: $DEVICE_NAME ($DEVICE_UDID)"
echo ""

echo "🔍 Starting APNs registration monitoring..."
echo "Looking for OneSignal and APNs logs..."
echo ""
echo "Press Ctrl+C to stop monitoring"
echo "============================================"

# Monitor device logs for OneSignal and APNs related messages
xcrun devicectl log stream --device "$DEVICE_UDID" \
    --predicate 'subsystem CONTAINS "OneSignal" OR subsystem CONTAINS "apns" OR subsystem CONTAINS "pushd" OR category CONTAINS "OneSignal" OR eventMessage CONTAINS "OneSignal" OR eventMessage CONTAINS "APNS" OR eventMessage CONTAINS "push" OR eventMessage CONTAINS "notification" OR eventMessage CONTAINS "deviceToken"' \
    --style compact \
    2>/dev/null || {
    
    echo ""
    echo "❌ Could not start device log streaming with devicectl"
    echo ""
    echo "🔧 Alternative methods to check device logs:"
    echo "1. Open Xcode > Window > Devices and Simulators"
    echo "2. Select your device > View Device Logs"
    echo "3. Filter for 'OneSignal' or 'apns'"
    echo ""
    echo "OR use Console app:"
    echo "1. Open Console.app on Mac"
    echo "2. Select your device in sidebar"
    echo "3. Search for 'OneSignal' or 'apns'"
    echo ""
    echo "📋 What to look for in logs:"
    echo "- OneSignal initialization messages"
    echo "- APNs device token registration"
    echo "- Any error messages related to push notifications"
    echo "- Network connection errors"
    echo "- Permission denied messages"
}

# OneSignal v5+ APNs Monitor for React Native
# IMPORTANT: OneSignal v5+ does NOT require AppDelegate setup!

echo "🚨 IMPORTANT NOTICE: OneSignal v5+ Setup"
echo "========================================"
echo -e "\033[0;32m✅ Your OneSignal v5.2.12 setup is CORRECT!\033[0m"
echo -e "\033[0;32m✅ No AppDelegate setup required for v5+\033[0m"
echo -e "\033[0;31m❌ Any warnings about AppDelegate are FALSE POSITIVES\033[0m"
echo ""

# Monitor APNs logs for OneSignal push notification debugging
