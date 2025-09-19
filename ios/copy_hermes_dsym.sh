#!/bin/bash

echo "🔄 Starting dSYM copy script for archive..."

# Only run during archive builds
if [[ "$CONFIGURATION" == "Release" ]] && [[ "$ACTION" == "archive" ]]; then
    echo "✅ Archive build detected - copying Hermes dSYM..."
    
    HERMES_DSYM_SOURCE="$SRCROOT/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64/hermes.framework.dSYM"
    
    if [[ -d "$HERMES_DSYM_SOURCE" ]]; then
        echo "📦 Found Hermes dSYM at: $HERMES_DSYM_SOURCE"
        
        # Copy to build products directory
        if [[ -n "$BUILT_PRODUCTS_DIR" ]]; then
            echo "📦 Copying dSYM to: $BUILT_PRODUCTS_DIR/"
            cp -R "$HERMES_DSYM_SOURCE" "$BUILT_PRODUCTS_DIR/"
            echo "✅ dSYM copied successfully"
        fi
        
        # Also copy to Xcode's expected dSYM location
        if [[ -n "$DWARF_DSYM_FOLDER_PATH" ]]; then
            echo "📦 Copying dSYM to: $DWARF_DSYM_FOLDER_PATH/"
            mkdir -p "$DWARF_DSYM_FOLDER_PATH"
            cp -R "$HERMES_DSYM_SOURCE" "$DWARF_DSYM_FOLDER_PATH/"
            echo "✅ dSYM copied to archive dSYM folder"
        fi
        
        # Verify UUID
        UUID=$(dwarfdump --uuid "$HERMES_DSYM_SOURCE" 2>/dev/null | grep -o '[A-F0-9-]\{36\}' | head -1)
        if [[ -n "$UUID" ]]; then
            echo "🔍 Hermes dSYM UUID: $UUID"
        fi
    else
        echo "❌ Hermes dSYM not found at: $HERMES_DSYM_SOURCE"
    fi
else
    echo "ℹ️  Not an archive build - skipping dSYM copy"
fi

echo "✅ dSYM copy script completed"
