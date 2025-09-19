# Hermes dSYM Generation Guide for TestFlight

This guide provides multiple approaches to resolve the "Upload Symbols Failed: The archive did not include a dSYM for the hermes.framework" error when uploading to TestFlight.

## Overview

The issue occurs because TestFlight requires debug symbols (dSYM files) for all frameworks, including Hermes, to provide crash analytics and symbolication.

## Solution Steps

### 1. Verify Current Configuration

First, verify that your project is properly configured:

```bash
# Check if Hermes is enabled (should show hermes-engine in dependencies)
cd ios && pod list | grep hermes

# Validate current dSYM files
./ios/validate_dsym.sh
```

### 2. Xcode Project Settings

**Important**: These settings must be configured in Xcode:

1. Open `LAReactNative.xcworkspace` in Xcode
2. Select your project in the navigator
3. Select the `LAReactNative` target
4. Go to Build Settings
5. Set the following for **Release** configuration:

   ```
   Debug Information Format = DWARF with dSYM File
   Strip Debug Symbols During Copy = No
   Strip Style = Debugging Symbols
   Generate Debug Symbols = Yes
   Deployment Postprocessing = Yes
   ```

6. Also check the **Pods** project:
   - Select Pods project in navigator
   - For each pod target (especially hermes-engine), set the same settings

### 3. Generate Hermes dSYM Manually

If the automatic generation doesn't work, use the enhanced script:

```bash
# Run the enhanced Hermes dSYM generation script
./ios/enhanced_hermes_dsym.sh
```

### 4. Build Process for TestFlight

Follow this exact sequence:

```bash
# 1. Clean everything
cd /path/to/your/project
rm -rf ios/build
rm -rf node_modules/.cache
cd ios && pod deintegrate && pod install

# 2. Open in Xcode
open LAReactNative.xcworkspace

# 3. In Xcode:
#    - Select "Any iOS Device (arm64)" or a connected device
#    - Product > Clean Build Folder (Cmd+Shift+K)
#    - Product > Archive

# 4. Verify dSYM generation after archive
./ios/validate_dsym.sh
```

### 5. Manual dSYM Generation (If needed)

If the automatic generation still fails:

```bash
# Find the archived app
ARCHIVE_PATH="/path/to/your/archive.xcarchive"

# Generate dSYM manually
./ios/enhanced_hermes_dsym.sh

# Or use Xcode's built-in tool
cd "${ARCHIVE_PATH}/Products/Applications"
dsymutil YourApp.app/Frameworks/hermes.framework/hermes -o hermes.framework.dSYM

# Copy to dSYMs folder
cp -R hermes.framework.dSYM "${ARCHIVE_PATH}/dSYMs/"
```

### 6. Alternative: Disable Hermes (Last Resort)

If all else fails, you can temporarily disable Hermes:

1. Create a `react-native.config.js` file in your project root:

```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    'react-native': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native/android',
          packageImportPath: 'import io.invertase.firebase.BuildConfig;',
        },
        ios: {
          project: 'ios/LAReactNative.xcodeproj',
        },
      },
    },
  },
};
```

2. Modify `metro.config.js`:

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    silent: true,
  },
  transformer: {
    hermesParser: false, // Disable Hermes
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

3. Rebuild and test.

## Verification Steps

After implementing the solutions:

1. **Build verification**:

   ```bash
   ./ios/validate_dsym.sh
   ```

2. **Archive verification**:

   - After archiving in Xcode, right-click the archive
   - Show in Finder
   - Navigate to `dSYMs` folder
   - Verify `hermes.framework.dSYM` exists

3. **Upload to TestFlight**:
   - Use Xcode's Organizer to upload
   - Monitor for any symbol upload errors

## Common Issues and Solutions

### Issue: "hermes.framework not found"

**Solution**: Ensure Hermes is properly installed and the build configuration is correct.

### Issue: "dSYM UUIDs don't match"

**Solution**: Clean build folder and rebuild. UUIDs must match between binary and dSYM.

### Issue: "dSYM is empty"

**Solution**: Check build settings, ensure `Debug Information Format` is set correctly.

### Issue: Persistent TestFlight errors

**Solution**: Try the manual dSYM generation approach or temporarily disable Hermes.

## Support Scripts

The following scripts are available to help with the process:

- `./ios/enhanced_hermes_dsym.sh` - Enhanced dSYM generation
- `./ios/validate_dsym.sh` - Validate existing dSYM files
- `./ios/generate_hermes_dsym.sh` - Basic dSYM generation

## Notes

- This issue is common with React Native 0.76+ and Hermes
- TestFlight requirements are stricter than App Store requirements
- Always test with a clean build when troubleshooting
- The solution may vary depending on your specific Xcode/iOS version
