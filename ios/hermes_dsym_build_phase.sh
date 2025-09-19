#!/bin/bash

echo "🔄 Starting Hermes dSYM generation script..."

# Set error handling but allow script to continue on some errors
set +e

# Navigate to the iOS directory
if [[ -z "$SRCROOT" ]]; then
    echo "❌ SRCROOT not set, using current directory"
    SRCROOT="$(pwd)"
fi

cd "$SRCROOT" || {
    echo "❌ Cannot navigate to SRCROOT: $SRCROOT"
    exit 1
}

echo "📍 Working directory: $(pwd)"
echo "🎯 Target: $TARGET_NAME"
echo "📦 Configuration: $CONFIGURATION"

# Check if this is an archive build
if [[ "$CONFIGURATION" == "Release" ]] || [[ "$ACTION" == "archive" ]]; then
    echo "✅ Release/Archive configuration detected - proceeding with dSYM generation"
else
    echo "ℹ️  Not a Release/Archive build (Config: $CONFIGURATION, Action: $ACTION) - skipping dSYM generation"
    exit 0
fi

# Look for Hermes framework in Pods
HERMES_FRAMEWORK_PATH="$SRCROOT/Pods/hermes-engine/destroot/Library/Frameworks/hermes.framework"

if [[ -d "$HERMES_FRAMEWORK_PATH" ]]; then
    echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK_PATH"
    
    # Check if dSYM already exists
    HERMES_DSYM_PATH="$HERMES_FRAMEWORK_PATH.dSYM"
    
    if [[ -d "$HERMES_DSYM_PATH" ]]; then
        echo "✅ Hermes dSYM already exists at: $HERMES_DSYM_PATH"
        
        # Verify the dSYM
        if dsymutil --verify "$HERMES_DSYM_PATH" 2>/dev/null; then
            echo "✅ Hermes dSYM verification passed"
        else
            echo "⚠️  Hermes dSYM verification failed - regenerating..."
            rm -rf "$HERMES_DSYM_PATH"
        fi
    fi
    
    # Generate dSYM if it doesn't exist or failed verification
    if [[ ! -d "$HERMES_DSYM_PATH" ]]; then
        echo "🔧 Generating Hermes dSYM..."
        
        HERMES_BINARY="$HERMES_FRAMEWORK_PATH/hermes"
        if [[ -f "$HERMES_BINARY" ]]; then
            echo "📄 Hermes binary found: $HERMES_BINARY"
            
            # Generate dSYM
            echo "🔧 Running: dsymutil '$HERMES_BINARY' -o '$HERMES_DSYM_PATH'"
            if dsymutil "$HERMES_BINARY" -o "$HERMES_DSYM_PATH" 2>&1; then
                echo "✅ Successfully generated Hermes dSYM"
                
                # Verify the generated dSYM
                if command -v dwarfdump >/dev/null 2>&1; then
                    if dwarfdump --uuid "$HERMES_DSYM_PATH" >/dev/null 2>&1; then
                        echo "✅ Generated dSYM verification passed"
                        
                        # Show UUID information
                        echo "🔍 dSYM UUID information:"
                        dwarfdump --uuid "$HERMES_DSYM_PATH" 2>/dev/null || echo "Could not get detailed UUID info"
                    else
                        echo "⚠️  Could not verify dSYM with dwarfdump"
                    fi
                else
                    echo "⚠️  dwarfdump not available for verification"
                fi
                
            else
                echo "❌ Failed to generate Hermes dSYM"
                # Don't exit with error - let the build continue
                echo "⚠️  Continuing with build despite dSYM generation failure"
            fi
        else
            echo "❌ Hermes binary not found at: $HERMES_BINARY"
            echo "⚠️  Continuing with build despite missing Hermes binary"
        fi
    fi
    
    # Copy dSYM to build directory if needed
    if [[ -n "$BUILT_PRODUCTS_DIR" ]] && [[ -d "$HERMES_DSYM_PATH" ]]; then
        echo "📦 Copying dSYM to build products directory..."
        cp -R "$HERMES_DSYM_PATH" "$BUILT_PRODUCTS_DIR/"
        echo "✅ dSYM copied to: $BUILT_PRODUCTS_DIR/hermes.framework.dSYM"
    fi
    
else
    echo "❌ Hermes framework not found at expected path: $HERMES_FRAMEWORK_PATH"
    
    # Search for Hermes in other common locations
    echo "🔍 Searching for Hermes framework in Pods directory..."
    if [[ -d "$SRCROOT/Pods" ]]; then
        find "$SRCROOT/Pods" -name "hermes.framework" -type d 2>/dev/null | while read -r found_path; do
            echo "📍 Found Hermes framework at: $found_path"
        done
    else
        echo "❌ Pods directory not found at: $SRCROOT/Pods"
    fi
    
    echo "⚠️  Continuing with build despite missing Hermes framework"
fi

echo "✅ Hermes dSYM generation script completed successfully"
