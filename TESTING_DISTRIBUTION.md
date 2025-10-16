# God Moments - APK Distribution for Testing

## 📦 Release APK Location

**Signed Release APK:**
```
/Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app/android/app/build/outputs/apk/release/app-release.apk
```

**File size:** ~50-80 MB (typical for React Native apps)

---

## 📤 How to Distribute to Testers

### Option 1: Direct File Sharing (Easiest)

1. **Email the APK**
   - Attach `app-release.apk` to an email
   - Send to testers with installation instructions

2. **Cloud Storage**
   - Upload to Google Drive / Dropbox / OneDrive
   - Share the link with testers
   - Make sure link allows download without sign-in

3. **File Transfer Services**
   - WeTransfer: https://wetransfer.com
   - Send Anywhere: https://send-anywhere.com
   - Or any file sharing service you prefer

---

### Option 2: Firebase App Distribution (Recommended for Multiple Testers)

Firebase App Distribution makes it easy to manage multiple testers:

1. Go to: https://console.firebase.google.com/project/god-moments/appdistribution
2. Click **"Get started"**
3. Upload `app-release.apk`
4. Add tester emails
5. Firebase sends them an email with download link
6. Testers can install directly from Firebase

**Benefits:**
- Tracks who installed the app
- Easy to send updates
- Testers get notifications for new versions
- Professional distribution system

---

## 📱 Installation Instructions for Testers

Send these instructions to your testers:

---

### **Installing God Moments APK on Android**

**Step 1: Enable Unknown Sources**

1. Open **Settings** on your Android device
2. Go to **Security** or **Privacy** (varies by device)
3. Find **Install unknown apps** or **Unknown sources**
4. Enable it for your browser or file manager
5. (On newer Android: Go to Settings → Apps → Special app access → Install unknown apps → Enable for Chrome/Files)

**Step 2: Download the APK**

1. Open the link/email I sent you
2. Download the `app-release.apk` file
3. Your device may show a warning - this is normal for apps outside Google Play
4. Click **OK** to download

**Step 3: Install the App**

1. Open your **Downloads** folder or notification
2. Tap on `app-release.apk`
3. Tap **Install**
4. If prompted, allow installation from this source
5. Wait for installation to complete
6. Tap **Open** to launch God Moments!

**Step 4: Grant Permissions**

When you first open the app:
1. Allow notification permissions when prompted
2. This is required for prayer reminders to work
3. Set up your notification preferences

**Troubleshooting:**

- **"App not installed":** Make sure you enabled unknown sources
- **"Package appears corrupt":** Re-download the APK file
- **Can't find the APK:** Check your Downloads folder or notification bar
- **Still having issues?** Contact me at kevin@bluestoneapps.com

---

## 🔄 Sending Updates

When you need to send a new version to testers:

1. **Increment version in** `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.2"  // Update version
   ```

2. **Rebuild the APK:**
   ```bash
   cd android && ./gradlew assembleRelease
   ```

3. **Find the new APK:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

4. **Send to testers** using the same method

**Note:** Testers can install the new version over the old one - no need to uninstall first!

---

## ✅ Testing Checklist

Ask your testers to verify:

**Basic Functionality:**
- [ ] App launches successfully
- [ ] Can navigate through all screens
- [ ] Settings can be changed
- [ ] App doesn't crash

**Notifications:**
- [ ] Can set notification time preferences
- [ ] Receives notification permission prompt
- [ ] Gets 2 notifications per day at scheduled times
- [ ] Notifications show correct content
- [ ] Tapping notification opens the app

**Performance:**
- [ ] App runs smoothly
- [ ] No freezing or lag
- [ ] Battery usage is reasonable
- [ ] No unusual heating

**Device Testing:**
- [ ] Test on different Android versions (Android 7+)
- [ ] Test on different screen sizes
- [ ] Test on different manufacturers (Samsung, Google, etc.)

---

## 📝 Collecting Feedback

**Create a Feedback Form:**

Use Google Forms, Typeform, or similar to collect:
- Device model and Android version
- What worked well?
- What didn't work?
- Any crashes or errors?
- Feature requests
- Overall rating (1-5 stars)

**Example Questions:**
1. What device are you using? (e.g., Samsung Galaxy S21, Android 12)
2. Did the app install successfully?
3. Are you receiving notifications at the scheduled times?
4. Rate the app's performance (1-5)
5. What features would you like to see?
6. Any bugs or issues to report?

---

## 🚀 After Testing

Once testing is complete and feedback is addressed:

1. **Fix any reported bugs**
2. **Increment version** one more time
3. **Build final release** (AAB for Play Store)
4. **Submit to Google Play Console**

---

## 📞 Support

**Developer:** Bluestone Apps
**Contact:** kevin@bluestoneapps.com
**OneSignal App ID:** 2613c87d-4f81-4094-bd84-08495e68bda0
**Package Name:** com.bluestoneapps.godmoments

---

**Build Date:** 2025-10-09
**Version:** 1.0.1 (Version Code: 1)
**Build Type:** Signed Release APK
