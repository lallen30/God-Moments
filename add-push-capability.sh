#!/bin/bash

# Add Push Notifications Capability to Xcode Project
# This script programmatically adds the Push Notifications capability

echo "🔧 Adding Push Notifications Capability to Xcode Project..."
echo "==========================================================="

PROJECT_PATH="ios/LAReactNative.xcodeproj/project.pbxproj"
ENTITLEMENTS_PATH="ios/LAReactNative/LAReactNative.entitlements"

# Backup the project file
cp "$PROJECT_PATH" "$PROJECT_PATH.backup"
echo "✅ Created backup: $PROJECT_PATH.backup"

# Check if push notifications capability already exists
if grep -q "com.apple.developer.aps-environment" "$PROJECT_PATH"; then
    echo "✅ Push Notifications capability already exists"
    exit 0
fi

# Create entitlements file if it doesn't exist
if [ ! -f "$ENTITLEMENTS_PATH" ]; then
    echo "📝 Creating entitlements file..."
    cat > "$ENTITLEMENTS_PATH" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.aps-environment</key>
	<string>development</string>
</dict>
</plist>
EOF
    echo "✅ Created entitlements file: $ENTITLEMENTS_PATH"
fi

# Add entitlements file reference to project
echo "🔧 Adding entitlements file to Xcode project..."

# Find the main target UUID
TARGET_UUID=$(grep -A5 "isa = PBXNativeTarget" "$PROJECT_PATH" | grep -E "name = LAReactNative" -B2 | head -1 | sed 's/[[:space:]]*\([A-Z0-9]*\).*/\1/')

if [ -z "$TARGET_UUID" ]; then
    echo "❌ Could not find target UUID"
    exit 1
fi

echo "   Target UUID: $TARGET_UUID"

# Add entitlements to build settings
perl -i -pe "
    if (/buildSettings = \{/ .. /\};/) {
        if (/INFOPLIST_FILE = /) {
            \$_ .= qq(\t\t\t\tCODE_SIGN_ENTITLEMENTS = LAReactNative/LAReactNative.entitlements;\n);
        }
    }
" "$PROJECT_PATH"

# Add entitlements file to file references
ENTITLEMENTS_FILE_UUID=$(uuidgen | tr '[:lower:]' '[:upper:]' | tr -d '-' | cut -c1-24)
ENTITLEMENTS_BUILD_UUID=$(uuidgen | tr '[:lower:]' '[:upper:]' | tr -d '-' | cut -c1-24)

# Add file reference
perl -i -pe "
    if (/\/\* Begin PBXFileReference section \*\//) {
        \$_ .= qq(\t\t$ENTITLEMENTS_FILE_UUID /* LAReactNative.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; name = LAReactNative.entitlements; path = LAReactNative/LAReactNative.entitlements; sourceTree = \"<group>\"; };\n);
    }
" "$PROJECT_PATH"

# Add to group
perl -i -pe "
    if (/name = LAReactNative;/ .. /\);/) {
        if (/children = \(/) {
            \$_ .= qq(\t\t\t\t$ENTITLEMENTS_FILE_UUID /* LAReactNative.entitlements */,\n);
        }
    }
" "$PROJECT_PATH"

echo "✅ Added entitlements configuration to project"

# Clean and rebuild
echo "🧹 Cleaning iOS build..."
cd ios && xcodebuild clean -workspace LAReactNative.xcworkspace -scheme LAReactNative >/dev/null 2>&1
cd ..

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Open Xcode: open ios/LAReactNative.xcworkspace"
echo "2. Select the LAReactNative target"
echo "3. Go to 'Signing & Capabilities' tab"
echo "4. Verify that 'Push Notifications' capability appears"
echo "5. If not, click '+' and add 'Push Notifications' manually"
echo "6. Rebuild and test the app"
echo ""
echo "Or run: npm run ios"
