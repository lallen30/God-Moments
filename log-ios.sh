#!/bin/bash

# iOS Device Logging for OneSignal/APNs Debug
# This script shows live iOS simulator/device logs filtered for OneSignal and APNs

echo "📱 Starting iOS logging for OneSignal/APNs debugging..."
echo "======================================================="
echo "This will show live logs from iOS Simulator or connected device"
echo "Look for:"
echo "  - APNs device token registration"
echo "  - OneSignal registration attempts"
echo "  - Push notification delivery"
echo "  - Network/SSL errors"
echo ""
echo "Press Ctrl+C to stop logging"
echo ""

# Check if we have xcrun available
if ! command -v xcrun &> /dev/null; then
    echo "❌ xcrun not found. Make sure Xcode is installed."
    exit 1
fi

# Get device/simulator info
echo "📱 Available devices:"
xcrun simctl list devices | grep "Booted\|iPhone.*("

echo ""
echo "🔍 Starting log stream (filtering for OneSignal, APNs, push, and network)..."
echo "============================================================================"

# Stream logs with filters for OneSignal and APNs related content
xcrun simctl spawn booted log stream \
    --predicate 'subsystem CONTAINS "OneSignal" OR subsystem CONTAINS "apns" OR subsystem CONTAINS "push" OR messageText CONTAINS "OneSignal" OR messageText CONTAINS "APNs" OR messageText CONTAINS "push" OR messageText CONTAINS "device token" OR messageText CONTAINS "registration" OR messageText CONTAINS "com.knoxweb.miin-ojibwe"' \
    --info \
    --debug \
    2>/dev/null || {
    
    echo "⚠️  Simulator log stream failed, trying device log stream..."
    
    # Fallback to regular log with grep filters
    xcrun simctl spawn booted log stream 2>/dev/null | grep -i -E "(onesignal|apns|push|device.*token|registration|com\.knoxweb\.miin)" || {
        
        echo "⚠️  Unable to connect to simulator. Trying system log..."
        
        # Last resort - system log
        log stream --predicate 'subsystem CONTAINS "OneSignal" OR messageText CONTAINS "OneSignal" OR messageText CONTAINS "APNs" OR messageText CONTAINS "push"' --info --debug 2>/dev/null || {
            
            echo "❌ Could not start log streaming. Try:"
            echo "1. Make sure iOS Simulator is running"
            echo "2. Or connect a physical device"
            echo "3. Run this script again"
            echo "4. Alternatively, watch logs in Xcode console"
            exit 1
        }
    }
}
