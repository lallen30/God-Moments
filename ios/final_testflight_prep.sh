#!/bin/bash

# Final TestFlight Submission Script
# Run this before archiving and uploading to TestFlight

set -e

echo "🚀 Final TestFlight Submission Preparation"
echo "========================================"

PROJECT_ROOT="/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app"
cd "$PROJECT_ROOT/ios"

echo "✅ All fixes applied:"
echo "  • Version set to 1.0.0 (1)"
echo "  • Bundle ID: com.knoxweb.miin-ojibwe"
echo "  • Export compliance added"
echo "  • Project renamed to MIIN-Ojibwe"
echo "  • Hermes dSYM scripts created"

echo ""
echo "📋 Current Status:"
echo "  📦 package.json: $(grep '"version"' "$PROJECT_ROOT/package.json" | cut -d'"' -f4)"
echo "  📄 CFBundleShortVersionString: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' 'MIIN-Ojibwe/Info.plist')"
echo "  📄 CFBundleVersion: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' 'MIIN-Ojibwe/Info.plist')"
echo "  🔐 Export Compliance: $(/usr/libexec/PlistBuddy -c 'Print :ITSAppUsesNonExemptEncryption' 'MIIN-Ojibwe/Info.plist')"

echo ""
echo "🎯 NEXT STEPS FOR TESTFLIGHT SUBMISSION:"
echo "======================================="
echo "1. 📱 Open Xcode"
echo "2. 🏗️  Select 'Generic iOS Device' or a connected device (NOT simulator)"
echo "3. 📦 Product > Archive"
echo "4. 📤 In Organizer: Distribute App > App Store Connect"
echo "5. ⬆️  Select 'Upload' (NOT Export)"
echo "6. ✅ Follow the upload wizard"
echo "7. ⏰ Wait 5-30 minutes for processing"
echo "8. 📧 Check your email for any issues"
echo "9. 🧪 Check App Store Connect > TestFlight > iOS"

echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "======================="
echo "• The build should now appear as MIIN-Ojibwe 1.0.0 (1)"
echo "• Do NOT use any automated version incrementing"
echo "• If the build number changes, re-run ./fix_version_testflight.sh"
echo "• If Hermes crashes occur, run ./fix_testflight_dsym.sh after upload"

echo ""
echo "🔗 Helpful Links:"
echo "==============="
echo "• App Store Connect: https://appstoreconnect.apple.com"
echo "• TestFlight: https://appstoreconnect.apple.com/apps/testflight"

echo ""
echo "✨ Ready for TestFlight submission!"
