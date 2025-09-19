#!/bin/bash

echo "🔍 Hermes dSYM Validator for TestFlight"
echo "======================================="

# Function to check dSYM validity
check_dsym() {
    local dsym_path="$1"
    local binary_path="$2"
    
    echo "📄 Checking dSYM: $dsym_path"
    
    if [ ! -d "$dsym_path" ]; then
        echo "❌ dSYM directory not found"
        return 1
    fi
    
    # Check dSYM structure
    if [ ! -d "$dsym_path/Contents" ]; then
        echo "❌ Invalid dSYM structure - missing Contents directory"
        return 1
    fi
    
    if [ ! -d "$dsym_path/Contents/Resources" ]; then
        echo "❌ Invalid dSYM structure - missing Resources directory"
        return 1
    fi
    
    if [ ! -d "$dsym_path/Contents/Resources/DWARF" ]; then
        echo "❌ Invalid dSYM structure - missing DWARF directory"
        return 1
    fi
    
    # Check for DWARF files
    DWARF_FILES=$(ls "$dsym_path/Contents/Resources/DWARF" 2>/dev/null || true)
    if [ -z "$DWARF_FILES" ]; then
        echo "❌ No DWARF files found in dSYM"
        return 1
    fi
    
    echo "✅ dSYM structure is valid"
    echo "📋 DWARF files: $DWARF_FILES"
    
    # Check UUIDs if binary is provided
    if [ -n "$binary_path" ] && [ -f "$binary_path" ]; then
        if command -v dwarfdump >/dev/null 2>&1; then
            echo "🔍 Checking UUIDs..."
            
            BINARY_UUID=$(dwarfdump --uuid "$binary_path" 2>/dev/null | head -1 | awk '{print $2}' || echo "")
            DSYM_UUID=$(dwarfdump --uuid "$dsym_path" 2>/dev/null | head -1 | awk '{print $2}' || echo "")
            
            if [ -n "$BINARY_UUID" ] && [ -n "$DSYM_UUID" ]; then
                echo "📱 Binary UUID: $BINARY_UUID"
                echo "📄 dSYM UUID:   $DSYM_UUID"
                
                if [ "$BINARY_UUID" = "$DSYM_UUID" ]; then
                    echo "✅ UUIDs match - dSYM is valid for this binary"
                    return 0
                else
                    echo "❌ UUIDs don't match - dSYM may not be valid for this binary"
                    return 1
                fi
            else
                echo "⚠️  Could not extract UUIDs for comparison"
            fi
        else
            echo "⚠️  dwarfdump not available for UUID verification"
        fi
    fi
    
    return 0
}

# Find build directory
BUILD_DIR=""
POSSIBLE_DIRS=(
    "./build"
    "./ios/build"
    "$(find . -name "Release-iphoneos" -type d 2>/dev/null | head -1)"
    "$(find . -name "Debug-iphoneos" -type d 2>/dev/null | head -1)"
)

for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -n "$dir" ] && [ -d "$dir" ]; then
        BUILD_DIR="$dir"
        break
    fi
done

if [ -z "$BUILD_DIR" ]; then
    echo "❌ Could not find build directory"
    echo "🔍 Please run this script after building your project"
    exit 1
fi

echo "📁 Using build directory: $BUILD_DIR"

# Find all dSYM files
echo "🔍 Searching for dSYM files..."
DSYM_FILES=$(find "$BUILD_DIR" -name "*.dSYM" -type d 2>/dev/null || true)

if [ -z "$DSYM_FILES" ]; then
    echo "❌ No dSYM files found in build directory"
    echo "💡 This might indicate a build configuration issue"
    exit 1
fi

# Check each dSYM file
echo "📋 Found dSYM files:"
echo "$DSYM_FILES" | while read -r dsym; do
    if [ -n "$dsym" ]; then
        echo "  📄 $dsym"
    fi
done

echo ""
echo "🔍 Validating dSYM files..."

# Specifically check for Hermes dSYM
HERMES_DSYM=$(echo "$DSYM_FILES" | grep -i hermes | head -1 || true)
if [ -n "$HERMES_DSYM" ]; then
    echo ""
    echo "🎯 Found Hermes dSYM: $HERMES_DSYM"
    
    # Find corresponding Hermes binary
    HERMES_BINARY=""
    HERMES_FRAMEWORK=$(find "$BUILD_DIR" -name "hermes.framework" -type d 2>/dev/null | head -1 || true)
    if [ -n "$HERMES_FRAMEWORK" ]; then
        HERMES_BINARY="$HERMES_FRAMEWORK/hermes"
    fi
    
    if check_dsym "$HERMES_DSYM" "$HERMES_BINARY"; then
        echo "✅ Hermes dSYM is valid and ready for TestFlight"
    else
        echo "❌ Hermes dSYM validation failed"
        echo ""
        echo "🔧 Possible solutions:"
        echo "1. Clean and rebuild your project"
        echo "2. Ensure Debug Information Format is set to 'DWARF with dSYM File' in Release configuration"
        echo "3. Run the enhanced_hermes_dsym.sh script manually"
        echo "4. Check that Hermes is properly configured in your project"
    fi
else
    echo "⚠️  No Hermes dSYM found"
    echo "💡 This might be normal if Hermes is not enabled or the dSYM generation failed"
fi

echo ""
echo "📊 Summary:"
TOTAL_DSYMS=$(echo "$DSYM_FILES" | wc -l | tr -d ' ')
echo "   Total dSYM files found: $TOTAL_DSYMS"

# Check each dSYM briefly
VALID_DSYMS=0
echo "$DSYM_FILES" | while read -r dsym; do
    if [ -n "$dsym" ]; then
        DSYM_NAME=$(basename "$dsym" .dSYM)
        if check_dsym "$dsym" "" >/dev/null 2>&1; then
            echo "   ✅ $DSYM_NAME - Valid"
            VALID_DSYMS=$((VALID_DSYMS + 1))
        else
            echo "   ❌ $DSYM_NAME - Invalid"
        fi
    fi
done

echo ""
echo "🏁 Validation complete"
echo "💡 If Hermes dSYM validation failed, try running: ./ios/enhanced_hermes_dsym.sh"
