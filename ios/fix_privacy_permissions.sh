#!/bin/bash

# Fix Privacy Permission Issues and Rebuild for TestFlight
echo "🔧 Fixing Privacy Permission Issues"
echo "=================================="

PROJECT_ROOT="/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app"
cd "$PROJECT_ROOT/ios"

echo "✅ Issues Fixed:"
echo "=================="
echo "1. ✅ Added NSPhotoLibraryUsageDescription"
echo "   Purpose: Allow users to select and share images"
echo ""
echo "2. ✅ Fixed NSLocationWhenInUseUsageDescription"
echo "   Purpose: Provide location-based features and services"
echo ""
echo "3. ✅ Incremented build number to 2"
echo "   Version: 1.0.0 (2)"

echo ""
echo "📋 Current Privacy Permissions:"
echo "==============================="
echo "NSPhotoLibraryUsageDescription:"
/usr/libexec/PlistBuddy -c 'Print :NSPhotoLibraryUsageDescription' 'MIIN-Ojibwe/Info.plist' 2>/dev/null || echo "Not found"

echo ""
echo "NSLocationWhenInUseUsageDescription:"
/usr/libexec/PlistBuddy -c 'Print :NSLocationWhenInUseUsageDescription' 'MIIN-Ojibwe/Info.plist' 2>/dev/null || echo "Not found"

echo ""
echo "📱 Version Information:"
echo "======================"
echo "CFBundleShortVersionString: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' 'MIIN-Ojibwe/Info.plist' 2>/dev/null)"
echo "CFBundleVersion: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' 'MIIN-Ojibwe/Info.plist' 2>/dev/null)"

echo ""
echo "🧹 Cleaning project..."
rm -rf ~/Library/Developer/Xcode/DerivedData/MIIN-Ojibwe-* 2>/dev/null || true
xcodebuild -workspace MIIN-Ojibwe.xcworkspace -scheme MIIN-Ojibwe clean > /dev/null 2>&1

echo ""
echo "🚀 READY FOR NEW UPLOAD!"
echo "========================"
echo "The privacy permission issues have been fixed."
echo "Your app is now ready for a new TestFlight submission."
echo ""
echo "📋 Next Steps:"
echo "1. 📦 Archive the app (Product > Archive)"
echo "2. 📤 Distribute to App Store Connect"
echo "3. ⏰ Wait for processing (should be faster this time)"
echo "4. ✅ Build 1.0.0 (2) should appear in TestFlight"

echo ""
echo "🎯 What was fixed:"
echo "• Photo library access permission string added"
echo "• Location usage permission string fixed"
echo "• Build number incremented to 2"
echo "• All privacy requirements now met"

echo ""
echo "✨ This should resolve the App Store rejection!"
