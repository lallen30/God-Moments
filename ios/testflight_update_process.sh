#!/bin/bash

# Complete Build Process for TestFlight Update
echo "🚀 TestFlight Update Process for MIIN-Ojibwe"
echo "============================================"

echo ""
echo "📋 STEP-BY-STEP PROCESS:"
echo "========================"

echo ""
echo "1. 🧹 CLEAN METRO CACHE (JavaScript changes):"
echo "   cd /Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app"
echo "   npx react-native start --reset-cache"
echo "   (Let it start, then stop with Ctrl+C)"

echo ""
echo "2. 🔄 UPDATE POD DEPENDENCIES:"
echo "   cd ios"
echo "   pod install"

echo ""
echo "3. 🏗️  XCODE BUILD PROCESS:"
echo "   • Open Xcode"
echo "   • Select 'Generic iOS Device' or connected device (NOT simulator)"
echo "   • Product > Clean Build Folder"
echo "   • Product > Archive"
echo "   • Click 'Distribute App'"
echo "   • Select 'App Store Connect'"
echo "   • Select 'Upload'"
echo "   • Follow the upload wizard"

echo ""
echo "📱 CURRENT VERSION STATUS:"
echo "========================="
echo "• Version: 1.0.0 (2)"
echo "• Previous issues: ✅ Fixed (privacy permissions)"
echo "• Changes in this build:"
echo "  - ❌ Removed bottom tab navigation"
echo "  - ❌ Removed Contact page from side menu"
echo "  - ✅ Side drawer menu still intact"

echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "==================="
echo "• Build number should increment to 3 automatically"
echo "• If it doesn't, manually set CFBundleVersion to 3"
echo "• This build should process faster since privacy issues are fixed"
echo "• New build should appear as: MIIN-Ojibwe 1.0.0 (3)"

echo ""
echo "🎯 EXPECTED RESULT:"
echo "=================="
echo "• No bottom tabs on any screens except home (which never had them)"
echo "• Contact page removed from side menu"
echo "• All other functionality preserved"

echo ""
echo "✅ Ready to proceed with build!"
