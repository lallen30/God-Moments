#!/bin/bash

# Script to increment build number for new archives
# Usage: ./increment-build.sh [version_type]
# version_type can be: patch (default), minor, major

set -e

# Default to patch increment
VERSION_TYPE=${1:-patch}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Calculate next version
case $VERSION_TYPE in
  major)
    NEXT_VERSION=$(node -p "
      const v = require('./package.json').version.split('.').map(Number);
      \`\${v[0] + 1}.0.0\`;
    ")
    ;;
  minor)
    NEXT_VERSION=$(node -p "
      const v = require('./package.json').version.split('.').map(Number);
      \`\${v[0]}.\${v[1] + 1}.0\`;
    ")
    ;;
  patch)
    NEXT_VERSION=$(node -p "
      const v = require('./package.json').version.split('.').map(Number);
      \`\${v[0]}.\${v[1]}.\${v[2] + 1}\`;
    ")
    ;;
  *)
    echo "Invalid version type. Use: patch, minor, or major"
    exit 1
    ;;
esac

echo "🚀 Updating version from $CURRENT_VERSION to $NEXT_VERSION"

# Run the update-version script
npm run update-version $NEXT_VERSION

echo "✅ Version updated successfully!"
echo "📱 Current version: $NEXT_VERSION"

# Get build numbers
IOS_BUILD=$(grep -A1 "CFBundleVersion" ios/MIIN-Ojibwe/Info.plist | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
ANDROID_BUILD=$(grep "versionCode" android/app/build.gradle | sed 's/.*versionCode \([0-9]*\).*/\1/')

echo "🍎 iOS build number: $IOS_BUILD"
echo "🤖 Android build number: $ANDROID_BUILD"
echo ""
echo "💡 Ready for archive! The version and build numbers have been automatically updated."
