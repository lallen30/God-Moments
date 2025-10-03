#!/bin/bash
# Verify if church_bell.caf is in the app bundle after building

echo "=== Verifying Sound File in App Bundle ==="
echo ""

# Check if build exists
BUILD_DIR="ios/build/Build/Products"

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ No build directory found at: $BUILD_DIR"
    echo ""
    echo "You need to build the app first:"
    echo "1. Open Xcode: open ios/GodMoments.xcworkspace"
    echo "2. Clean Build Folder: Shift+Cmd+K"
    echo "3. Build: Cmd+B"
    echo "4. Run on iPhone: Cmd+R"
    exit 1
fi

# Find the app bundle
APP_BUNDLE=$(find "$BUILD_DIR" -name "GodMoments.app" -type d | head -1)

if [ -z "$APP_BUNDLE" ]; then
    echo "❌ GodMoments.app bundle not found in build directory"
    echo ""
    echo "Build the app first in Xcode"
    exit 1
fi

echo "✅ Found app bundle: $APP_BUNDLE"
echo ""

# Check for sound file
if [ -f "$APP_BUNDLE/church_bell.caf" ]; then
    echo "✅ SUCCESS! church_bell.caf IS in the app bundle!"
    echo ""
    ls -lh "$APP_BUNDLE/church_bell.caf"
    echo ""
    echo "File info:"
    afinfo "$APP_BUNDLE/church_bell.caf" | grep -E "duration|format|Hz"
    echo ""
    echo "🎉 The sound file is properly bundled."
    echo "If you're still hearing default sound:"
    echo "1. Make sure you DELETED the old app from iPhone"
    echo "2. Make sure you REINSTALLED the new build"
    echo "3. Check iPhone is not in silent mode"
else
    echo "❌ PROBLEM: church_bell.caf is NOT in the app bundle!"
    echo ""
    echo "The file is missing from: $APP_BUNDLE"
    echo ""
    echo "FIX THIS:"
    echo "1. In Xcode, select the church_bell.caf file in the left sidebar"
    echo "2. In the right panel (File Inspector), check 'Target Membership'"
    echo "3. Make sure 'GodMoments' is CHECKED"
    echo "4. Clean Build Folder (Shift+Cmd+K)"
    echo "5. Build again (Cmd+B)"
    echo ""
    echo "Files currently in app bundle:"
    ls -1 "$APP_BUNDLE" | grep -E "\.(caf|wav|aiff|m4a)$" || echo "  No audio files found"
fi
