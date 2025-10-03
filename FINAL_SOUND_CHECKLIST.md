# Final Sound Troubleshooting Checklist

## ✅ Confirmed Working:
- Sound file `church_bell.caf` EXISTS in app bundle
- File format is CORRECT (CAF, 44100 Hz, 2.5 seconds)
- File is in ROOT of app bundle (correct location)
- OneSignal notifications ARE being delivered
- Server is sending `ios_sound: 'church_bell'` parameter

## 🔍 Possible Issues:

### 1. iPhone Notification Settings
**Check on iPhone:**
- Settings → God Moments → Notifications
- Make sure "Sounds" is ON (not off)
- Make sure "Alerts" style is "Banners" or "Alerts" (not "None")
- Try toggling Sounds OFF then back ON

### 2. iOS Silent Mode
- Check the physical switch on the left side of iPhone
- Orange showing = Silent mode (notifications won't make sound)
- Flip it so NO orange is showing

### 3. Do Not Disturb / Focus Mode
- Swipe down from top-right (Control Center)
- Make sure Focus/Do Not Disturb is OFF
- Check Settings → Focus

### 4. Volume Level
- Press volume UP button on iPhone
- Make sure "Ringer" volume is up (not just media volume)
- Settings → Sounds & Haptics → check "Ringer and Alerts" slider

### 5. iOS Notification Sound Cache
Sometimes iOS caches notification sounds. Try:
- Restart the iPhone completely
- After restart, test notification again

### 6. App Notification Permissions
- Settings → God Moments → Notifications
- Make sure "Allow Notifications" is ON
- Make sure "Sounds" toggle is ON

### 7. Test with Built-in Sound
If the test with 'default' sound ALSO doesn't make noise:
- The issue is iPhone settings, not the custom sound
- Check all settings above

If 'default' DOES make sound but 'church_bell' doesn't:
- There might be an issue with how iOS recognizes the custom sound
- Try renaming the file or using a different format

## 🧪 Run This Test:

Upload and run: `test-all-sound-formats.php`

This tests 6 different ways to reference the sound file.
One of them should work!

## 🎯 Alternative Solution:

If nothing works, we can try:
1. Using the .wav file instead of .caf
2. Converting to a different audio format
3. Using a shorter/simpler filename
4. Adding the sound to a different location in the bundle

## 📞 Next Steps:

1. Run `test-all-sound-formats.php`
2. Tell me which test number (1-6) plays a sound
3. Check ALL iPhone settings above
4. Try restarting iPhone

If test #6 (default) makes sound but none of 1-5 do,
then iOS is not recognizing the custom sound file for some reason.
