# God Moments - Updated Android Assets

## ✅ What Was Updated

### 📱 App Icons
**Source:** iOS AppIcon 1024x1024 (`Icon-App-1024x1024@1x.png`)

**Created Android icons:**
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

**Created Android round icons:**
- `mipmap-mdpi/ic_launcher_round.png` (48x48)
- `mipmap-hdpi/ic_launcher_round.png` (72x72)
- `mipmap-xhdpi/ic_launcher_round.png` (96x96)
- `mipmap-xxhdpi/ic_launcher_round.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher_round.png` (192x192)

---

### 🎨 Splash Screen
**Source:** iOS LaunchImage (`jesus.png` - 646KB)

**Created Android splash screens:**
- `drawable-mdpi/splash_image.png` (480px max)
- `drawable-hdpi/splash_image.png` (720px max)
- `drawable-xhdpi/splash_image.png` (960px max)
- `drawable-xxhdpi/splash_image.png` (1440px max)
- `drawable-xxxhdpi/splash_image.png` (1920px max)

**Updated configuration:**
- Modified `android/app/src/main/res/drawable/splash_screen.xml`
- Changed splash image reference to use new `splash_image` drawable

---

## 📦 New APK Built

**Location:**
```
/Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app/android/app/build/outputs/apk/release/app-release.apk
```

**Changes in this build:**
- ✅ New app launcher icon (from iOS assets)
- ✅ New splash screen (Jesus image from iOS)
- ✅ All optimized for different Android screen densities
- ✅ Properly signed with release keystore

---

## 🔍 How to Test

### 1. Test on Emulator
```bash
adb uninstall com.bluestoneapps.godmoments
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 2. Check the Icon
- Look at your app drawer
- The icon should now match your iOS app icon

### 3. Check the Splash Screen
- Force close the app
- Launch it again
- You should see the Jesus image as the splash screen

---

## 📸 What Testers Will See

**App Icon:**
- Same icon as iOS version
- Appears in launcher, app drawer, and recent apps
- Adapts to device theme (round/square/squircle based on device)

**Splash Screen:**
- Jesus image centered on screen
- Shows briefly while app loads
- Same image as iOS launch screen

---

## 🎯 Next Steps

1. **Test the APK** on your device/emulator
2. **Send to testers** using the distribution methods in `TESTING_DISTRIBUTION.md`
3. **Collect feedback** on the new branding
4. When ready, **submit to Google Play** using `GOOGLE_PLAY_DEPLOYMENT.md`

---

## 📂 Asset Files

**iOS Source Assets:**
- App Icon: `ios/GodMoments/Images.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png`
- Splash: `ios/GodMoments/Images.xcassets/LaunchImage.imageset/jesus.png`

**Android Generated Assets:**
- Icons: `android/app/src/main/res/mipmap-*/`
- Splash: `android/app/src/main/res/drawable-*/splash_image.png`

**Configuration:**
- Splash XML: `android/app/src/main/res/drawable/splash_screen.xml`

---

**Updated:** 2025-10-09
**Build:** Release APK with new iOS-sourced assets
