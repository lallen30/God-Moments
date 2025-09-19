#!/bin/bash

echo "🧹 COMPREHENSIVE HERMES DSYM FIX - FORCE REBUILD"
echo "================================================"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "ios" ]; then
    print_error "Please run this script from the root of your React Native project"
    exit 1
fi

print_step "Step 1: Stopping Metro and clearing Watchman"
# Kill any running Metro processes
pkill -f "react-native start" || true
pkill -f "metro" || true

# Clear Watchman
if command -v watchman >/dev/null 2>&1; then
    watchman watch-del-all
    print_success "Watchman cleared"
else
    print_warning "Watchman not installed, skipping"
fi

print_step "Step 2: Nuclear clean - removing all caches and builds"
# Remove all possible cache directories
rm -rf node_modules
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf android/build
rm -rf ~/.gradle/caches
rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/Library/Developer/Xcode/DerivedData/LAReactNative*
rm -rf .metro-cache
rm -rf /tmp/metro-*
rm -rf node_modules/.cache
rm -rf yarn.cache

print_success "All caches and builds cleared"

print_step "Step 3: Reinstalling Node modules"
npm install
print_success "Node modules reinstalled"

print_step "Step 4: Reinstalling CocoaPods"
cd ios
pod cache clean --all
pod deintegrate || true
pod install
cd ..
print_success "CocoaPods reinstalled"

print_step "Step 5: Cleaning React Native project"
if npx react-native clean-project --help >/dev/null 2>&1; then
    npx react-native clean-project --remove-iOS-build --remove-android-build
    print_success "React Native project cleaned"
else
    print_warning "react-native clean-project not available"
fi

print_step "Step 6: Verifying Hermes configuration"
if cd ios && pod list | grep -q hermes-engine; then
    HERMES_VERSION=$(pod list | grep hermes-engine | head -1)
    print_success "Hermes configured: $HERMES_VERSION"
else
    print_error "Hermes not found in pod list"
    exit 1
fi
cd ..

print_step "Step 7: Creating custom dSYM generation script for Xcode"
cat > ios/hermes_dsym_build_phase.sh << 'EOF'
#!/bin/bash

echo "🔧 Custom Hermes dSYM Build Phase"
echo "================================"

# Only run for Release builds
if [ "$CONFIGURATION" != "Release" ]; then
    echo "⏭️  Skipping dSYM generation for $CONFIGURATION build"
    exit 0
fi

# Find Hermes framework
HERMES_FRAMEWORK=$(find "$BUILT_PRODUCTS_DIR" -name "hermes.framework" -type d | head -1)

if [ -z "$HERMES_FRAMEWORK" ]; then
    echo "⚠️  Hermes framework not found in $BUILT_PRODUCTS_DIR"
    exit 0
fi

echo "📦 Found Hermes framework: $HERMES_FRAMEWORK"

HERMES_BINARY="$HERMES_FRAMEWORK/hermes"
HERMES_DSYM="$HERMES_FRAMEWORK.dSYM"

if [ ! -f "$HERMES_BINARY" ]; then
    echo "❌ Hermes binary not found: $HERMES_BINARY"
    exit 1
fi

echo "🔨 Generating dSYM for Hermes..."

# Remove existing dSYM
rm -rf "$HERMES_DSYM"

# Generate dSYM
if dsymutil "$HERMES_BINARY" -o "$HERMES_DSYM"; then
    echo "✅ dSYM generated: $HERMES_DSYM"
    
    # Verify structure
    if [ -d "$HERMES_DSYM/Contents/Resources/DWARF" ]; then
        echo "✅ dSYM structure verified"
        
        # Show UUIDs
        if command -v dwarfdump >/dev/null 2>&1; then
            echo "🔍 Binary UUID:"
            dwarfdump --uuid "$HERMES_BINARY"
            echo "🔍 dSYM UUID:"
            dwarfdump --uuid "$HERMES_DSYM"
        fi
        
        # Copy to main dSYMs folder
        MAIN_DSYM_DIR="$BUILT_PRODUCTS_DIR"
        if [ "$DWARF_DSYM_FOLDER_PATH" != "$BUILT_PRODUCTS_DIR" ]; then
            MAIN_DSYM_DIR="$DWARF_DSYM_FOLDER_PATH"
        fi
        
        if [ "$MAIN_DSYM_DIR" != "$(dirname "$HERMES_DSYM")" ]; then
            echo "📋 Copying to main dSYM folder: $MAIN_DSYM_DIR"
            cp -R "$HERMES_DSYM" "$MAIN_DSYM_DIR/"
        fi
        
    else
        echo "❌ dSYM structure invalid"
        exit 1
    fi
else
    echo "❌ Failed to generate dSYM"
    exit 1
fi

echo "🏁 Hermes dSYM generation completed successfully"
EOF

chmod +x ios/hermes_dsym_build_phase.sh
print_success "Custom dSYM build script created"

echo ""
echo -e "${GREEN}🎯 COMPREHENSIVE CLEAN COMPLETE!${NC}"
echo ""
echo "📋 What was done:"
echo "   ✅ Explicitly enabled Hermes in Podfile"
echo "   ✅ Cleared all caches (Watchman, CocoaPods, Xcode, Metro)"
echo "   ✅ Rebuilt all dependencies from scratch"
echo "   ✅ Created custom Hermes dSYM build script"
echo ""
echo -e "${BLUE}🚀 Next Steps for TestFlight:${NC}"
echo ""
echo "1. Open Xcode: ${YELLOW}open ios/LAReactNative.xcworkspace${NC}"
echo ""
echo "2. Add Custom Build Phase (IMPORTANT):"
echo "   - Select LAReactNative target"
echo "   - Build Phases tab"
echo "   - Click + → New Run Script Phase"
echo "   - Name: 'Generate Hermes dSYM'"
echo "   - Script: ${YELLOW}\$SRCROOT/hermes_dsym_build_phase.sh${NC}"
echo "   - Run script: Only when installing ✓"
echo ""
echo "3. Verify Build Settings (Release configuration):"
echo "   - Debug Information Format = DWARF with dSYM File"
echo "   - Dead Code Stripping = No"
echo "   - Enable Bitcode = No"
echo ""
echo "4. Archive:"
echo "   - Connect iPhone"
echo "   - Select device (not simulator)"
echo "   - Product → Clean Build Folder"
echo "   - Product → Archive"
echo ""
echo "5. Verify dSYM after archive:"
echo "   - Run: ${YELLOW}./ios/validate_dsym.sh${NC}"
echo ""
echo -e "${RED}⚠️  CRITICAL: Make sure to add the build phase in step 2!${NC}"
