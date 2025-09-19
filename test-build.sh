#!/bin/bash

echo "🔧 Testing iOS Build Configuration"
echo "================================="

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "ios" ]; then
    print_error "Please run this script from the root of your React Native project"
    exit 1
fi

echo "🔍 Checking project configuration..."

# Check if workspace exists
if [ -d "ios/LAReactNative.xcworkspace" ]; then
    print_success "Xcode workspace found"
else
    print_error "Xcode workspace not found"
    exit 1
fi

# Check if Hermes is properly configured
echo "🔍 Checking Hermes configuration..."
cd ios
if pod list | grep -q hermes-engine; then
    print_success "Hermes is properly configured"
else
    print_warning "Hermes might not be configured correctly"
fi
cd ..

echo "🏗️  Testing basic build..."

# Clean any existing build artifacts
rm -rf ios/build

# Try to build the project for simulator first (faster and less likely to fail)
echo "📱 Building for iOS Simulator..."
cd ios

# Use xcodebuild to test the configuration
if xcodebuild -workspace LAReactNative.xcworkspace \
    -scheme LAReactNative \
    -configuration Debug \
    -destination 'platform=iOS Simulator,name=iPhone 15' \
    -derivedDataPath ./build \
    build -quiet; then
    
    print_success "iOS Simulator build succeeded!"
    
    # Check if any dSYM files were generated
    if find ./build -name "*.dSYM" -type d | grep -q .; then
        print_success "dSYM files were generated during build"
        echo "📋 dSYM files found:"
        find ./build -name "*.dSYM" -type d | while read dsym; do
            echo "  📄 $(basename "$dsym")"
        done
    else
        print_warning "No dSYM files found (normal for Debug builds)"
    fi
    
else
    print_error "iOS Simulator build failed"
    echo ""
    echo "💡 Troubleshooting steps:"
    echo "1. Open Xcode: open ios/LAReactNative.xcworkspace"
    echo "2. Try to build manually in Xcode to see detailed errors"
    echo "3. Check build settings and ensure all dependencies are properly configured"
    cd ..
    exit 1
fi

cd ..

echo ""
print_success "Build test completed successfully!"
echo ""
echo "🎯 Next steps for TestFlight:"
echo "1. Open Xcode: ${YELLOW}open ios/LAReactNative.xcworkspace${NC}"
echo "2. Select 'Any iOS Device (arm64)' as destination"
echo "3. Set configuration to Release"
echo "4. Product > Clean Build Folder (⌘⇧K)"
echo "5. Product > Archive"
echo ""
echo "📚 For Hermes dSYM issues, run: ${YELLOW}./ios/enhanced_hermes_dsym.sh${NC}"
