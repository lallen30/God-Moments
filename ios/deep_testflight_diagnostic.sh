#!/bin/bash

# Deep TestFlight Upload Diagnostic Script
# Identifies why builds aren't appearing in TestFlight

set -e

echo "🔍 Deep TestFlight Upload Diagnostic"
echo "===================================="

PROJECT_ROOT="/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app"
cd "$PROJECT_ROOT/ios"

# 1. Check if bundle ID exists in App Store Connect
echo "📋 Bundle Identifier Analysis:"
BUNDLE_ID=$(grep 'PRODUCT_BUNDLE_IDENTIFIER' MIIN-Ojibwe.xcodeproj/project.pbxproj | head -1 | sed 's/.*= //g' | sed 's/;//g' | tr -d '"' | xargs)
echo "  Bundle ID: $BUNDLE_ID"

# 2. Check Xcode Organizer archives
echo ""
echo "📦 Recent Archives Check:"
ARCHIVES_PATH="$HOME/Library/Developer/Xcode/Archives"
if [ -d "$ARCHIVES_PATH" ]; then
    echo "  Recent MIIN-Ojibwe archives:"
    find "$ARCHIVES_PATH" -name "*MIIN-Ojibwe*" -type d -exec ls -la {} \; 2>/dev/null | head -5 || echo "  No MIIN-Ojibwe archives found"
    
    echo "  Recent archives (any):"
    find "$ARCHIVES_PATH" -name "*.xcarchive" -type d -exec ls -lt {} \; 2>/dev/null | head -3 || echo "  No recent archives found"
fi

# 3. Check for upload logs
echo ""
echo "📤 Upload Status Check:"
UPLOAD_LOGS="$HOME/Library/Developer/Shared/Documentation/DocC/Build/symbol-graphs"
if [ -d "$UPLOAD_LOGS" ]; then
    echo "  Upload logs directory exists"
else
    echo "  No upload logs found"
fi

# 4. Check code signing
echo ""
echo "🔐 Code Signing Verification:"
TEAM_ID=$(grep 'DEVELOPMENT_TEAM' MIIN-Ojibwe.xcodeproj/project.pbxproj | head -1 | sed 's/.*= //g' | sed 's/;//g' | tr -d '"' | xargs)
echo "  Development Team: $TEAM_ID"

CODE_SIGN_IDENTITY=$(grep 'CODE_SIGN_IDENTITY' MIIN-Ojibwe.xcodeproj/project.pbxproj | head -1 | sed 's/.*= //g' | sed 's/;//g' | tr -d '"' | xargs)
echo "  Code Sign Identity: $CODE_SIGN_IDENTITY"

# 5. Check for required app icons
echo ""
echo "🖼️  App Icons Check:"
ICONS_PATH="MIIN-Ojibwe/Images.xcassets/AppIcon.appiconset"
if [ -d "$ICONS_PATH" ]; then
    echo "  App icons directory exists"
    ICON_COUNT=$(find "$ICONS_PATH" -name "*.png" | wc -l)
    echo "  Number of icon files: $ICON_COUNT"
    if [ $ICON_COUNT -lt 3 ]; then
        echo "  ⚠️  Warning: Very few app icons found"
    fi
else
    echo "  ❌ App icons directory not found"
fi

# 6. Check for build errors in system logs
echo ""
echo "🚨 System Build Errors:"
echo "  Checking recent Xcode errors..."
log show --predicate 'process == "Xcode"' --last 1h --style compact 2>/dev/null | grep -i error | tail -3 || echo "  No recent Xcode errors found"

# 7. Check App Store Connect API status
echo ""
echo "🌐 App Store Connect Status:"
curl -s -I https://appstoreconnect.apple.com > /dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ App Store Connect is accessible"
else
    echo "  ⚠️  App Store Connect may be experiencing issues"
fi

echo ""
echo "🔍 COMMON REASONS BUILDS DON'T APPEAR:"
echo "====================================="
echo "1. ❌ Bundle ID doesn't match App Store Connect app"
echo "2. ❌ Invalid provisioning profile"
echo "3. ❌ Missing or invalid app icons"
echo "4. ❌ Binary validation failures"
echo "5. ❌ Export compliance issues"
echo "6. ❌ Code signing certificate problems"
echo "7. ❌ Upload interrupted or failed silently"
echo "8. ❌ App Store Connect processing delays"

echo ""
echo "🛠️  IMMEDIATE TROUBLESHOOTING STEPS:"
echo "=================================="
echo "1. 📧 Check email for rejection notifications"
echo "2. 🔍 Open Xcode > Window > Organizer > Archives"
echo "3. 📤 Check if upload shows 'Uploaded' status"
echo "4. 🌐 Log into App Store Connect manually:"
echo "   https://appstoreconnect.apple.com"
echo "5. 📱 Check TestFlight section specifically"
echo "6. 🔄 Try uploading again with verbose logging"

echo ""
echo "🔧 ALTERNATIVE UPLOAD METHOD:"
echo "============================"
echo "Try using Application Loader or altool:"
echo "  1. Archive the app"
echo "  2. Export as 'App Store Connect'"
echo "  3. Use altool command line:"
echo "     xcrun altool --upload-app --type ios --file YourApp.ipa \\"
echo "       --username your@email.com --password app-specific-password"

echo ""
echo "📋 VERIFICATION CHECKLIST:"
echo "========================="
echo "□ Bundle ID matches App Store Connect"
echo "□ Valid distribution certificate"
echo "□ Valid provisioning profile"
echo "□ All required app icons present"
echo "□ Export compliance setting correct"
echo "□ No build errors in archive"
echo "□ Upload completed successfully"
echo "□ Waited at least 30 minutes"

echo ""
echo "✨ Diagnostic complete!"
