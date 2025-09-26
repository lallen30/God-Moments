# Custom Notification Sound Troubleshooting Guide

## Current Setup Status ✅

### Files in Place:
- ✅ `src/assets/audio/church_bell.wav` - Source audio file
- ✅ `android/app/src/main/res/raw/church_bell.wav` - Android sound file
- ✅ `ios/GodMoments/church_bell.wav` - iOS sound file
- ✅ Laravel services updated to use `church_bell.wav`

### Configuration Updated:
- ✅ `react-native.config.js` - Added audio assets
- ✅ `NotificationService.php` - Uses `church_bell.wav`
- ✅ `SchedulingService.php` - Uses `church_bell.wav`
- ✅ Asset linking completed with `npx react-native-asset`

## Audio File Specifications ✅
- **Format**: RIFF WAVE audio
- **Bit Depth**: 16-bit
- **Channels**: Mono
- **Sample Rate**: 44.1kHz
- **File Size**: ~215KB
- **Duration**: Should be under 30 seconds for iOS notifications

## Troubleshooting Steps

### 1. iOS Specific Issues

#### Check if file is in Xcode project:
1. Open `ios/GodMoments.xcworkspace` in Xcode
2. Look for `church_bell.wav` in the project navigator
3. If missing, drag and drop the file from Finder into Xcode
4. Ensure "Add to target" is checked for GodMoments

#### iOS Sound Requirements:
- File must be in main bundle (not in subfolder)
- Supported formats: aiff, wav, or caf
- Duration: 30 seconds or less
- File size: Under 1MB recommended

### 2. Android Specific Issues

#### Verify file location:
- File must be in `android/app/src/main/res/raw/`
- Filename should be lowercase with no special characters
- No file extension in OneSignal parameter (just `church_bell`)

### 3. OneSignal Configuration

#### Test with OneSignal Dashboard:
1. Go to OneSignal dashboard
2. Send test notification manually
3. In "Options" → "Sound" → Select "Custom Sound"
4. Enter `church_bell.wav` for iOS and `church_bell` for Android

#### Verify OneSignal Payload:
The notification payload should include:
```json
{
  "ios_sound": "church_bell.wav",
  "android_sound": "church_bell"
}
```

### 4. Build and Test Steps

#### Clean and Rebuild:
```bash
# Clean React Native
cd /path/to/God-Moments-react-app
npx react-native start --reset-cache

# Clean iOS
cd ios
rm -rf build
xcodebuild clean

# Clean Android
cd android
./gradlew clean

# Rebuild
npx react-native run-ios
npx react-native run-android
```

#### Test Notification:
1. Use the test script: `test-notification-sound.php`
2. Replace `YOUR_TEST_PLAYER_ID` with actual OneSignal Player ID
3. Run: `php test-notification-sound.php`

### 5. Alternative Solutions

#### If custom sound still doesn't work:

1. **Use shorter filename**: Try `bell.wav` instead of `church_bell.wav`
2. **Convert audio format**: 
   ```bash
   # Convert to iOS-optimized format
   ffmpeg -i church_bell.wav -ar 44100 -ac 1 -c:a pcm_s16le bell.wav
   ```
3. **Test with default sound first**: Ensure notifications work with `"default"` sound
4. **Check device notification settings**: Ensure app has sound permissions

### 6. Debug Information

#### Check OneSignal Response:
The OneSignal API response should show:
```json
{
  "id": "notification-id",
  "recipients": 1,
  "errors": []
}
```

#### Check Device Logs:
- **iOS**: Use Xcode console to see notification delivery logs
- **Android**: Use `adb logcat` to see OneSignal logs

### 7. Production Deployment

#### Files to upload:
1. **Laravel**: Upload updated `NotificationService.php` and `SchedulingService.php`
2. **React Native**: Rebuild and deploy app with audio files included

#### Verification:
1. Send test notification from production Laravel
2. Verify custom sound plays on both iOS and Android devices
3. Test with different devices and OS versions

## Current Status: Ready for Testing 🚀

The custom church bell sound is configured and should work. If you're still hearing the default sound:

1. **Rebuild the app** completely (clean build)
2. **Test with OneSignal dashboard** first
3. **Check device notification permissions**
4. **Verify the audio file is in the correct locations**

The most common issue is that the iOS file needs to be properly added to the Xcode project, not just copied to the directory.
