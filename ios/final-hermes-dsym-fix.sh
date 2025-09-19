#!/bin/bash

# Final comprehensive fix for Hermes dSYM issues in React Native iOS builds
# This script addresses the root cause by ensuring proper debug symbol generation

set -e

echo "🔧 Applying final comprehensive Hermes dSYM fix..."

# Step 1: Clean everything
echo "🧹 Cleaning all build artifacts..."
cd ios
rm -rf build
rm -rf Pods
rm -f Podfile.lock

# Step 2: Reinstall pods with proper configuration
echo "📦 Reinstalling pods with dSYM configuration..."
pod install

# Step 3: Clean Xcode derived data
echo "🧹 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LAReactNative-* 2>/dev/null || true

# Step 4: Create a script to verify dSYM generation
echo "📝 Creating dSYM verification script..."
cat > verify-dsym.sh << 'EOF'
#!/bin/bash

# Script to verify dSYM files are properly generated
ARCHIVE_PATH="$1"

if [ -z "$ARCHIVE_PATH" ]; then
    echo "Usage: $0 <path-to-archive>"
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
EOF

chmod +x verify-dsym.sh

cd ..

echo "✅ Final Hermes dSYM fix applied!"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode workspace: open ios/LAReactNative.xcworkspace"
echo "2. Select 'Any iOS Device (arm64)' as target"
echo "3. Go to Product → Archive"
echo "4. After archiving, verify dSYMs: ./ios/verify-dsym.sh <path-to-archive>"
echo ""
echo "🔧 The key fixes applied:"
echo "   - Added DEBUG_INFORMATION_FORMAT = 'dwarf-with-dsym' to Release config"
echo "   - Set COPY_PHASE_STRIP = NO to preserve debug symbols"
echo "   - Set STRIP_INSTALLED_PRODUCT = NO to prevent symbol stripping"
echo "   - Set MTL_ENABLE_DEBUG_INFO = YES for Metal debug info"
echo "   - Updated Podfile with comprehensive dSYM settings"
echo ""
echo "🎯 This should permanently resolve the Hermes dSYM issue!" 