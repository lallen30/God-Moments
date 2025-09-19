#!/bin/bash

# Script to fix the product name in Xcode project
echo "🔧 Updating Xcode project product name..."

PROJECT_FILE="ios/LAReactNative.xcodeproj/project.pbxproj"

if [[ ! -f "$PROJECT_FILE" ]]; then
    echo "❌ Project file not found: $PROJECT_FILE"
    exit 1
fi

# Backup the original file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
echo "✅ Created backup of project file"

# Update PRODUCT_NAME from LAReactNative to MIIN-Ojibwe
sed -i '' 's/PRODUCT_NAME = LAReactNative;/PRODUCT_NAME = "MIIN-Ojibwe";/g' "$PROJECT_FILE"

# Also update any other references that might affect the archive name
sed -i '' 's/PRODUCT_NAME = "$(TARGET_NAME)";/PRODUCT_NAME = "MIIN-Ojibwe";/g' "$PROJECT_FILE"

echo "✅ Updated PRODUCT_NAME to MIIN-Ojibwe"

# Verify the changes
if grep -q 'PRODUCT_NAME = "MIIN-Ojibwe"' "$PROJECT_FILE"; then
    echo "✅ Verification: PRODUCT_NAME successfully updated"
else
    echo "❌ Verification failed: PRODUCT_NAME not found"
    # Restore backup
    mv "$PROJECT_FILE.backup" "$PROJECT_FILE"
    echo "🔄 Restored original project file"
    exit 1
fi

echo "🎉 Project name fix completed successfully!"
echo "📱 Your archive should now show 'MIIN-Ojibwe' instead of 'LAReactNative'"
echo ""
echo "Next steps:"
echo "1. Clean Build Folder in Xcode (⌘⇧K)"
echo "2. Archive your project (Product → Archive)"
echo "3. The archive should now show the correct name"
