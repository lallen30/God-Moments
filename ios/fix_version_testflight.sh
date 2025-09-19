#!/bin/bash

# Fix Version and Build Numbers for First TestFlight Submission
# This script ensures all version numbers are set to 1.0.0 (1)

set -e

echo "🔧 Fixing version and build numbers for first TestFlight submission..."

# Define paths
PROJECT_ROOT="/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app"
PBXPROJ_PATH="$PROJECT_ROOT/ios/MIIN-Ojibwe.xcodeproj/project.pbxproj"
INFO_PLIST_PATH="$PROJECT_ROOT/ios/MIIN-Ojibwe/Info.plist"
PACKAGE_JSON_PATH="$PROJECT_ROOT/package.json"

echo "📱 Setting all versions to 1.0.0 (1)..."

# 1. Update package.json
echo "📦 Updating package.json..."
if [ -f "$PACKAGE_JSON_PATH" ]; then
    sed -i '' 's/"version": "[^"]*"/"version": "1.0.0"/' "$PACKAGE_JSON_PATH"
    echo "✅ package.json version set to 1.0.0"
else
    echo "❌ package.json not found!"
fi

# 2. Update Info.plist
echo "📄 Updating Info.plist..."
if [ -f "$INFO_PLIST_PATH" ]; then
    # Update CFBundleShortVersionString
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString 1.0.0" "$INFO_PLIST_PATH" 2>/dev/null || \
    /usr/libexec/PlistBuddy -c "Add :CFBundleShortVersionString string 1.0.0" "$INFO_PLIST_PATH"
    
    # Update CFBundleVersion
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion 1" "$INFO_PLIST_PATH" 2>/dev/null || \
    /usr/libexec/PlistBuddy -c "Add :CFBundleVersion string 1" "$INFO_PLIST_PATH"
    
    echo "✅ Info.plist versions set to 1.0.0 (1)"
else
    echo "❌ Info.plist not found!"
fi

# 3. Update project.pbxproj
echo "🏗️ Updating project.pbxproj..."
if [ -f "$PBXPROJ_PATH" ]; then
    # Update MARKETING_VERSION
    sed -i '' 's/MARKETING_VERSION = [^;]*/MARKETING_VERSION = 1.0.0/' "$PBXPROJ_PATH"
    
    # Update CURRENT_PROJECT_VERSION
    sed -i '' 's/CURRENT_PROJECT_VERSION = [^;]*/CURRENT_PROJECT_VERSION = 1/' "$PBXPROJ_PATH"
    
    echo "✅ project.pbxproj versions set to 1.0.0 (1)"
else
    echo "❌ project.pbxproj not found!"
fi

# 4. Clean build artifacts
echo "🧹 Cleaning build artifacts..."
cd "$PROJECT_ROOT/ios"

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/MIIN-Ojibwe-* 2>/dev/null || true

# Clean Xcode build folder
xcodebuild -workspace MIIN-Ojibwe.xcworkspace -scheme MIIN-Ojibwe clean

echo "✅ Build artifacts cleaned"

# 5. Verify the settings
echo "🔍 Verifying version settings..."

echo "📦 package.json version:"
grep '"version"' "$PACKAGE_JSON_PATH" || true

echo "📄 Info.plist versions:"
/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$INFO_PLIST_PATH" 2>/dev/null || echo "CFBundleShortVersionString not found"
/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST_PATH" 2>/dev/null || echo "CFBundleVersion not found"

echo "🏗️ Xcode build settings:"
xcodebuild -workspace MIIN-Ojibwe.xcworkspace -scheme MIIN-Ojibwe -showBuildSettings 2>/dev/null | grep -E "(MARKETING_VERSION|CURRENT_PROJECT_VERSION)" | head -2

echo ""
echo "✨ Version fix complete! All versions should now be 1.0.0 (1)"
echo ""
echo "📋 Next steps:"
echo "1. Archive the app in Xcode (Product > Archive)"
echo "2. Use 'Distribute App' to upload to App Store Connect"
echo "3. The build should appear as version 1.0.0 (1) in TestFlight"
echo ""
echo "⚠️ Important: Do NOT use automated build scripts that might increment the version"
