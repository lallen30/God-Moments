#!/bin/bash

# Script to generate app icons from a source image
# Usage: ./generate-icons.sh path/to/your/logo.png

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path-to-logo.png>"
    echo "Example: $0 miin-logo.png"
    exit 1
fi

SOURCE_IMAGE="$1"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image '$SOURCE_IMAGE' not found"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed."
    echo "Install it with: brew install imagemagick"
    exit 1
fi

echo "Generating Android icons..."

# Android icon sizes
convert "$SOURCE_IMAGE" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert "$SOURCE_IMAGE" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert "$SOURCE_IMAGE" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert "$SOURCE_IMAGE" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert "$SOURCE_IMAGE" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

echo "Android icons generated successfully!"

# iOS icon sizes - create directory structure
IOS_ICON_DIR="ios/MIIN-Ojibwe/Images.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_ICON_DIR"

echo "Generating iOS icons..."

# iOS icon sizes
convert "$SOURCE_IMAGE" -resize 40x40 "$IOS_ICON_DIR/Icon-App-20x20@2x.png"
convert "$SOURCE_IMAGE" -resize 60x60 "$IOS_ICON_DIR/Icon-App-20x20@3x.png"
convert "$SOURCE_IMAGE" -resize 58x58 "$IOS_ICON_DIR/Icon-App-29x29@2x.png"
convert "$SOURCE_IMAGE" -resize 87x87 "$IOS_ICON_DIR/Icon-App-29x29@3x.png"
convert "$SOURCE_IMAGE" -resize 80x80 "$IOS_ICON_DIR/Icon-App-40x40@2x.png"
convert "$SOURCE_IMAGE" -resize 120x120 "$IOS_ICON_DIR/Icon-App-40x40@3x.png"
convert "$SOURCE_IMAGE" -resize 120x120 "$IOS_ICON_DIR/Icon-App-60x60@2x.png"
convert "$SOURCE_IMAGE" -resize 180x180 "$IOS_ICON_DIR/Icon-App-60x60@3x.png"
convert "$SOURCE_IMAGE" -resize 1024x1024 "$IOS_ICON_DIR/Icon-App-1024x1024@1x.png"

echo "iOS icons generated successfully!"

echo "All app icons have been generated!"
echo "Next steps:"
echo "1. Clean and rebuild your project"
echo "2. Generate a new APK"
