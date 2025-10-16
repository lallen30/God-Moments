# God Moments - Google Play Console Deployment Guide

## 📦 Release Build Location

**Android App Bundle (AAB):**
```
/Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app/android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔐 Signing Credentials (KEEP SECURE!)

**Keystore File:**
```
/Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app/android/keystores/godmoments-upload.keystore
```

**Credentials:**
- **Store Password:** `GodMoments2025!`
- **Key Alias:** `upload`
- **Key Password:** `GodMoments2025!`

⚠️ **IMPORTANT:** 
- **BACKUP the keystore file** - store it securely (e.g., encrypted cloud storage)
- If you lose this keystore, you cannot update the app on Google Play
- Never commit the keystore to Git

---

## 📱 App Information

- **Package Name:** `com.bluestoneapps.godmoments`
- **App Name:** God Moments
- **Version Code:** 1
- **Version Name:** 1.0.1

---

## 🚀 Google Play Console Steps (Updated for 2025 Interface)

### 1. Create Google Play Console Account
- Go to: https://play.google.com/console
- Sign in with your Google account
- Pay the one-time $25 developer registration fee (if not already registered)

### 2. Create New App
1. Click **"Create app"** (top right)
2. Fill in:
   - **App name:** God Moments
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
3. Accept declarations and click **"Create app"**

### 3. Dashboard Setup Tasks

Once your app is created, you'll see the Dashboard with task sections. Complete them in order:

---

#### 📋 **SECTION: Set up your app**

Click **"View tasks"** to expand, then complete each task:

##### Task 1: Set up your app
Click **"View tasks"** to see sub-tasks:

1. **App access**
   - Select: "All functionality is available without special access"
   - Or if notifications require setup: "All or some functionality is restricted"

2. **Ads**
   - Select: "No, my app doesn't contain ads" (or Yes if applicable)

3. **Content rating**
   - Click **"Start questionnaire"**
   - Category: Reference, news or educational
   - Answer questions honestly (likely result: EVERYONE rating)
   - Get certificate and save

4. **Target audience and content**
   - Age groups: Select appropriate age groups (suggest: 13+ or Everyone)
   - Complete the questions

5. **News apps** (if prompted)
   - Select "No" unless this is a news app

6. **Data safety**
   - **Does your app collect or share user data?** Yes
   - **Data types collected:**
     - Device or other IDs (for push notifications)
   - **Data usage:** App functionality
   - **Data handling:** Data is encrypted in transit
   - **Can users request data deletion?** Yes
   - Complete all required fields

7. **Government apps** (if prompted)
   - Select "No"

8. **Financial features** (if prompted)
   - Select "No"

9. **Health connect** (if prompted)
   - Select "No"

---

##### Task 2: Store listing

Click to set up your store listing:

1. **App details**
   - **App name:** God Moments
   - **Short description:** (Max 80 characters)
     ```
     Daily prayer reminders and spiritual reflections to connect with God
     ```
   - **Full description:** (Max 4000 characters)
     ```
     God Moments helps you cultivate a daily practice of connecting with God through timely prayer reminders and spiritual reflections.

     Features:
     • Receive 2 personalized prayer notifications each day at times you choose
     • Set your preferred notification time window to fit your schedule
     • Daily spiritual reflections and inspirational God moments
     • Beautiful, simple interface designed for your faith journey
     • Fully customizable notification settings
     • Privacy-focused - no account required

     Whether you're starting your day, taking a midday break, or winding down in the evening, God Moments provides gentle reminders to pause, reflect, and connect with your faith.

     Perfect for:
     - Building a consistent prayer habit
     - Staying connected to your faith throughout the day
     - Finding moments of peace and reflection
     - Spiritual growth and mindfulness

     Download now and start your daily journey of faith and reflection. 🙏
     ```

2. **App icon**
   - Upload 512x512 PNG (hi-res icon)
   - Ensure it follows Google Play icon guidelines

3. **Feature graphic**
   - Upload 1024x500 PNG
   - Eye-catching graphic representing your app

4. **Phone screenshots**
   - Upload at least 2 screenshots (up to 8)
   - Recommended size: 1080x1920 or similar
   - Show key features: home screen, settings, notification examples

5. **7-inch tablet screenshots** (Optional but recommended)
   - If you have tablet-optimized layouts

6. **10-inch tablet screenshots** (Optional)

7. **Category**
   - **Application type:** Application
   - **Category:** Lifestyle
   - **Tags:** Add up to 5 tags like "Prayer", "Spirituality", "Christian", "Faith", "Meditation"

8. **Contact details**
   - **Email:** kevin@bluestoneapps.com (or your support email)
   - **Phone:** (Optional)
   - **Website:** (Optional but recommended)
   - **Privacy policy URL:** ⚠️ **REQUIRED** - Create and host a privacy policy page first

9. Click **"Save"** at the bottom

---

##### Task 3: Select an app category and provide contact details

This may be combined with store listing above. Ensure:
- Category: **Lifestyle**
- Contact email is valid
- Privacy policy URL is provided

---

##### Task 4: Set up your store listing

Complete all fields in the store listing (covered in Task 2 above)

---

#### 🚀 **SECTION: Release your app**

##### Task 1: Select countries and regions

1. Go to **Production** → **Countries / regions**
2. Select countries where you want to release:
   - **United States** (minimum)
   - Add other countries as desired
3. Save

---

##### Task 2: Create a release

1. Click **Production** in the left sidebar
2. Click **"Create new release"**
3. **Choose how to manage signing:**
   - Select: **"Google-managed key"** (recommended for new apps)
   - This allows Google to manage app signing for you
4. **App bundle:**
   - Click **"Upload"**
   - Select your AAB file: `app-release.aab`
   - Wait for upload to complete
5. **Release name:** 1.0.1 (auto-filled from versionName)
6. **Release notes:** (Add notes for users)
   ```
   Initial release of God Moments
   
   Features:
   • Daily prayer notifications (2 per day)
   • Customizable notification time windows
   • Spiritual reflections and God moments
   • Beautiful, simple interface
   • No account required - complete privacy
   ```
7. Click **"Next"**
8. **Review release:**
   - Check for any warnings or errors
   - Address any issues flagged by Google
9. Click **"Start rollout to Production"**
10. Confirm rollout

---

#### ⏱️ **Review Process**

- **Initial review:** Usually takes 1-7 days
- **Status:** Check Dashboard for review status
- **Common reasons for rejection:**
  - Missing privacy policy
  - Incomplete data safety form
  - Missing required permissions declarations
  - Screenshots don't match functionality
  
If rejected, address the issues and resubmit.

---

### 4. Complete Initial Setup Tasks

Google Play Console will show you a checklist. Ensure everything is marked complete:

✅ Set up your app
✅ Store listing complete
✅ Content rating received  
✅ Target audience set
✅ Data safety completed
✅ Countries/regions selected
✅ Release created and uploaded

---

### 5. Post-Submission

Once submitted:
1. **Monitor status** in Dashboard
2. **Respond promptly** to any Google queries
3. **Check email** for notifications
4. Once approved, your app will be **live on Google Play!**

---

## 📋 Pre-Launch Checklist

Before submitting to Google Play, ensure you have:

**Assets Ready:**
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] At least 2 phone screenshots (1080x1920)
- [ ] Privacy policy hosted and URL ready
- [ ] AAB file built and ready to upload

**Testing Complete:**
- [ ] App tested on multiple devices/emulators
- [ ] Notifications working correctly
- [ ] No crashes or critical bugs
- [ ] All features working as expected

**Console Tasks Complete:**
- [ ] App access declared
- [ ] Ads policy answered
- [ ] Content rating received
- [ ] Target audience set
- [ ] Data safety form completed
- [ ] Store listing filled (name, descriptions, graphics)
- [ ] Category and tags selected
- [ ] Contact details provided
- [ ] Privacy policy URL added
- [ ] Countries/regions selected
- [ ] AAB uploaded to Production release
- [ ] Release notes added

---

## 🔄 Future Updates

To release updates:

1. **Increment version in `android/app/build.gradle`:**
   ```gradle
   versionCode 2  // Increment by 1 each release
   versionName "1.0.2"  // Update as needed
   ```

2. **Rebuild AAB:**
   ```bash
   cd android && ./gradlew bundleRelease
   ```

3. **Upload to Play Console:**
   - Go to Release → Production → Create new release
   - Upload new AAB
   - Add release notes
   - Submit for review

---

## 📞 Support

**OneSignal App ID:** `2613c87d-4f81-4094-bd84-08495e68bda0`
**Firebase Project:** `god-moments`
**Firebase Project Number:** `787926181201`

---

## 🔗 Useful Links

- **Google Play Console:** https://play.google.com/console
- **OneSignal Dashboard:** https://onesignal.com/
- **Firebase Console:** https://console.firebase.google.com/project/god-moments
- **React Native Documentation:** https://reactnative.dev/docs/signed-apk-android

---

**Created:** 2025-10-09
**Build Type:** Production Release (Signed AAB)
