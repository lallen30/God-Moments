# Add Custom Sound to Xcode Project

## The Problem
iOS requires notification sounds to be in **CAF (Core Audio Format)** for reliable playback. The `.wav` file wasn't being recognized by iOS notifications.

## Solution - Add church_bell.caf to Xcode

### Step 1: Open Xcode Project
```bash
open ios/GodMoments.xcworkspace
```

### Step 2: Add the CAF File to Xcode
1. In Xcode's left sidebar (Project Navigator), locate the **GodMoments** folder
2. **Drag and drop** the file `ios/GodMoments/church_bell.caf` into the GodMoments folder in Xcode
3. In the dialog that appears:
   - ✅ Check **"Copy items if needed"**
   - ✅ Check **"Create groups"**
   - ✅ Make sure **"GodMoments"** target is selected (not GodMomentsTests)
   - Click **"Finish"**

### Step 3: Verify the File is Added
1. Click on the **GodMoments** project in the left sidebar
2. Select the **GodMoments** target
3. Go to **"Build Phases"** tab
4. Expand **"Copy Bundle Resources"**
5. Verify that **church_bell.caf** is listed there

### Step 4: Clean and Rebuild
1. In Xcode menu: **Product → Clean Build Folder** (Shift+Cmd+K)
2. **Product → Build** (Cmd+B)
3. If successful, **run the app on your iPhone** (Cmd+R)

### Step 5: Test the Notification Sound
After the app is installed on your iPhone, the custom sound should work!

## Files Already Updated on Server
✅ `cron-final-production.php` - now uses `church_bell.caf`
✅ `PushNotificationService.php` - now uses `church_bell.caf`
✅ `SchedulingService.php` - now uses `church_bell.caf`
✅ `NotificationService.php` - now uses `church_bell.caf`

## What Changed
- **Before**: `ios_sound: 'church_bell.wav'` ❌ (not recognized by iOS)
- **After**: `ios_sound: 'church_bell.caf'` ✅ (iOS-compatible format)

## Why CAF Format?
Apple recommends CAF format for iOS notification sounds because:
- It's optimized for iOS
- Better compression
- More reliable playback
- Native iOS format

## Troubleshooting
If the sound still doesn't work after rebuilding:
1. Make sure the app was **completely uninstalled** and **reinstalled**
2. Check that notifications are enabled in iPhone Settings → God Moments
3. Make sure the iPhone is not in Silent mode (check the physical switch)
4. Verify the sound file is in Bundle Resources in Xcode
