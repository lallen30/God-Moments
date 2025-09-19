## OneSignal Push Notification Debugging Checklist

### Step 1: App Deployment & Initial Check

1. **Build & Deploy**: Run the app on your physical iPhone device
2. **Check Console Logs**: Look for OneSignal initialization messages in the console
3. **Navigate to Debug Screen**: Go to the OneSignal Debug Screen in the app

### Step 2: Verify OneSignal Initialization

In the OneSignal Debug Screen, confirm:

- ✅ **Initialized: YES** (if this shows "NO", there's an initialization problem)
- ✅ **OneSignal User ID**: Should show a valid ID (not "Initialized - ID pending..." or "Not Available")
- ✅ **Notification Permission: Granted** (if this shows "Denied" or "Not Asked", permissions need to be granted)

### Step 3: Grant Notification Permissions (if needed)

If permission shows as "Denied" or "Not Asked":

1. Go to iPhone Settings > Notifications > LAReactNative
2. Enable "Allow Notifications"
3. Enable all notification types (Lock Screen, Notification Center, Banners)
4. Return to app and refresh the debug screen

### Step 4: Test Push Notification

1. **Copy User ID**: From the debug screen, copy the OneSignal User ID
2. **Go to OneSignal Dashboard**:
   - Visit https://app.onesignal.com/
   - Navigate to your app
   - Go to Messages > Push Notifications
   - Click "Send Push Notification"
3. **Configure Test Message**:
   - Choose "Send to Particular Users"
   - Paste your OneSignal User ID in the "User IDs" field
   - Enter a test title and message
   - Click "Send Message"
4. **Verify Delivery**: The notification should appear on your device

### Step 5: Troubleshooting Common Issues

#### If "Initialized: NO"

- Check console logs for OneSignal errors
- Verify .env file has correct ONESIGNAL_APP_ID
- Restart the app completely

#### If User ID shows "Not Available" or "Initialized - ID pending..."

- Wait 30-60 seconds after app launch (OneSignal needs time to register)
- Refresh the debug screen
- Check internet connectivity
- Verify OneSignal App ID is correct

#### If Notification Permission is "Denied"

- Go to iPhone Settings > Notifications > LAReactNative
- Enable notifications
- Restart the app

#### If Notifications Don't Arrive

- Confirm notification permissions are granted
- Verify the User ID is correct
- Check OneSignal dashboard for delivery status
- Ensure the device has internet connectivity
- Try sending from OneSignal dashboard (not from code)

### Step 6: Advanced Debugging

#### Check iOS Device Logs

1. Connect iPhone to Mac
2. Open Console.app on Mac
3. Filter by device and "LAReactNative"
4. Look for OneSignal-related messages

#### Common OneSignal Log Messages to Look For

- "OneSignal initialize called"
- "OneSignal initialized successfully"
- "Notification permission requested"
- "OneSignal User State after initialization"

### Expected Working State

- **Initialized: YES**
- **OneSignal User ID**: A valid UUID (e.g., "12345678-abcd-1234-5678-123456789012")
- **Notification Permission: Granted**
- **Test notifications**: Should be received within 10-30 seconds

### OneSignal App Configuration

- **App ID**: 2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965
- **Dashboard**: https://app.onesignal.com/apps/2bf0b7b7-c1ff-478f-a661-9dbb7a5f0965

### Next Steps if Still Not Working

1. Check Apple Developer Console for APNs certificate issues
2. Verify OneSignal iOS SDK configuration
3. Test with a different device
4. Check OneSignal delivery logs in dashboard
