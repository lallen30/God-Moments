#!/bin/bash

# God Moments - Bundle ID Update Script
# This script updates the bundle ID across all necessary files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
IOS_DIR="$PROJECT_ROOT/ios"

echo -e "${GREEN}=== God Moments Bundle ID Update Script ===${NC}\n"

# Current bundle ID
CURRENT_BUNDLE_ID="com.bluestoneapps.godmomentsdevapp"

# Prompt for new bundle ID
echo -e "${YELLOW}Current bundle ID:${NC} $CURRENT_BUNDLE_ID"
echo -e "\n${YELLOW}Choose an option:${NC}"
echo "1) Replace existing app (use: hr.apps.219596)"
echo "2) Create new app (use: com.bluestoneapps.godmoments)"
echo "3) Enter custom bundle ID"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        NEW_BUNDLE_ID="hr.apps.219596"
        ;;
    2)
        NEW_BUNDLE_ID="com.bluestoneapps.godmoments"
        ;;
    3)
        read -p "Enter custom bundle ID: " NEW_BUNDLE_ID
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}New bundle ID:${NC} $NEW_BUNDLE_ID"
read -p "Proceed with this change? (y/n): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 0
fi

echo -e "\n${GREEN}Updating bundle ID...${NC}\n"

# Backup project.pbxproj
PBXPROJ_FILE="$IOS_DIR/godmoments.xcodeproj/project.pbxproj"
if [ -f "$PBXPROJ_FILE" ]; then
    cp "$PBXPROJ_FILE" "$PBXPROJ_FILE.backup"
    echo -e "✓ Backed up project.pbxproj"
fi

# Update project.pbxproj
if [ -f "$PBXPROJ_FILE" ]; then
    sed -i '' "s/$CURRENT_BUNDLE_ID/$NEW_BUNDLE_ID/g" "$PBXPROJ_FILE"
    echo -e "✓ Updated project.pbxproj (4 occurrences)"
else
    echo -e "${RED}✗ project.pbxproj not found${NC}"
fi

# Update app.json if needed
APP_JSON="$PROJECT_ROOT/app.json"
if [ -f "$APP_JSON" ]; then
    if grep -q "bundleId" "$APP_JSON"; then
        sed -i '' "s/\"bundleId\": \".*\"/\"bundleId\": \"$NEW_BUNDLE_ID\"/g" "$APP_JSON"
        echo -e "✓ Updated app.json"
    fi
fi

# Check for Android bundle ID (for consistency)
ANDROID_BUILD_GRADLE="$PROJECT_ROOT/android/app/build.gradle"
if [ -f "$ANDROID_BUILD_GRADLE" ]; then
    echo -e "\n${YELLOW}Note:${NC} Android bundle ID should also be updated in:"
    echo "  $ANDROID_BUILD_GRADLE"
    echo "  Look for: applicationId"
fi

echo -e "\n${GREEN}=== Update Complete ===${NC}\n"
echo -e "Bundle ID changed from:"
echo -e "  ${RED}$CURRENT_BUNDLE_ID${NC}"
echo -e "to:"
echo -e "  ${GREEN}$NEW_BUNDLE_ID${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Open Xcode and verify the bundle ID in Signing & Capabilities"
echo "2. Update provisioning profiles in Apple Developer Portal"
echo "3. Configure code signing in Xcode"
echo "4. Update version number to 6.0.0 or higher"
echo "5. Build and archive for TestFlight"
echo ""
echo -e "${YELLOW}Backup created:${NC} $PBXPROJ_FILE.backup"
echo -e "\nFor detailed instructions, see: ${GREEN}IOS_DEPLOYMENT_GUIDE.md${NC}"
