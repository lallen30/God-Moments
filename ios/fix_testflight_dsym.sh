#!/bin/bash

# MIIN-Ojibwe Hermes dSYM Fix for TestFlight
# This script should be run AFTER building an archive in Xcode

echo "🎯 MIIN-Ojibwe Hermes dSYM Fix for TestFlight"
echo "=============================================="
echo ""
echo "INSTRUCTIONS:"
echo "1. Open Xcode"
echo "2. Open the MIIN-Ojibwe.xcworkspace file"
echo "3. Select 'Any iOS Device' as the destination"
echo "4. Go to Product > Archive"
echo "5. After the archive completes, run this script"
echo ""
echo "This script will fix the Hermes dSYM UUID issue: 096C19FA-605A-3466-A61B-35AB18279B13"
echo ""

read -p "Have you completed the archive in Xcode? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete the archive in Xcode first, then run this script."
    exit 1
fi

echo "🔍 Looking for recent archives..."

# Find the most recent archive
ARCHIVES_PATH="$HOME/Library/Developer/Xcode/Archives"
RECENT_ARCHIVE=$(find "$ARCHIVES_PATH" -name "*.xcarchive" -type d | head -1)

if [ -z "$RECENT_ARCHIVE" ]; then
    echo "❌ No archives found. Please create an archive in Xcode first."
    exit 1
fi

echo "✅ Found archive: $(basename "$RECENT_ARCHIVE")"

# Check for existing Hermes dSYM
DSYM_PATH="$RECENT_ARCHIVE/dSYMs"
HERMES_DSYM="$DSYM_PATH/hermes.framework.dSYM"

echo "🔍 Checking for Hermes dSYM..."
if [ -d "$HERMES_DSYM" ]; then
    echo "✅ Hermes dSYM already exists"
    echo "🔍 Checking UUID..."
    HERMES_DWARF="$HERMES_DSYM/Contents/Resources/DWARF/hermes"
    if [ -f "$HERMES_DWARF" ]; then
        CURRENT_UUID=$(dwarfdump --uuid "$HERMES_DWARF" | head -1 | awk '{print $2}')
        echo "📋 Current UUID: $CURRENT_UUID"
        echo "📋 Target UUID:  096C19FA-605A-3466-A61B-35AB18279B13"
        if [ "$CURRENT_UUID" = "096C19FA-605A-3466-A61B-35AB18279B13" ]; then
            echo "✅ UUID matches! No action needed."
            exit 0
        fi
    fi
fi

# Find Hermes framework in the archive
echo "🔍 Looking for Hermes framework in archive..."
HERMES_FRAMEWORK=$(find "$RECENT_ARCHIVE" -name "hermes.framework" -type d | head -1)

if [ -z "$HERMES_FRAMEWORK" ]; then
    echo "❌ hermes.framework not found in archive"
    echo "🔍 This might be a simulator build. Please archive for 'Any iOS Device'"
    exit 1
fi

echo "✅ Found Hermes framework: $(basename "$HERMES_FRAMEWORK")"

# Create or update Hermes dSYM
echo "🔧 Creating/updating Hermes dSYM..."
mkdir -p "$HERMES_DSYM/Contents/Resources/DWARF"

# Copy Hermes binary
HERMES_BINARY="$HERMES_FRAMEWORK/hermes"
if [ ! -f "$HERMES_BINARY" ]; then
    echo "❌ Hermes binary not found"
    exit 1
fi

cp "$HERMES_BINARY" "$HERMES_DSYM/Contents/Resources/DWARF/hermes"

# Create Info.plist
cat > "$HERMES_DSYM/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>English</string>
    <key>CFBundleIdentifier</key>
    <string>com.apple.xcode.dsym.hermes.framework</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundlePackageType</key>
    <string>dSYM</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
</dict>
</plist>
EOF

echo "✅ Created Hermes dSYM"

# Verify the dSYM
echo "🔍 Verifying dSYM..."
HERMES_DWARF="$HERMES_DSYM/Contents/Resources/DWARF/hermes"
if [ -f "$HERMES_DWARF" ]; then
    NEW_UUID=$(dwarfdump --uuid "$HERMES_DWARF" | head -1 | awk '{print $2}')
    echo "📋 New UUID: $NEW_UUID"
else
    echo "❌ Failed to create dSYM properly"
    exit 1
fi

# List all dSYMs
echo ""
echo "📋 All dSYMs in archive:"
ls -la "$DSYM_PATH"/*.dSYM 2>/dev/null || echo "No dSYMs found"

echo ""
echo "✅ Hermes dSYM fix completed!"
echo "🎯 Your archive is now ready for TestFlight upload with the correct Hermes dSYM."
echo ""
echo "Next steps:"
echo "1. Go back to Xcode Organizer"
echo "2. Select your archive"
echo "3. Click 'Distribute App'"
echo "4. Follow the TestFlight upload process"
echo ""
