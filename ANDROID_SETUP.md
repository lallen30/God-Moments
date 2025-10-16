# Android Setup Guide - God Moments App

## ✅ Build Status
The Android APK has been successfully built! The JDK issue has been resolved by configuring Gradle to use JDK 17.

## Configuration Changes Made

### 1. Fixed JDK Version
Added to `android/gradle.properties`:
```properties
org.gradle.java.home=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```
This ensures Gradle always uses JDK 17 (required for React Native 0.76+).

## Testing Options

### Option 1: Physical Android Device (Recommended for notifications)

1. **Enable Developer Mode** on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Developer Options will be enabled

2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"
   - Connect device via USB

3. **Verify Connection**:
   ```bash
   adb devices
   ```
   You should see your device listed.

4. **Run the App**:
   ```bash
   cd /Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app
   npx react-native run-android
   ```

### Option 2: Android Emulator

1. **Open Android Studio**
2. **Open Device Manager**: Tools > Device Manager
3. **Create Virtual Device** if none exists:
   - Click "Create Device"
   - Select a phone (e.g., Pixel 6)
   - Select Android 13 (API 33) or higher
   - Click "Finish"

4. **Launch Emulator** from Device Manager

5. **Verify Emulator is Running**:
   ```bash
   adb devices
   ```

6. **Run the App**:
   ```bash
   cd /Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app
   npx react-native run-android
   ```

### Option 3: Install APK Directly

1. **Transfer APK** to your Android device:
   - Email it to yourself
   - Use cloud storage (Google Drive, Dropbox)
   - Use adb: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

2. **Install APK** on device:
   - Open the APK file on your device
   - Allow installation from unknown sources if prompted
   - Tap "Install"

## Testing OneSignal Notifications (Android)

Based on your memory, OneSignal is configured with these Android-specific settings:

### AndroidManifest.xml Configuration
- ✅ Launch mode: `singleTop` (critical for notification handling)
- ✅ Deep link scheme: `godmoments`
- ✅ OneSignal notification icon configured
- ✅ POST_NOTIFICATIONS permission for Android 13+

### OneSignalService.ts (Android-specific)
- ✅ Android-specific delays for notification click handling (100ms, 300ms)
- ✅ Android app state change monitoring
- ✅ Platform-specific handling for bringing app to foreground

### Test Notifications

1. **Launch the app** on your Android device/emulator
2. **Check logs** for OneSignal initialization:
   ```bash
   npx react-native log-android
   ```
   Look for:
   - `🚀 [OneSignal] Starting initialization`
   - `✅ [OneSignal] Login successful`
   - `✅ OneSignal User ID found`

3. **Send test notification** from OneSignal dashboard:
   - Go to https://app.onesignal.com
   - Navigate to Messages > Push
   - Click "New Push"
   - Target: All Users or specific device
   - Send notification

4. **Test notification click**:
   - Tap the notification
   - App should open/come to foreground
   - Check logs for click handling

## Common Issues & Solutions

### Issue: "Adb - No devices and/or emulators connected"
**Solution**: Launch an emulator or connect a physical device, then verify with `adb devices`.

### Issue: "JDK version mismatch"
**Solution**: Already fixed! `gradle.properties` now forces JDK 17.

### Issue: "Build fails with CMake errors"
**Solution**: Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Issue: Notifications not received on Android
**Solution**: 
1. Check `google-services.json` is present in `android/app/`
2. Verify Firebase project matches package name: `com.bluestoneapps.miinojibwe`
3. Check OneSignal App ID is correct: `2613c87d-4f81-4094-bd84-08495e68bda0`
4. Ensure device has internet connection
5. Check notification permissions are granted

## Important Files

- **APK Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Gradle Config**: `android/gradle.properties`
- **Android Manifest**: `android/app/src/main/AndroidManifest.xml`
- **Build Gradle**: `android/app/build.gradle`
- **Firebase Config**: `android/app/google-services.json`
- **OneSignal Service**: `src/services/OneSignalService.ts`

## Quick Commands Reference

```bash
# Check devices
adb devices

# Build APK
cd android && ./gradlew assembleDebug

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Run app on device/emulator
npx react-native run-android

# View Android logs
npx react-native log-android

# Clear app data on device
adb shell pm clear com.bluestoneapps.miinojibwe

# Uninstall app
adb uninstall com.bluestoneapps.miinojibwe
```

## Next Steps After Installation

1. Grant notification permissions when prompted
2. Complete account setup with timezone and time window
3. Wait for scheduled notification (or send test from OneSignal dashboard)
4. Test notification click behavior
5. Verify device registration in OneSignal dashboard

## Need Help?

If you encounter issues:
1. Check logs: `npx react-native log-android`
2. Verify device is connected: `adb devices`
3. Check OneSignal dashboard for device registration
4. Ensure Firebase/OneSignal configuration is correct
