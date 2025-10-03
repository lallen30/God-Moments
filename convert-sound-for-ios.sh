#!/bin/bash
# Convert church bell sound to iOS-compatible notification sound format

echo "Converting church_bell.wav to iOS notification format..."

# Convert to CAF format (Core Audio Format) - iOS's preferred format
afconvert -f caff -d LEI16@44100 -c 1 \
  ios/GodMoments/church_bell.wav \
  ios/GodMoments/church_bell.caf

echo "✅ Converted to church_bell.caf"
echo ""
echo "File info:"
afinfo ios/GodMoments/church_bell.caf

echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Open Xcode project"
echo "2. Add church_bell.caf to the GodMoments target (drag & drop into Xcode)"
echo "3. Make sure 'Copy items if needed' is checked"
echo "4. Make sure 'GodMoments' target is selected"
echo "5. Rebuild and reinstall the app on your iPhone"
echo "6. Update server to use 'church_bell.caf' instead of 'church_bell.wav'"
