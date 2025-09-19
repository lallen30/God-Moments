#!/bin/bash

# Script to fix Hermes dSYM issues for iOS Archive
# This script ensures that Hermes framework dSYM files are properly included in the archive

set -e

ARCHIVE_PATH="$1"
if [ -z "$ARCHIVE_PATH" ]; then
    echo "Usage: $0 <path-to-archive>"
    echo "Example: $0 ./build/LAReactNative.xcarchive"
    exit 1
fi

echo "🔍 Looking for Hermes dSYM files..."

# Find Hermes framework in the archive
HERMES_FRAMEWORK_PATH=$(find "$ARCHIVE_PATH" -name "hermes.framework" -type d | head -1)

if [ -z "$HERMES_FRAMEWORK_PATH" ]; then
    echo "❌ Hermes framework not found in archive"
    exit 1
fi

echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK_PATH"

# Check if dSYM already exists in archive
ARCHIVE_DSYM_PATH="$ARCHIVE_PATH/dSYMs/hermes.framework.dSYM"

if [ -d "$ARCHIVE_DSYM_PATH" ]; then
    echo "✅ Hermes dSYM already exists in archive at: $ARCHIVE_DSYM_PATH"
    HERMES_DSYM_PATH="$ARCHIVE_DSYM_PATH"
else
    # Find the corresponding dSYM file in Pods
    HERMES_DSYM_PATH=$(find ./Pods -name "hermes.framework.dSYM" -type d | head -1)

    if [ -z "$HERMES_DSYM_PATH" ]; then
        echo "🔧 Hermes dSYM not found in Pods, generating from framework..."
        
        # Create dSYMs directory if it doesn't exist
        DSYMS_DIR="$ARCHIVE_PATH/dSYMs"
        mkdir -p "$DSYMS_DIR"
        
        # Generate dSYM from the framework binary
        HERMES_BINARY="$HERMES_FRAMEWORK_PATH/hermes"
        if [ -f "$HERMES_BINARY" ]; then
            echo "📋 Generating Hermes dSYM from binary..."
            dsymutil "$HERMES_BINARY" -o "$ARCHIVE_DSYM_PATH"
            HERMES_DSYM_PATH="$ARCHIVE_DSYM_PATH"
            echo "✅ Generated Hermes dSYM at: $HERMES_DSYM_PATH"
        else
            echo "❌ Hermes binary not found at: $HERMES_BINARY"
            exit 1
        fi
    else
        echo "✅ Found Hermes dSYM at: $HERMES_DSYM_PATH"
        
        # Create dSYMs directory if it doesn't exist
        DSYMS_DIR="$ARCHIVE_PATH/dSYMs"
        mkdir -p "$DSYMS_DIR"
        
        # Copy the dSYM file to the archive
        echo "📋 Copying Hermes dSYM to archive..."
        cp -R "$HERMES_DSYM_PATH" "$DSYMS_DIR/"
        HERMES_DSYM_PATH="$ARCHIVE_DSYM_PATH"
    fi
fi

# Verify the dSYM file
echo "🔍 Verifying Hermes dSYM..."
if [ -d "$HERMES_DSYM_PATH" ]; then
    echo "✅ Hermes dSYM verified successfully!"
    
    # Check UUID if dwarfdump is available
    if command -v dwarfdump &> /dev/null; then
        echo "🔍 Checking dSYM UUID..."
        dwarfdump --uuid "$HERMES_DSYM_PATH" | grep hermes || echo "⚠️  Could not verify UUID"
    fi
else
    echo "❌ Hermes dSYM verification failed"
    exit 1
fi

echo "📁 Archive dSYMs location: $ARCHIVE_PATH/dSYMs"

# List all dSYM files in the archive
echo "📋 All dSYM files in archive:"
ls -la "$ARCHIVE_PATH/dSYMs/"

echo "🎉 Hermes dSYM fix completed!" 