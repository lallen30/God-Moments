#!/bin/bash
set -e

echo "🔧 Custom Hermes dSYM Generation Script"

# Find the Hermes framework
HERMES_FRAMEWORK_PATH=$(find "$BUILT_PRODUCTS_DIR" -name "hermes.framework" -type d | head -1)

if [ -z "$HERMES_FRAMEWORK_PATH" ]; then
    echo "❌ Hermes framework not found in $BUILT_PRODUCTS_DIR"
    exit 0
fi

echo "📦 Found Hermes framework at: $HERMES_FRAMEWORK_PATH"

HERMES_BINARY="$HERMES_FRAMEWORK_PATH/hermes"
HERMES_DSYM="$HERMES_FRAMEWORK_PATH.dSYM"

if [ ! -f "$HERMES_BINARY" ]; then
    echo "❌ Hermes binary not found at $HERMES_BINARY"
    exit 0
fi

echo "🔨 Generating dSYM for Hermes..."

# Remove existing dSYM
rm -rf "$HERMES_DSYM"

# Generate dSYM using dsymutil
if dsymutil "$HERMES_BINARY" -o "$HERMES_DSYM"; then
    echo "✅ Successfully generated Hermes dSYM"
    
    # Verify UUIDs
    if command -v dwarfdump >/dev/null 2>&1; then
        echo "🔍 dSYM UUIDs:"
        dwarfdump --uuid "$HERMES_DSYM"
    fi
    
    # Also check binary UUIDs
    echo "🔍 Binary UUIDs:"
    dwarfdump --uuid "$HERMES_BINARY"
    
else
    echo "❌ Failed to generate dSYM"
    exit 1
fi
