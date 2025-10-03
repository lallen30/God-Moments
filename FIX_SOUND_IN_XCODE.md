# Fix Church Bell Sound Not Playing

## The Issue
Notifications are working but playing DEFAULT sound instead of church bell.
This means `church_bell.caf` is NOT in the app bundle.

## Step-by-Step Fix

### 1. Open Xcode
```bash
cd /Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app
open ios/GodMoments.xcworkspace
```

### 2. Verify Sound File is Added to Project

**In Xcode's left sidebar (Project Navigator):**
- Look for `church_bell.caf` in the GodMoments folder
- It should appear in the file list

**If you DON'T see it:**
- Drag `ios/GodMoments/church_bell.caf` from Finder into Xcode's GodMoments folder
- When dialog appears:
  - ✅ Check "Copy items if needed"
  - ✅ Check "Create groups"
  - ✅ Select "GodMoments" target (NOT GodMomentsTests)
  - Click "Finish"

### 3. CRITICAL: Verify in Build Phases

This is the most important step!

1. Click on **GodMoments** project (blue icon at top of sidebar)
2. Select **GodMoments** target (under TARGETS)
3. Click **"Build Phases"** tab
4. Expand **"Copy Bundle Resources"**
5. **Look for `church_bell.caf` in the list**

**If church_bell.caf is NOT in "Copy Bundle Resources":**
- Click the **"+"** button at the bottom of the list
- Find and select **church_bell.caf**
- Click **"Add"**

### 4. Clean and Rebuild

**IMPORTANT: You MUST do a clean build!**

1. **Clean Build Folder**: 
   - Menu: Product → Clean Build Folder
   - Or: Shift + Cmd + K

2. **Delete app from iPhone**:
   - Long press the God Moments app on your iPhone
   - Tap "Remove App" → "Delete App"
   - This ensures old bundle is completely removed

3. **Build and Run**:
   - Menu: Product → Run
   - Or: Cmd + R
   - Wait for app to install on iPhone

### 5. Test the Sound

After the app installs, run the test:
```
https://godmoments.betaplanets.com/test-sound-simple.php
```

You should now hear the church bell! 🔔

## Troubleshooting

### Still hearing default sound?
1. Check iPhone Settings → God Moments → Notifications → Sounds is ON
2. Make sure iPhone is NOT in silent mode (check physical switch)
3. Verify the sound file is in Build Phases → Copy Bundle Resources

### How to verify sound is in app bundle:
After building, check the build output:
```bash
# In Terminal, from the react-app directory:
ls -la ios/build/Build/Products/Debug-iphoneos/GodMoments.app/ | grep church_bell
```

You should see `church_bell.caf` listed.

### Alternative: Use Archive Build
If Debug build doesn't work, try:
1. Product → Scheme → Edit Scheme
2. Change "Build Configuration" from Debug to Release
3. Clean and rebuild

## Why This Happens
Xcode doesn't automatically include all files in the project folder.
Files must be explicitly added to "Copy Bundle Resources" to be included in the app bundle.
