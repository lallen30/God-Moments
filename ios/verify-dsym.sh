#!/bin/bash

# Script to verify dSYM files are properly generated
ARCHIVE_PATH="$1"

if [ -z "$ARCHIVE_PATH" ]; then
    echo "Usage: $0 <path-to-archive>"
    echo "Example: $0 /Users/lallen30/Library/Developer/Xcode/Archives/2024-06-30/LAReactNative.xcarchive"
    exit 1
fi

echo "🔍 Verifying dSYM files in archive: $ARCHIVE_PATH"

# Check if dSYMs folder exists
if [ ! -d "$ARCHIVE_PATH/dSYMs" ]; then
    echo "❌ dSYMs folder not found"
    exit 1
fi

echo "✅ dSYMs folder found"

# List all dSYM files
echo "📋 Found dSYM files:"
ls -la "$ARCHIVE_PATH/dSYMs/"

# Check for Hermes dSYM specifically
HERMES_DSYM="$ARCHIVE_PATH/dSYMs/hermes.framework.dSYM"
if [ -d "$HERMES_DSYM" ]; then
    echo "✅ Hermes dSYM found"
    
    # Get UUIDs
    HERMES_FRAMEWORK=$(find "$ARCHIVE_PATH" -name "hermes.framework" -type d | head -1)
    if [ -n "$HERMES_FRAMEWORK" ]; then
        FRAMEWORK_UUID=$(dwarfdump --uuid "$HERMES_FRAMEWORK/hermes" 2>/dev/null | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
        DSYM_UUID=$(dwarfdump --uuid "$HERMES_DSYM" 2>/dev/null | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
        
        echo "🔍 Framework UUID: $FRAMEWORK_UUID"
        echo "🔍 dSYM UUID: $DSYM_UUID"
        
        if [ "$FRAMEWORK_UUID" = "$DSYM_UUID" ]; then
            echo "✅ UUIDs match - Hermes dSYM is valid"
        else
            echo "❌ UUIDs don't match - Hermes dSYM is invalid"
            exit 1
        fi
    fi
else
    echo "❌ Hermes dSYM not found"
    exit 1
fi

echo "🎉 All dSYM files verified successfully!" 