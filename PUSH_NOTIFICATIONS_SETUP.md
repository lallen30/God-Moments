# 🔧 Manual Push Notifications Setup Guide

## Current Status

✅ Entitlements file created: `ios/LAReactNative/LAReactNative.entitlements`  
❌ Push Notifications capability missing from Xcode project  
✅ Background Modes already configured  
✅ Bundle ID confirmed: `com.knoxweb.miin-ojibwe`

## Required Steps in Xcode

### Step 1: Open Xcode Project

```bash
open ios/LAReactNative.xcworkspace
```

### Step 2: Add Push Notifications Capability

1. In Xcode, select the **LAReactNative** project in the navigator
2. Select the **LAReactNative** target (not the project root)
3. Click on the **"Signing & Capabilities"** tab
4. Click the **"+ Capability"** button
5. Search for and add **"Push Notifications"**
6. Verify it appears in the capabilities list

### Step 3: Verify Entitlements

- After adding the capability, Xcode should automatically reference the entitlements file
- Verify that `LAReactNative.entitlements` appears in your project navigator
- If not, manually add it:
  1. Right-click on the LAReactNative folder
  2. "Add Files to LAReactNative"
  3. Select `ios/LAReactNative/LAReactNative.entitlements`

### Step 4: Check Code Signing

1. In **"Signing & Capabilities"** tab
2. Ensure **"Automatically manage signing"** is checked
3. Verify your Team is selected
4. Make sure Provisioning Profile allows Push Notifications

### Step 5: Verify Background Modes

Confirm these background modes are enabled:

- ✅ **Background App Refresh**
- ✅ **Remote notifications**

## After Making Changes

### Clean and Rebuild

```bash
npm run clean-ios
npm run ios
```

### Test the Changes

1. Run the app on device or simulator
2. Navigate to OneSignal Debug screen
3. Check for verbose OneSignal logs in console
4. Look for APNs device token registration

### Monitor Logs

```bash
./log-ios.sh
```

## Expected Results After Fix

### In OneSignal Debug Screen:

- ✅ Permission Status: "authorized"
- ✅ User ID: Should show actual ID instead of "pending"
- ✅ Registration should succeed

### In Console Logs:

- `APNs device token: <token_data>`
- `OneSignal User ID: <actual_user_id>`
- `Push notification registration successful`

## Troubleshooting

### If Push Notifications Still Don't Work:

1. **Delete and reinstall the app** (clean install)
2. **Check provisioning profile** includes Push Notifications
3. **Verify Apple Developer account** has Push Notifications enabled
4. **Check OneSignal dashboard** - App Settings → Keys & IDs

### If Capability Doesn't Stick:

1. Close Xcode completely
2. Delete `ios/build` folder
3. Run `cd ios && pod install`
4. Reopen Xcode and try again

## Next Steps After Fixing

1. Test notification delivery from OneSignal dashboard
2. Verify user appears in OneSignal dashboard under "Audience"
3. Test notification handling in app
4. Set up production APNs certificate for App Store builds
