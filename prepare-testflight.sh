#!/bin/bash

echo "🚀 Complete TestFlight Preparation Script"
echo "========================================="

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

print_step "Step 1: Cleaning previous builds"
rm -rf ios/build
rm -rf android/build  
rm -rf node_modules/.cache
print_success "Build folders cleaned"

print_step "Step 2: Reinstalling pods with updated configuration"
cd ios
pod deintegrate
pod install
cd ..
print_success "Pods reinstalled"

print_step "Step 3: Checking Hermes configuration"
if cd ios && pod list | grep -q hermes-engine; then
    print_success "Hermes is properly configured"
else
    print_warning "Hermes might not be configured correctly"
fi
cd ..

print_step "Step 4: Verifying project structure"
if [ -f "ios/LAReactNative.xcworkspace" ]; then
    print_success "Xcode workspace found"
else
    print_error "Xcode workspace not found"
    exit 1
fi

print_step "Step 5: Creating backup of important files"
backup_dir="./backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
cp ios/Podfile "$backup_dir/"
cp package.json "$backup_dir/"
cp metro.config.js "$backup_dir/"
print_success "Backup created in $backup_dir"

print_step "Step 6: Checking dSYM generation scripts"
chmod +x ios/enhanced_hermes_dsym.sh
chmod +x ios/validate_dsym.sh
chmod +x ios/generate_hermes_dsym.sh
print_success "Scripts are executable"

echo ""
echo -e "${BLUE}🎯 Pre-build Checklist Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open Xcode: ${YELLOW}open ios/LAReactNative.xcworkspace${NC}"
echo "2. Select 'Any iOS Device (arm64)' as destination"
echo "3. Verify build settings for Release configuration:"
echo "   - Debug Information Format = DWARF with dSYM File"
echo "   - Strip Debug Symbols During Copy = No"
echo "   - Generate Debug Symbols = Yes"
echo "4. Clean Build Folder: Product > Clean Build Folder (⌘⇧K)"
echo "5. Archive: Product > Archive"
echo "6. After archiving, run: ${YELLOW}./ios/validate_dsym.sh${NC}"
echo ""
echo -e "${GREEN}🚀 Ready for TestFlight build!${NC}"

# Optional: Open Xcode automatically
read -p "🔧 Open Xcode workspace now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open ios/LAReactNative.xcworkspace
    print_success "Xcode opened"
fi

echo ""
echo -e "${BLUE}📚 For detailed troubleshooting, see: HERMES_DSYM_GUIDE.md${NC}"
