#!/bin/bash

echo "🔧 OneSignal Android Troubleshooting Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Checking OneSignal Android Configuration...${NC}"

# Check if google-services.json exists
if [ -f "android/app/google-services.json" ]; then
    echo -e "${GREEN}✅ google-services.json found${NC}"
    
    # Check if it's the template or real file
    if grep -q "YOUR_PROJECT_NUMBER" android/app/google-services.json; then
        echo -e "${YELLOW}⚠️  google-services.json is still a template - needs Firebase project configuration${NC}"
        echo -e "${YELLOW}   Please follow the Firebase setup instructions below${NC}"
    else
        echo -e "${GREEN}✅ google-services.json appears to be configured${NC}"
    fi
else
    echo -e "${RED}❌ google-services.json not found${NC}"
fi

# Check Android manifest for OneSignal configuration
echo -e "\n${BLUE}2. Checking AndroidManifest.xml...${NC}"
if grep -q "com.onesignal" android/app/src/main/AndroidManifest.xml; then
    echo -e "${GREEN}✅ OneSignal configuration found in AndroidManifest.xml${NC}"
else
    echo -e "${RED}❌ OneSignal configuration missing in AndroidManifest.xml${NC}"
fi

# Check for notification icon
if [ -f "android/app/src/main/res/drawable-mdpi/ic_stat_miin.png" ]; then
    echo -e "${GREEN}✅ OneSignal notification icon found${NC}"
else
    echo -e "${YELLOW}⚠️  OneSignal notification icon missing${NC}"
fi

# Check build.gradle files
echo -e "\n${BLUE}3. Checking Gradle configuration...${NC}"
if grep -q "google-services" android/build.gradle; then
    echo -e "${GREEN}✅ Google Services plugin found in root build.gradle${NC}"
else
    echo -e "${RED}❌ Google Services plugin missing in root build.gradle${NC}"
fi

if grep -q "google-services" android/app/build.gradle; then
    echo -e "${GREEN}✅ Google Services plugin applied in app build.gradle${NC}"
else
    echo -e "${RED}❌ Google Services plugin not applied in app build.gradle${NC}"
fi

if grep -q "firebase-messaging" android/app/build.gradle; then
    echo -e "${GREEN}✅ Firebase messaging dependency found${NC}"
else
    echo -e "${RED}❌ Firebase messaging dependency missing${NC}"
fi

# Check .env file
echo -e "\n${BLUE}4. Checking Environment Configuration...${NC}"
if [ -f ".env" ]; then
    if grep -q "ONESIGNAL_APP_ID" .env; then
        echo -e "${GREEN}✅ ONESIGNAL_APP_ID found in .env${NC}"
    else
        echo -e "${RED}❌ ONESIGNAL_APP_ID missing in .env${NC}"
    fi
    
    if grep -q "ONESIGNAL_REST_API_KEY" .env; then
        echo -e "${GREEN}✅ ONESIGNAL_REST_API_KEY found in .env${NC}"
    else
        echo -e "${RED}❌ ONESIGNAL_REST_API_KEY missing in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo -e "\n${BLUE}5. Next Steps to Fix OneSignal on Android:${NC}"
echo -e "${YELLOW}=========================================${NC}"

echo -e "\n${YELLOW}Step 1: Set up Firebase Project${NC}"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Create a new project or use existing one"
echo "3. Add Android app with package name: com.bluestoneapps.miinojibwe"
echo "4. Download the google-services.json file"
echo "5. Replace the template file at android/app/google-services.json"

echo -e "\n${YELLOW}Step 2: Configure OneSignal Dashboard${NC}"
echo "1. Go to https://app.onesignal.com/"
echo "2. Open your app settings"
echo "3. Go to Platforms > Google Android (FCM)"
echo "4. Upload your Firebase Server Key or use Firebase Admin SDK"
echo "5. Make sure the package name matches: com.bluestoneapps.miinojibwe"

echo -e "\n${YELLOW}Step 3: Clean and Rebuild${NC}"
echo "Run these commands:"
echo "cd android && ./gradlew clean && cd .."
echo "npx react-native run-android"

echo -e "\n${YELLOW}Step 4: Test Push Notifications${NC}"
echo "1. Install the app on a physical Android device"
echo "2. Grant notification permissions when prompted"
echo "3. Check OneSignal dashboard for the device registration"
echo "4. Send a test notification from OneSignal dashboard"

echo -e "\n${BLUE}6. Common Android OneSignal Issues:${NC}"
echo -e "${YELLOW}===================================${NC}"
echo "• Missing google-services.json file"
echo "• Incorrect package name in Firebase project"
echo "• Missing Firebase Server Key in OneSignal dashboard"
echo "• App not requesting notification permissions"
echo "• Testing on emulator instead of physical device"
echo "• Outdated OneSignal SDK version"

echo -e "\n${GREEN}Script completed. Follow the steps above to fix OneSignal on Android.${NC}"
