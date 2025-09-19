#!/bin/bash

# OneSignal User ID Troubleshooting Script for React Native v5+
# This script helps diagnose why OneSignal User ID is not being assigned

echo "🔍 OneSignal User ID Troubleshooting"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Current Setup Status:${NC}"
echo -e "${GREEN}✅ OneSignal v5.2.12 installed${NC}"
echo -e "${GREEN}✅ OneSignal.initialize() called in App.tsx${NC}"
echo -e "${GREEN}✅ Notification permission granted${NC}"
echo -e "${GREEN}✅ No AppDelegate setup required for v5+${NC}"
echo ""

echo -e "${YELLOW}🔍 Common Reasons for User ID Delay:${NC}"
echo ""
echo "1. 📱 DEVICE REQUIREMENTS:"
echo "   • Must be a physical iOS device (not simulator)"
echo "   • Device must have internet connection"
echo "   • APNs (Apple Push Notification service) must be reachable"
echo ""

echo "2. 🔐 PROVISIONING & CERTIFICATES:"
echo "   • App must be signed with valid development/distribution certificate"
echo "   • Provisioning profile must include Push Notifications capability"
echo "   • Bundle ID must match OneSignal dashboard configuration"
echo "   • APNs certificates must be valid in Apple Developer portal"
echo ""

echo "3. ⏱️ TIMING ISSUES:"
echo "   • User ID assignment can take 10-60 seconds on first launch"
echo "   • Network connectivity affects registration speed"
echo "   • OneSignal server communication may be delayed"
echo ""

echo "4. 🌐 NETWORK & FIREWALL:"
echo "   • Device must reach OneSignal servers (api.onesignal.com)"
echo "   • Corporate firewalls may block push notification traffic"
echo "   • Check for proxy or VPN interference"
echo ""

echo -e "${BLUE}🔧 Troubleshooting Steps:${NC}"
echo ""
echo "1. CHECK DEVICE LOGS:"
echo "   • Open Xcode → Window → Devices and Simulators"
echo "   • Select your device → View Device Logs"
echo "   • Filter for 'OneSignal', 'APNs', or 'push'"
echo ""

echo "2. VERIFY XCODE PROJECT SETTINGS:"
echo "   • Signing & Capabilities → Push Notifications enabled"
echo "   • Bundle Identifier matches OneSignal dashboard"
echo "   • Valid provisioning profile selected"
echo ""

echo "3. CHECK ONESIGNAL DASHBOARD:"
echo "   • Login to OneSignal dashboard"
echo "   • Go to Settings → Platforms → iOS"
echo "   • Verify APNs certificates are uploaded and valid"
echo "   • Check 'All Users' section for recent device registrations"
echo ""

echo "4. NETWORK TESTING:"
echo "   • Test on different WiFi networks"
echo "   • Try cellular data connection"
echo "   • Disable VPN if active"
echo ""

echo "5. APP RESTART TESTING:"
echo "   • Force quit the app completely"
echo "   • Clear app from background"
echo "   • Launch app fresh and wait 1-2 minutes"
echo ""

echo -e "${GREEN}💡 Expected Behavior:${NC}"
echo "• OneSignal initialization: Immediate (✅ seen in logs)"
echo "• Permission request: Immediate (✅ seen in logs)"
echo "• User ID assignment: 10-60 seconds after first launch"
echo "• Push subscription: Follows user ID assignment"
echo ""

echo -e "${YELLOW}📱 Current Status from Logs:${NC}"
echo "• OneSignal App ID: 2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965"
echo "• Initialization: ✅ Successful"
echo "• Permissions: ✅ Granted"
echo "• User ID: ⏳ Pending (this is the issue we're addressing)"
echo ""

echo -e "${BLUE}🔄 Next Steps:${NC}"
echo "1. Reload the app to test the updated OneSignal service code"
echo "2. Wait 1-2 minutes for user registration"
echo "3. Check Metro logs for the new diagnostic messages"
echo "4. If still no User ID, check device logs in Xcode"
echo "5. Verify network connectivity and OneSignal dashboard"
echo ""

echo -e "${RED}⚠️ Important Notes:${NC}"
echo "• User ID assignment is handled by OneSignal servers"
echo "• React Native code cannot force immediate assignment"
echo "• Network issues are the most common cause of delays"
echo "• Physical device is absolutely required for testing"
echo ""

read -p "Press Enter to continue..."
