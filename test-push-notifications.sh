#!/bin/bash

# OneSignal Push Notification Test Script
# This script helps test push notifications for the MIIN-Ojibwe app

echo "🔔 OneSignal Push Notification Test"
echo "=================================="

# Check if required environment variables are set
if [ -z "$ONESIGNAL_APP_ID" ] || [ -z "$ONESIGNAL_REST_API_KEY" ]; then
    echo "❌ Error: OneSignal environment variables not set"
    echo "Please make sure .env file contains:"
    echo "ONESIGNAL_APP_ID=your_app_id"
    echo "ONESIGNAL_REST_API_KEY=your_rest_api_key"
    exit 1
fi

# Read environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

echo "📱 App ID: ${ONESIGNAL_APP_ID}"
echo ""

# Function to send test notification to all users
send_test_notification() {
    echo "📤 Sending test notification to all users..."
    
    curl -X POST https://onesignal.com/api/v1/notifications \
      -H "Content-Type: application/json; charset=utf-8" \
      -H "Authorization: Basic ${ONESIGNAL_REST_API_KEY}" \
      -d '{
        "app_id": "'${ONESIGNAL_APP_ID}'",
        "included_segments": ["All"],
        "contents": {"en": "Test notification from MIIN-Ojibwe app! 🎉"},
        "headings": {"en": "Test Notification"},
        "data": {"test": true}
      }'
    
    echo ""
    echo "✅ Test notification sent!"
}

# Function to send notification to specific user ID
send_notification_to_user() {
    echo "Enter OneSignal User ID:"
    read user_id
    
    if [ -z "$user_id" ]; then
        echo "❌ Error: User ID cannot be empty"
        return 1
    fi
    
    echo "📤 Sending notification to user: $user_id"
    
    curl -X POST https://onesignal.com/api/v1/notifications \
      -H "Content-Type: application/json; charset=utf-8" \
      -H "Authorization: Basic ${ONESIGNAL_REST_API_KEY}" \
      -d '{
        "app_id": "'${ONESIGNAL_APP_ID}'",
        "include_external_user_ids": ["'${user_id}'"],
        "contents": {"en": "Personal test notification! 👋"},
        "headings": {"en": "Hello from MIIN-Ojibwe"},
        "data": {"test": true, "user_specific": true}
      }'
    
    echo ""
    echo "✅ Notification sent to user: $user_id"
}

# Function to get app info
get_app_info() {
    echo "📊 Getting app information..."
    
    curl -X GET "https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}" \
      -H "Authorization: Basic ${ONESIGNAL_REST_API_KEY}" \
      | jq '.'
    
    echo ""
}

# Function to check if iOS simulator can receive push notifications
check_simulator_support() {
    echo "🔍 iOS Simulator Push Notification Support"
    echo "=========================================="
    echo ""
    echo "iOS Simulator support for push notifications:"
    echo "• iOS 16.4+ simulators have LIMITED push notification support"
    echo "• You can send notifications using the simulator's 'Device > Send Push Notification' menu"
    echo "• Or use the simctl command line tool"
    echo ""
    echo "To send a test notification to the simulator:"
    echo "1. Create a test payload JSON file"
    echo "2. Use: xcrun simctl push booted org.reactjs.native.example.LAReactNative payload.json"
    echo ""
    echo "For full testing, use a physical iOS device."
    echo ""
}

# Main menu
while true; do
    echo "Choose an option:"
    echo "1. Send test notification to all users"
    echo "2. Send notification to specific user ID" 
    echo "3. Get app information"
    echo "4. Check iOS Simulator support"
    echo "5. Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            send_test_notification
            ;;
        2)
            send_notification_to_user
            ;;
        3)
            get_app_info
            ;;
        4)
            check_simulator_support
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    echo "Press Enter to continue..."
    read
    clear
done
