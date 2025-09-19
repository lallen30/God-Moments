#!/bin/bash

# Force Add Push Notifications Capability to Xcode Project
# This manually edits the project.pbxproj file to add the capability

echo "🔧 Manually adding Push Notifications capability to Xcode project..."
echo "=================================================================="

PROJECT_FILE="ios/LAReactNative.xcodeproj/project.pbxproj"

# Backup the project file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup2"
echo "✅ Created backup: $PROJECT_FILE.backup2"

# Add the capability entry to the project file
# We need to add it to both Debug and Release configurations

echo "📝 Adding Push Notifications capability to project configurations..."

# Add to Debug configuration
perl -i -pe "
    if (/buildSettings = \{/ .. /\};/) {
        if (/CODE_SIGN_ENTITLEMENTS = LAReactNative\/LAReactNative\.entitlements;/) {
            \$_ .= qq(\t\t\t\t\"com.apple.developer.aps-environment\" = development;\n);
        }
    }
" "$PROJECT_FILE"

# Add to Release configuration  
perl -i -pe "
    if (/buildSettings = \{/ .. /\};/) {
        if (/CODE_SIGN_ENTITLEMENTS = LAReactNative\/LAReactNative\.entitlements;/ && /Release/) {
            \$_ .= qq(\t\t\t\t\"com.apple.developer.aps-environment\" = production;\n);
        }
    }
" "$PROJECT_FILE"

echo "✅ Added Push Notifications capability to project file"

# Check if the changes were applied
if grep -q "com.apple.developer.aps-environment" "$PROJECT_FILE"; then
    echo "✅ Push Notifications capability successfully added to project"
else
    echo "❌ Failed to add capability automatically"
    echo "Manual steps required:"
    echo "1. In Xcode, make sure LAReactNative TARGET is selected"
    echo "2. Press Cmd+S to force save"
    echo "3. Close and reopen Xcode"
    echo "4. Verify Push Notifications appears in Signing & Capabilities"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Clean and rebuild the project"
echo "2. Test OneSignal User ID registration"
echo "3. Check for APNs device token in logs"
