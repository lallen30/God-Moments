# iOS Deployment Summary - God Moments

## 📱 Project Overview

**Current Situation:**
- Client has added your Apple Developer email to their account
- Existing app "God Moments" in App Store (version 5.0.0)
- Current bundle ID: `hr.apps.219596`
- Your dev app bundle ID: `com.bluestoneapps.godmomentsdevapp`
- Goal: Replace existing app with new React Native version

---

## 🎯 Key Decision: Bundle ID Strategy

### Option A: Replace Existing App ⭐ RECOMMENDED
**Bundle ID:** `hr.apps.219596`

**Pros:**
- ✅ Seamless update for existing users
- ✅ Keeps all reviews and ratings
- ✅ Maintains download history
- ✅ No user action required

**Cons:**
- ⚠️ Must use existing certificates/profiles
- ⚠️ Inherits any existing issues

**Best for:** Continuity and user retention

### Option B: New App Listing
**Bundle ID:** `com.bluestoneapps.godmoments` (or client's choice)

**Pros:**
- ✅ Clean start
- ✅ Full control over certificates
- ✅ Can rebrand if needed

**Cons:**
- ❌ Users must download new app
- ❌ Lose all reviews and ratings
- ❌ Old app stays in store (unless removed)
- ❌ Confusing for existing users

**Best for:** Major rebrand or fresh start

---

## 📋 What You Need to Do

### 1. Bundle ID Changes

**Files to Update:**
- `ios/godmoments.xcodeproj/project.pbxproj` (4 occurrences)
- Update in Xcode: Signing & Capabilities tab

**Quick Method:**
```bash
cd God-Moments-react-app
./scripts/update-bundle-id.sh
```

**Manual Method:**
1. Open `ios/godmoments.xcworkspace` in Xcode
2. Select GodMoments target → Signing & Capabilities
3. Change Bundle Identifier to your chosen bundle ID

### 2. Certificates & Keys

**You Need:**
1. **Distribution Certificate** (.cer)
   - For signing app for App Store
   - Get from: Apple Developer Portal → Certificates
   - Install by double-clicking

2. **APNs Key** (.p8)
   - For push notifications (OneSignal)
   - Get from: Apple Developer Portal → Keys
   - ⚠️ Can only download ONCE - save securely!

3. **Provisioning Profiles** (.mobileprovision)
   - Links app, certificate, and devices
   - Get from: Apple Developer Portal → Profiles
   - Create for: Main app + OneSignal extension

### 3. Version Number

**Current App Store Version:** 5.0.0  
**Your Current Version:** 1.0.1  
**Required New Version:** ≥ 5.0.1 (recommend 6.0.0)

**Update in:**
- `ios/godmoments/Info.plist`
- Xcode: Target → General tab

### 4. Xcode Configuration

**Critical Settings:**
- ❌ **Uncheck** "Automatically manage signing"
- ✅ Select your Team
- ✅ Select provisioning profile
- ✅ Verify "Apple Distribution" certificate
- ✅ Set scheme to "Release"

### 5. Build & Upload

**Steps:**
1. Product → Archive
2. Validate App
3. Distribute App → App Store Connect
4. Upload
5. Wait for processing

### 6. TestFlight

**Setup:**
1. Go to App Store Connect
2. TestFlight tab
3. Wait for build processing
4. Add internal testers
5. Install TestFlight app on device
6. Test the app

### 7. App Store Submission

**Prepare:**
- Screenshots (all required sizes)
- App description
- Keywords
- Privacy policy URL
- Support URL

**Submit:**
1. Create new version
2. Select build
3. Fill in metadata
4. Submit for review
5. Wait 24-48 hours

---

## 📚 Documentation Created

### Quick Start (Start Here!)
**File:** `QUICK_START_IOS_DEPLOYMENT.md`
- Fast track guide (2-3 hours)
- Step-by-step with time estimates
- Common issues and fixes

### Complete Guide (Reference)
**File:** `IOS_DEPLOYMENT_GUIDE.md`
- Comprehensive instructions
- All options explained
- Detailed troubleshooting

### Certificates Guide (Technical)
**File:** `CERTIFICATES_AND_KEYS_GUIDE.md`
- Certificate creation
- Key management
- Security best practices

### Checklist (Track Progress)
**File:** `IOS_DEPLOYMENT_CHECKLIST.md`
- Printable checklist
- Track each step
- Document issues

### Bundle ID Script (Automation)
**File:** `scripts/update-bundle-id.sh`
- Automated bundle ID update
- Interactive prompts
- Backup creation

---

## ⚡ Quick Commands

```bash
# Navigate to project
cd God-Moments-react-app

# Update bundle ID (interactive)
./scripts/update-bundle-id.sh

# Install dependencies
cd ios && pod install && cd ..

# Open in Xcode
open ios/godmoments.xcworkspace

# Verify certificates
security find-identity -v -p codesigning

# Clean build (if needed)
cd ios
xcodebuild clean -workspace godmoments.xcworkspace -scheme GodMoments
cd ..
```

---

## 🔑 Important Information

### OneSignal Configuration
**App ID:** `2613c87d-4f81-4094-bd84-08495e68bda0`  
**Already configured in:**
- `ios/godmoments/Info.plist` (lines 65-70)
- React Native service files

**Action Required:**
- Update OneSignal dashboard with APNs key (if new key created)

### Current App Details (from screenshot)
- **Name:** God Moments
- **Subtitle:** A daily reminder
- **Bundle ID:** hr.apps.219596
- **SKU:** HR_219596
- **Apple ID:** 1615759962
- **Version:** 5.0.0
- **Category:** Books

### Version Strategy
**Recommended:** 6.0.0
- Signals major update
- Higher than current 5.0.0
- Avoids confusion with 5.x versions

---

## ⏱️ Time Estimates

| Task | First Time | Subsequent |
|------|-----------|------------|
| Bundle ID update | 10 min | 5 min |
| Certificate setup | 60 min | 10 min |
| Xcode configuration | 15 min | 5 min |
| Build & archive | 15 min | 10 min |
| Upload to App Store | 30 min | 20 min |
| TestFlight setup | 20 min | 10 min |
| App Store submission | 60 min | 30 min |
| **Total** | **3-4 hours** | **1-2 hours** |

*Note: Apple processing times (10-30 min) and review times (24-48 hours) not included*

---

## ✅ Success Criteria

You're ready for production when:

- [x] Bundle ID updated to chosen ID
- [x] Distribution certificate installed
- [x] APNs key configured
- [x] Provisioning profiles created and installed
- [x] Xcode signing configured (manual, not automatic)
- [x] Version number updated to ≥ 6.0.0
- [x] Build archives successfully
- [x] Upload to App Store Connect succeeds
- [x] Build appears in TestFlight
- [x] App installs from TestFlight
- [x] Push notifications work
- [x] All features tested
- [x] No crashes or critical bugs

---

## 🚨 Common Pitfalls to Avoid

1. **Don't use automatic signing** for App Store builds
   - Always use manual signing
   - Select specific provisioning profile

2. **Don't forget to update version number**
   - Must be higher than current App Store version
   - Update in both Info.plist and Xcode

3. **Don't lose the APNs .p8 key file**
   - Can only download once
   - Save in secure location immediately

4. **Don't skip validation step**
   - Always validate before uploading
   - Catches issues early

5. **Don't use development certificates**
   - Must use Distribution certificate
   - Check certificate type in Keychain

6. **Don't forget the notification extension**
   - Needs separate provisioning profile
   - Must be signed correctly

7. **Don't submit without testing**
   - Test thoroughly on TestFlight first
   - Get feedback from team

---

## 📞 Support Resources

### Apple
- **Developer Portal:** https://developer.apple.com/account
- **App Store Connect:** https://appstoreconnect.apple.com
- **Support:** 1-800-633-2152 (US)
- **Documentation:** https://developer.apple.com/documentation/

### OneSignal
- **Dashboard:** https://app.onesignal.com
- **Documentation:** https://documentation.onesignal.com
- **Support:** https://onesignal.com/support

### Project Files
- **Main Project:** `/Users/lallen30/Documents/bluestoneapps/clients/God-Moments/repos/God-Moments-react-app`
- **iOS Project:** `ios/godmoments.xcworkspace`
- **Scripts:** `scripts/update-bundle-id.sh`

---

## 🎯 Recommended Workflow

### Phase 1: Preparation (Day 1)
1. Read `QUICK_START_IOS_DEPLOYMENT.md`
2. Verify Apple Developer access
3. Decide on bundle ID strategy
4. Run bundle ID update script
5. Get certificates and keys

### Phase 2: Configuration (Day 1-2)
1. Configure Xcode signing
2. Update version number
3. Test build locally
4. Create archive
5. Validate archive

### Phase 3: TestFlight (Day 2-3)
1. Upload to App Store Connect
2. Wait for processing
3. Add testers
4. Install and test
5. Gather feedback

### Phase 4: Production (Day 4-7)
1. Prepare App Store assets
2. Create new version
3. Submit for review
4. Monitor review status
5. Release when approved

---

## 📝 Notes for Client

**What client needs to know:**
- You have access to their Apple Developer account
- You'll be replacing the existing app with new version
- Existing users will get automatic update
- No action required from users
- All data and reviews will be preserved (if using existing bundle ID)

**What client needs to provide:**
- Confirmation of bundle ID strategy
- App Store screenshots (if not provided)
- Updated privacy policy URL (if changed)
- Support URL
- Any specific release timing requirements

---

## 🔄 Maintenance

### After Initial Release

**Regular Tasks:**
- Monitor crash reports
- Review user feedback
- Update app for iOS updates
- Renew certificates annually
- Update dependencies

**Version Updates:**
- Increment version number for each release
- Increment build number for each upload
- Follow semantic versioning (MAJOR.MINOR.PATCH)

**Certificate Renewal:**
- Distribution certificate: Every 1 year
- Provisioning profiles: Every 1 year
- APNs key: Never expires

---

## 🎉 Final Checklist

Before starting deployment:

- [ ] Read `QUICK_START_IOS_DEPLOYMENT.md`
- [ ] Have 2-3 hours of uninterrupted time
- [ ] Have access to Apple Developer account
- [ ] Have Mac with Xcode installed
- [ ] Have physical iOS device for testing (optional)
- [ ] Have decided on bundle ID strategy
- [ ] Have client approval to proceed

**Ready to start? Begin with:** `QUICK_START_IOS_DEPLOYMENT.md`

---

**Last Updated:** October 21, 2024  
**Project:** God Moments iOS Deployment  
**Status:** Ready for deployment  

**Good luck! 🚀**
