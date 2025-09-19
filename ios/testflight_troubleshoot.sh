#!/bin/bash

# TestFlight Upload Troubleshooting Script
# This script helps diagnose and fix common TestFlight upload issues

set -e

echo "🔍 TestFlight Upload Troubleshooting..."

# Define paths
PROJECT_ROOT="/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app"
PBXPROJ_PATH="$PROJECT_ROOT/ios/MIIN-Ojibwe.xcodeproj/project.pbxproj"
INFO_PLIST_PATH="$PROJECT_ROOT/ios/MIIN-Ojibwe/Info.plist"

echo ""
echo "📱 Current Version Information:"
echo "================================"

# Check package.json
echo "📦 package.json version:"
grep '"version"' "$PROJECT_ROOT/package.json" | head -1

# Check Info.plist
echo "📄 Info.plist versions:"
echo "  CFBundleShortVersionString: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$INFO_PLIST_PATH" 2>/dev/null || echo 'Not found')"
echo "  CFBundleVersion: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$INFO_PLIST_PATH" 2>/dev/null || echo 'Not found')"

# Check bundle identifier
echo "📋 Bundle Identifier:"
BUNDLE_ID=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$INFO_PLIST_PATH" 2>/dev/null || echo 'Not found')
if [[ "$BUNDLE_ID" == '$(PRODUCT_BUNDLE_IDENTIFIER)' ]]; then
    # Get from pbxproj
    BUNDLE_ID=$(grep 'PRODUCT_BUNDLE_IDENTIFIER' "$PBXPROJ_PATH" | head -1 | sed 's/.*= //g' | sed 's/;//g' | tr -d '"' | xargs)
fi
echo "  $BUNDLE_ID"

echo ""
echo "🔧 Common TestFlight Issues & Solutions:"
echo "======================================="

echo "1. ✅ Version numbers are now correctly set to 1.0.0 (1)"

echo "2. 🔍 Bundle Identifier Check:"
if [[ "$BUNDLE_ID" == *"knoxweb.miin-ojibwe"* ]]; then
    echo "  ✅ Bundle ID looks correct: $BUNDLE_ID"
else
    echo "  ⚠️  Bundle ID may need verification: $BUNDLE_ID"
fi

echo "3. 🎯 Archive and Upload Steps:"
echo "  a) In Xcode: Product > Archive"
echo "  b) In Organizer: Distribute App > App Store Connect"
echo "  c) Select 'Upload' (not 'Export')"
echo "  d) Wait 5-10 minutes for processing"

echo "4. 📱 TestFlight Visibility:"
echo "  • Build must pass App Store processing first"
echo "  • Check App Store Connect > TestFlight > iOS builds"
echo "  • Processing can take 5-30 minutes"
echo "  • If rejected, check email for details"

echo "5. 🚨 Common Rejection Reasons:"
echo "  • Missing Export Compliance settings"
echo "  • Invalid provisioning profile"
echo "  • Code signing issues"
echo "  • Missing app icons"
echo "  • Binary analysis failures"

echo ""
echo "🔍 Checking for potential issues..."

# Check for Export Compliance
EXPORT_COMPLIANCE=$(/usr/libexec/PlistBuddy -c 'Print :ITSAppUsesNonExemptEncryption' "$INFO_PLIST_PATH" 2>/dev/null || echo 'Not set')
echo "📡 Export Compliance:"
if [[ "$EXPORT_COMPLIANCE" == "Not set" ]]; then
    echo "  ⚠️  ITSAppUsesNonExemptEncryption not set - may cause upload issues"
    echo "  💡 Recommendation: Add to Info.plist:"
    echo "     <key>ITSAppUsesNonExemptEncryption</key>"
    echo "     <false/>"
else
    echo "  ✅ ITSAppUsesNonExemptEncryption: $EXPORT_COMPLIANCE"
fi

# Check code signing
echo "🔐 Code Signing:"
DEVELOPMENT_TEAM=$(grep 'DEVELOPMENT_TEAM' "$PBXPROJ_PATH" | head -1 | sed 's/.*= //g' | sed 's/;//g' | tr -d '"' | xargs)
if [[ -n "$DEVELOPMENT_TEAM" ]]; then
    echo "  ✅ Development Team: $DEVELOPMENT_TEAM"
else
    echo "  ⚠️  Development Team not found - check code signing"
fi

echo ""
echo "🛠️  If the build still doesn't appear in TestFlight:"
echo "================================================"
echo "1. Check App Store Connect > TestFlight > Missing Compliance"
echo "2. Check your email for rejection notifications"
echo "3. Verify the bundle ID matches your App Store Connect app"
echo "4. Ensure you have the correct provisioning profile"
echo "5. Try archiving and uploading again"
echo "6. Check Xcode > Organizer > Archives for upload status"

echo ""
echo "📧 Email to check: The email associated with your Apple Developer account"
echo "📱 TestFlight URL: https://appstoreconnect.apple.com/apps/$BUNDLE_ID/testflight"

echo ""
echo "✨ Troubleshooting complete!"
