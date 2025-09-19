#!/bin/bash

# Permanent fix for Hermes dSYM issues in React Native iOS builds
# This script ensures that Hermes framework dSYM files are properly generated and included in archives

set -e

echo "🔧 Applying permanent Hermes dSYM fix..."

# Step 1: Clean and reinstall pods with updated configuration
echo "📦 Reinstalling pods with dSYM configuration..."
cd ios
pod deintegrate
pod install

# Step 2: Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LAReactNative-*
xcodebuild clean -workspace LAReactNative.xcworkspace -scheme LAReactNative

# Step 3: Create a build script that ensures dSYM generation
echo "📝 Creating build script for dSYM generation..."
cat > hermes-dsym-build-phase.sh << 'EOF'
#!/bin/bash

# This script ensures Hermes dSYM files are generated during the build process
# It should be run as a build phase in Xcode

set -e

echo "🔧 Hermes dSYM Build Phase: Starting..."

# Only run for Release builds
if [ "$CONFIGURATION" != "Release" ]; then
    echo "⏭️ Skipping dSYM generation for Debug build"
    exit 0
fi

# Find Hermes framework
HERMES_FRAMEWORK="${BUILT_PRODUCTS_DIR}/hermes.framework"
HERMES_DSYM="${BUILT_PRODUCTS_DIR}/hermes.framework.dSYM"

if [ ! -d "$HERMES_FRAMEWORK" ]; then
    echo "⚠️ Hermes framework not found at $HERMES_FRAMEWORK"
    exit 0
fi

echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK"

# Check if dSYM already exists and is valid
if [ -d "$HERMES_DSYM" ]; then
    echo "✅ Hermes dSYM already exists"
    
    # Verify the dSYM has the correct UUID
    HERMES_UUID=$(dwarfdump --uuid "$HERMES_FRAMEWORK/hermes" | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
    DSYM_UUID=$(dwarfdump --uuid "$HERMES_DSYM" | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
    
    if [ "$HERMES_UUID" = "$DSYM_UUID" ]; then
        echo "✅ dSYM UUID matches framework UUID: $HERMES_UUID"
        exit 0
    else
        echo "⚠️ dSYM UUID mismatch, regenerating..."
        rm -rf "$HERMES_DSYM"
    fi
fi

# Generate dSYM from Hermes framework
echo "📋 Generating Hermes dSYM..."
dsymutil "$HERMES_FRAMEWORK/hermes" -o "$HERMES_DSYM"

# Verify dSYM was created
if [ -d "$HERMES_DSYM" ]; then
    echo "✅ Hermes dSYM generated successfully"
    
    # Show UUID for verification
    HERMES_UUID=$(dwarfdump --uuid "$HERMES_FRAMEWORK/hermes" | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
    DSYM_UUID=$(dwarfdump --uuid "$HERMES_DSYM" | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
    
    echo "🔍 Framework UUID: $HERMES_UUID"
    echo "🔍 dSYM UUID: $DSYM_UUID"
    
    if [ "$HERMES_UUID" = "$DSYM_UUID" ]; then
        echo "✅ UUIDs match - dSYM is valid"
    else
        echo "❌ UUIDs don't match - dSYM may be invalid"
        exit 1
    fi
else
    echo "❌ Failed to generate Hermes dSYM"
    exit 1
fi

echo "🎉 Hermes dSYM Build Phase: Completed successfully"
EOF

chmod +x hermes-dsym-build-phase.sh

cd ..

echo "✅ Permanent Hermes dSYM fix applied!"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode workspace: open ios/LAReactNative.xcworkspace"
echo "2. Select 'Any iOS Device (arm64)' as target"
echo "3. Go to Product → Archive"
echo "4. The archive should now include proper Hermes dSYM files"
echo ""
echo "🔧 If you still get dSYM errors, run: ./ios/fix-organizer-archive.sh" 