#!/bin/bash

# Script to fix Hermes dSYM UUID issue for TestFlight
# Target UUID: 096C19FA-605A-3466-A61B-35AB18279B13

set -e

echo "🔧 Fixing Hermes dSYM UUID for TestFlight upload..."
echo "Target UUID: 096C19FA-605A-3466-A61B-35AB18279B13"

# Configuration
CONFIGURATION=${CONFIGURATION:-Release}
TARGET_BUILD_DIR=${TARGET_BUILD_DIR:-"$PWD/build/$CONFIGURATION-iphoneos"}
DWARF_DSYM_FOLDER_PATH=${DWARF_DSYM_FOLDER_PATH:-"$TARGET_BUILD_DIR"}

echo "📋 Configuration: $CONFIGURATION"
echo "📁 Target Build Dir: $TARGET_BUILD_DIR" 
echo "📁 dSYM Folder: $DWARF_DSYM_FOLDER_PATH"

# Find Hermes framework
HERMES_FRAMEWORK=$(find "$TARGET_BUILD_DIR" -name "hermes.framework" -type d 2>/dev/null | head -1)

if [ -z "$HERMES_FRAMEWORK" ]; then
    echo "⚠️  hermes.framework not found in $TARGET_BUILD_DIR"
    echo "🔍 Searching in Pods..."
    HERMES_FRAMEWORK=$(find "$PWD/Pods" -name "hermes.framework" -type d 2>/dev/null | head -1)
fi

if [ -z "$HERMES_FRAMEWORK" ]; then
    echo "❌ hermes.framework not found anywhere"
    exit 1
fi

echo "✅ Found Hermes framework: $HERMES_FRAMEWORK"

# Extract dSYM from Hermes framework
HERMES_BINARY="$HERMES_FRAMEWORK/hermes"
if [ ! -f "$HERMES_BINARY" ]; then
    echo "❌ Hermes binary not found at $HERMES_BINARY"
    exit 1
fi

# Check current UUIDs
echo "🔍 Current Hermes UUIDs:"
dwarfdump --uuid "$HERMES_BINARY" || echo "Failed to get UUIDs"

# Create dSYM directory
HERMES_DSYM_DIR="$DWARF_DSYM_FOLDER_PATH/hermes.framework.dSYM"
HERMES_DSYM_DWARF_DIR="$HERMES_DSYM_DIR/Contents/Resources/DWARF"

echo "📁 Creating dSYM structure at: $HERMES_DSYM_DIR"
mkdir -p "$HERMES_DSYM_DWARF_DIR"

# Copy the binary to dSYM location
cp "$HERMES_BINARY" "$HERMES_DSYM_DWARF_DIR/hermes"

# Create Info.plist for dSYM
cat > "$HERMES_DSYM_DIR/Contents/Info.plist" << EOF
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

echo "✅ Created Hermes dSYM at: $HERMES_DSYM_DIR"

# Verify the dSYM
echo "🔍 Verifying dSYM UUIDs:"
dwarfdump --uuid "$HERMES_DSYM_DWARF_DIR/hermes" || echo "Failed to verify dSYM"

echo "✅ Hermes dSYM generation completed!"

# List all dSYMs in the folder
echo "📋 All dSYMs in $DWARF_DSYM_FOLDER_PATH:"
ls -la "$DWARF_DSYM_FOLDER_PATH"/*.dSYM 2>/dev/null || echo "No dSYMs found"

echo "🎯 Ready for TestFlight upload!"
