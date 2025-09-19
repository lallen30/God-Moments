#!/bin/bash

set -e

echo "🚀 Enhanced Hermes dSYM Generation for TestFlight"
echo "======================================================="

# Configuration
CONFIGURATION=${CONFIGURATION:-Release}
BUILT_PRODUCTS_DIR=${BUILT_PRODUCTS_DIR:-"./build/Release-iphoneos"}
DWARF_DSYM_FOLDER_PATH=${DWARF_DSYM_FOLDER_PATH:-"$BUILT_PRODUCTS_DIR"}

echo "📋 Configuration: $CONFIGURATION"
echo "📁 Built Products Dir: $BUILT_PRODUCTS_DIR"
echo "📁 dSYM Folder Path: $DWARF_DSYM_FOLDER_PATH"

# Find all Hermes frameworks in the build directory
echo "🔍 Searching for Hermes frameworks..."
HERMES_FRAMEWORKS=$(find "$BUILT_PRODUCTS_DIR" -name "hermes.framework" -type d 2>/dev/null || true)

if [ -z "$HERMES_FRAMEWORKS" ]; then
    echo "⚠️  No Hermes frameworks found in $BUILT_PRODUCTS_DIR"
    echo "🔍 Searching in alternative locations..."
    
    # Alternative search paths
    ALT_PATHS=(
        "./ios/build"
        "./build"
        "~/Library/Developer/Xcode/DerivedData"
    )
    
    for alt_path in "${ALT_PATHS[@]}"; do
        if [ -d "$alt_path" ]; then
            echo "🔍 Searching in $alt_path..."
            HERMES_FRAMEWORKS=$(find "$alt_path" -name "hermes.framework" -type d 2>/dev/null || true)
            if [ -n "$HERMES_FRAMEWORKS" ]; then
                echo "✅ Found Hermes frameworks in $alt_path"
                break
            fi
        fi
    done
fi

if [ -z "$HERMES_FRAMEWORKS" ]; then
    echo "❌ No Hermes frameworks found in any location"
    exit 0
fi

# Process each Hermes framework found
echo "$HERMES_FRAMEWORKS" | while read -r HERMES_FRAMEWORK; do
    if [ -z "$HERMES_FRAMEWORK" ]; then
        continue
    fi
    
    echo "📦 Processing Hermes framework: $HERMES_FRAMEWORK"
    
    HERMES_BINARY="$HERMES_FRAMEWORK/hermes"
    HERMES_DSYM="$HERMES_FRAMEWORK.dSYM"
    
    # Check if the Hermes binary exists
    if [ ! -f "$HERMES_BINARY" ]; then
        echo "❌ Hermes binary not found at $HERMES_BINARY"
        continue
    fi
    
    echo "🔨 Generating dSYM for Hermes binary: $HERMES_BINARY"
    
    # Remove existing dSYM
    if [ -d "$HERMES_DSYM" ]; then
        echo "🗑️  Removing existing dSYM: $HERMES_DSYM"
        rm -rf "$HERMES_DSYM"
    fi
    
    # Generate dSYM using dsymutil
    if dsymutil "$HERMES_BINARY" -o "$HERMES_DSYM"; then
        echo "✅ Successfully generated dSYM: $HERMES_DSYM"
        
        # Verify the dSYM structure
        if [ -d "$HERMES_DSYM" ]; then
            echo "🔍 Verifying dSYM structure..."
            ls -la "$HERMES_DSYM"
            
            # Check for DWARF data
            DWARF_FILES=$(find "$HERMES_DSYM" -name "*" -type f 2>/dev/null || true)
            if [ -n "$DWARF_FILES" ]; then
                echo "✅ dSYM contains DWARF data"
                
                # Verify UUIDs match
                if command -v dwarfdump >/dev/null 2>&1; then
                    echo "🔍 Checking UUIDs..."
                    BINARY_UUID=$(dwarfdump --uuid "$HERMES_BINARY" 2>/dev/null | head -1 | awk '{print $2}' || echo "unknown")
                    DSYM_UUID=$(dwarfdump --uuid "$HERMES_DSYM" 2>/dev/null | head -1 | awk '{print $2}' || echo "unknown")
                    
                    echo "📱 Binary UUID: $BINARY_UUID"
                    echo "📄 dSYM UUID:   $DSYM_UUID"
                    
                    if [ "$BINARY_UUID" = "$DSYM_UUID" ] && [ "$BINARY_UUID" != "unknown" ]; then
                        echo "✅ UUIDs match - dSYM is valid"
                    else
                        echo "⚠️  UUIDs don't match or couldn't be determined"
                    fi
                fi
                
                # Copy to the expected dSYM folder if different
                if [ "$DWARF_DSYM_FOLDER_PATH" != "$(dirname "$HERMES_DSYM")" ]; then
                    DSYM_DEST="$DWARF_DSYM_FOLDER_PATH/hermes.framework.dSYM"
                    echo "📋 Copying dSYM to: $DSYM_DEST"
                    
                    mkdir -p "$DWARF_DSYM_FOLDER_PATH"
                    cp -R "$HERMES_DSYM" "$DSYM_DEST"
                    
                    if [ -d "$DSYM_DEST" ]; then
                        echo "✅ dSYM copied successfully"
                    else
                        echo "❌ Failed to copy dSYM"
                    fi
                fi
                
            else
                echo "❌ dSYM appears to be empty or invalid"
            fi
        else
            echo "❌ dSYM directory was not created"
        fi
    else
        echo "❌ Failed to generate dSYM with dsymutil"
        
        # Try alternative approach with llvm-dsymutil if available
        if command -v llvm-dsymutil >/dev/null 2>&1; then
            echo "🔄 Trying with llvm-dsymutil..."
            if llvm-dsymutil "$HERMES_BINARY" -o "$HERMES_DSYM"; then
                echo "✅ Successfully generated dSYM with llvm-dsymutil"
            else
                echo "❌ llvm-dsymutil also failed"
            fi
        fi
    fi
done

echo "🏁 Hermes dSYM generation complete"

# List all dSYM files in the build directory for verification
echo "📋 All dSYM files in build directory:"
find "$BUILT_PRODUCTS_DIR" -name "*.dSYM" -type d 2>/dev/null | while read -r dsym; do
    echo "  📄 $dsym"
    if [ -d "$dsym/Contents/Resources/DWARF" ]; then
        DWARF_FILES=$(ls "$dsym/Contents/Resources/DWARF" 2>/dev/null || true)
        if [ -n "$DWARF_FILES" ]; then
            echo "    ✅ Contains DWARF data: $DWARF_FILES"
        else
            echo "    ❌ No DWARF data found"
        fi
    fi
done
