#!/bin/bash

echo "🔍 OneSignal Android Diagnostic Report"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Checking Firebase Configuration...${NC}"

# Check google-services.json
if [ -f "android/app/google-services.json" ]; then
    echo -e "${GREEN}✅ google-services.json exists${NC}"
    
    # Check if it contains real Firebase data
    if grep -q "miin-ojibwe" android/app/google-services.json; then
        echo -e "${GREEN}✅ Contains real Firebase project data${NC}"
    else
        echo -e "${RED}❌ google-services.json appears to be template${NC}"
    fi
    
    # Check package name in google-services.json
    if grep -q "com.bluestoneapps.miinojibwe" android/app/google-services.json; then
        echo -e "${GREEN}✅ Package name correct in google-services.json${NC}"
    else
        echo -e "${RED}❌ Package name mismatch in google-services.json${NC}"
    fi
else
    echo -e "${RED}❌ google-services.json missing${NC}"
fi

echo -e "\n${BLUE}2. Checking Gradle Configuration...${NC}"

# Check root build.gradle for Google Services plugin
if grep -q "com.google.gms:google-services" android/build.gradle; then
    echo -e "${GREEN}✅ Google Services plugin in root build.gradle${NC}"
else
    echo -e "${RED}❌ Google Services plugin missing from root build.gradle${NC}"
fi

# Check app build.gradle for Firebase dependencies
if grep -q "firebase-messaging" android/app/build.gradle; then
    echo -e "${GREEN}✅ Firebase messaging dependency found${NC}"
else
    echo -e "${RED}❌ Firebase messaging dependency missing${NC}"
fi

# Check if Google Services plugin is applied
if grep -q "apply plugin.*google-services" android/app/build.gradle; then
    echo -e "${GREEN}✅ Google Services plugin applied in app build.gradle${NC}"
else
    echo -e "${RED}❌ Google Services plugin not applied in app build.gradle${NC}"
fi

echo -e "\n${BLUE}3. Checking Android Manifest...${NC}"

# Check OneSignal configuration in manifest
if grep -q "com.onesignal" android/app/src/main/AndroidManifest.xml; then
    echo -e "${GREEN}✅ OneSignal configuration in AndroidManifest.xml${NC}"
else
    echo -e "${RED}❌ OneSignal configuration missing from AndroidManifest.xml${NC}"
fi

# Check notification permission
if grep -q "POST_NOTIFICATIONS" android/app/src/main/AndroidManifest.xml; then
    echo -e "${GREEN}✅ POST_NOTIFICATIONS permission declared${NC}"
else
    echo -e "${YELLOW}⚠️  POST_NOTIFICATIONS permission not explicitly declared${NC}"
fi

echo -e "\n${BLUE}4. Checking Environment Variables...${NC}"

if [ -f ".env" ]; then
    if grep -q "ONESIGNAL_APP_ID=2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965" .env; then
        echo -e "${GREEN}✅ OneSignal App ID correct${NC}"
    else
        echo -e "${RED}❌ OneSignal App ID incorrect or missing${NC}"
    fi
    
    if grep -q "ONESIGNAL_REST_API_KEY" .env; then
        echo -e "${GREEN}✅ OneSignal REST API Key present${NC}"
    else
        echo -e "${RED}❌ OneSignal REST API Key missing${NC}"
    fi
else
    echo -e "${RED}❌ .env file missing${NC}"
fi

echo -e "\n${BLUE}5. Checking OneSignal Service Implementation...${NC}"

if [ -f "src/services/OneSignalService.ts" ]; then
    echo -e "${GREEN}✅ OneSignal service file exists${NC}"
    
    if grep -q "OneSignal.initialize" src/services/OneSignalService.ts; then
        echo -e "${GREEN}✅ OneSignal initialization code present${NC}"
    else
        echo -e "${RED}❌ OneSignal initialization code missing${NC}"
    fi
else
    echo -e "${RED}❌ OneSignal service file missing${NC}"
fi

echo -e "\n${BLUE}6. Checking App Initialization...${NC}"

if grep -q "oneSignalService.initialize" App.tsx; then
    echo -e "${GREEN}✅ OneSignal service called in App.tsx${NC}"
else
    echo -e "${RED}❌ OneSignal service not called in App.tsx${NC}"
fi

echo -e "\n${YELLOW}7. Troubleshooting Recommendations:${NC}"
echo "=================================="

echo -e "\n${YELLOW}If device is not registering in OneSignal dashboard:${NC}"
echo "1. Check OneSignal dashboard → Settings → Platforms → Google Android (FCM)"
echo "2. Verify Service Account JSON is uploaded"
echo "3. Confirm Firebase Project ID is 'miin-ojibwe'"
echo "4. Ensure package name matches 'com.bluestoneapps.miinojibwe'"

echo -e "\n${YELLOW}If notifications are not delivered:${NC}"
echo "1. Check OneSignal dashboard → Messages for delivery statistics"
echo "2. Verify Android notification permissions are enabled"
echo "3. Test on physical device (not emulator)"
echo "4. Check if device appears in OneSignal → Audience → All Users"

echo -e "\n${YELLOW}Debug with ADB (if device connected):${NC}"
echo "adb logcat | grep -i onesignal"

echo -e "\n${GREEN}Diagnostic complete.${NC}"
