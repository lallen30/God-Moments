# 🚨 Troubleshooting Guide - OneSignal & Laravel API Issues

## 🎯 **Current Issues**

1. **OneSignal shows "Never Subscribed"** 
2. **React Native "Registration failed" error**
3. **No notifications received on device**
4. **No database updates in Laravel**

## 🔧 **Step-by-Step Fix**

### **Step 1: Fix Laravel API Routes (CRITICAL)**

**Upload and run the route cache clearing script:**

1. Upload `emergency-route-clear.php` to your server's `public` folder
2. Visit: `https://godmoments.betaplanets.com/emergency-route-clear.php`
3. Look for "✓ Clear route cache - SUCCESS" messages
4. Verify API routes are listed at the bottom

**Expected output:**
```
✓ Clear route cache - SUCCESS
✓ Cache routes - SUCCESS
✓ Clear configuration cache - SUCCESS

Current Routes:
POST | api/devices/register
PATCH | api/devices/{device}/settings  
GET | api/devices/{device}/schedule
```

### **Step 2: Test API Connectivity**

After clearing routes, test the API:

```bash
curl -X POST https://godmoments.betaplanets.com/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "anon_user_id": "test_123",
    "onesignal_player_id": "test_player_123",
    "tz": "America/New_York",
    "start_time": "09:00",
    "end_time": "21:00",
    "notifications_enabled": true
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "device": { ... },
    "next_schedule": [ ... ]
  }
}
```

### **Step 3: Fix OneSignal Registration**

The OneSignal service has been updated with the critical `OneSignal.login()` call that was missing. 

**Key changes made:**
- ✅ Added `OneSignal.login()` with device ID
- ✅ Force permission request on every initialization
- ✅ Better error handling and logging

### **Step 4: Rebuild and Test React Native App**

1. **Clean and rebuild the app:**
   ```bash
   cd /path/to/God-Moments-react-app
   npx react-native start --reset-cache
   # In another terminal:
   npx react-native run-ios  # or run-android
   ```

2. **Check console logs for OneSignal initialization:**
   Look for these log messages:
   ```
   🚀 [OneSignal] Starting OneSignal initialization...
   📱 [OneSignal] Requesting permission (forced)...
   🔑 [OneSignal] Attempting login with device ID...
   ✅ [OneSignal] Login successful with device ID: godmoments_...
   ✅ [OneSignal] Push subscription opted in
   ```

3. **Test the settings screen:**
   - Go to Settings → Account Settings
   - Check that "Service Status" shows "Connected to notification service"
   - Toggle "Allow Notifications" ON
   - Click "Save Settings"
   - Should show success message, not "Registration failed"

### **Step 5: Verify OneSignal Dashboard**

1. **Check OneSignal Dashboard:**
   - Go to https://onesignal.com
   - Navigate to your app (God Moments - 2613c87d-4f81-4094-bd84-08495e68bda0)
   - Go to "Audience" → "All Users"
   - Your device should now show as "Subscribed" (not "Never Subscribed")

2. **Send test notification:**
   - In OneSignal dashboard, go to "Messages" → "New Push"
   - Send to "All Users" or specific device
   - Should receive notification on your phone

## 🔍 **Debugging Steps**

### **If API Still Returns 404:**

1. **Check .htaccess file** in Laravel public folder:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.php [L]
   ```

2. **Verify Laravel environment:**
   - Check that `.env` file exists and has correct settings
   - Ensure `APP_URL=https://godmoments.betaplanets.com`

3. **Check server error logs** for any PHP errors

### **If OneSignal Still Shows "Never Subscribed":**

1. **Check app permissions:**
   - iOS: Settings → God Moments → Notifications (should be ON)
   - Verify you allowed notifications in both system popup AND app onboarding

2. **Check OneSignal App ID:**
   - Verify it's exactly: `2613c87d-4f81-4094-bd84-08495e68bda0`
   - Check both iOS and Android configurations

3. **Check console logs:**
   - Look for OneSignal error messages
   - Verify the login call succeeded

### **If Registration Still Fails:**

1. **Use the debug component:**
   - Add `ScheduledNotificationDebug` to any screen
   - Check all status indicators
   - Use "Force Registration" button

2. **Check network connectivity:**
   - Ensure device can reach `https://godmoments.betaplanets.com`
   - Test in both WiFi and cellular

## 📱 **Quick Test Checklist**

- [ ] Laravel route cache cleared successfully
- [ ] API returns 200 for device registration (test with curl)
- [ ] React Native app rebuilt with latest changes
- [ ] OneSignal logs show successful login
- [ ] Device shows as "Subscribed" in OneSignal dashboard
- [ ] Settings screen shows "Connected to notification service"
- [ ] "Save Settings" works without error
- [ ] Test notification received on device

## 🚀 **Expected Final State**

When everything is working:

1. **OneSignal Dashboard:** Device shows as "Subscribed"
2. **React Native App:** Settings save successfully, service status green
3. **Laravel Database:** New entries in `scheduled_devices` and `scheduled_notifications` tables
4. **Notifications:** Receive test notifications from OneSignal dashboard
5. **Scheduled Notifications:** Will start working once cron job is set up

## 📞 **If Still Having Issues**

1. **Run the automated test:**
   ```bash
   node test-scheduled-notifications.js
   ```

2. **Check specific error messages:**
   - Laravel logs: `storage/logs/laravel.log`
   - React Native: Metro bundler console
   - OneSignal: App console logs

3. **Verify all components:**
   - Laravel API endpoints working
   - OneSignal properly configured
   - React Native app permissions granted
   - Network connectivity stable

The most critical step is **Step 1** - clearing the Laravel route cache. This is likely the root cause of the "Registration failed" error.
