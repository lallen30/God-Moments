#!/bin/bash

# Script to fix Hermes dSYM issues for Xcode Organizer archives
# This script finds the latest archive in Xcode's archive folder and fixes the dSYM issue

set -e

echo "🔍 Looking for latest Xcode archive..."

# Find the latest archive in Xcode's archive folder
ARCHIVE_PATH=$(find ~/Library/Developer/Xcode/Archives -name "*.xcarchive" -type d | sort | tail -1)

if [ -z "$ARCHIVE_PATH" ]; then
    echo "❌ No archives found in Xcode Archives folder"
    echo "Please create an archive first using Product → Archive in Xcode"
    exit 1
fi

echo "✅ Found archive: $ARCHIVE_PATH"

# Check if Hermes dSYM already exists
if [ -d "$ARCHIVE_PATH/dSYMs/hermes.framework.dSYM" ]; then
    echo "✅ Hermes dSYM already exists in archive"
    exit 0
fi

echo "🔧 Hermes dSYM not found, generating from framework..."

# Find Hermes framework in the archive
HERMES_FRAMEWORK_PATH=$(find "$ARCHIVE_PATH" -name "hermes.framework" -type d | head -1)

if [ -z "$HERMES_FRAMEWORK_PATH" ]; then
    echo "❌ Hermes framework not found in archive"
    exit 1
fi

echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK_PATH"

# Generate dSYM from the framework
echo "📋 Generating Hermes dSYM from binary..."
dsymutil "$HERMES_FRAMEWORK_PATH/hermes" -o "$ARCHIVE_PATH/dSYMs/hermes.framework.dSYM"

# Verify the dSYM was created
if [ -d "$ARCHIVE_PATH/dSYMs/hermes.framework.dSYM" ]; then
    echo "✅ Hermes dSYM generated successfully!"
    echo "📁 Location: $ARCHIVE_PATH/dSYMs/hermes.framework.dSYM"
    
    # Show UUID for verification
    echo "🔍 Verifying UUID..."
    dwarfdump --uuid "$ARCHIVE_PATH/dSYMs/hermes.framework.dSYM"
else
    echo "❌ Failed to generate Hermes dSYM"
    exit 1
fi

echo "🎉 Archive dSYM fix completed!"
echo "📱 You can now upload this archive to App Store Connect" 