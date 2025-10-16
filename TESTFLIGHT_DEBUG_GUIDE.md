# TestFlight Debug Guide - Settings Update Issue

## Issue Summary
Project Manager encountered "Settings update failed: Registration failed" error when trying to save settings in the Account Settings screen on TestFlight build.

## Root Cause
**Timing/Race Condition**: The scheduled notification service was not fully initialized before the user attempted to save settings. Specifically:

1. OneSignal takes time to initialize and obtain a player ID (can take 2-5 seconds)
2. User can navigate to Settings screen and click "Save Settings" before initialization completes
3. When `updateSettings()` is called without a `deviceId`, it attempts registration
4. Registration fails if OneSignal player ID is not ready yet

## Changes Made

### 1. Enhanced Settings Screen Initialization (`AccountSettingsScreen.tsx`)
- **Line 112-124**: Added retry logic and better status messages during service initialization
- **Line 280-299**: Added comprehensive validation before saving settings
  - Verifies service is initialized
  - Checks for required IDs (deviceId, anonUserId)
  - Provides clear error messages if prerequisites not met

### 2. Improved Service Initialization (`ScheduledNotificationService.ts`)
- **Line 82-118**: Enhanced `initialize()` method with better logging and retry capability
  - Checks if already initialized before proceeding
  - Better error handling without throwing exceptions
  - Marks service as not initialized on failure (allows retry)
  - Comprehensive logging of initialization state

### 3. Better Error Handling in updateSettings
- **Line 527-553**: Added prerequisite checks before attempting registration
  - Validates `anonUserId` exists
  - Checks if OneSignal player ID is ready
  - Returns specific error messages for each failure case

### 4. Fixed API URL Construction
- **Line 7-10**: Changed from manual URL construction to using `environment.apiURL`
  - Before: `const API_BASE = ${BASE_URL}api` (error-prone)
  - After: `const API_BASE = environment.apiURL.replace(/\/$/, '')` (uses centralized config)

### 5. Improved Error Messages
- **Line 343-356**: Added context-specific error messages for users
  - OneSignal issues: "Please wait a moment for notifications to initialize"
  - Initialization issues: "Please close and reopen the app"
  - Network issues: "Please check your internet connection"

## Debug Logging

When testing in TestFlight, check the following console logs:

### Successful Initialization Flow:
```
🔔 [ScheduledNotifications] Initializing service...
✅ [ScheduledNotifications] Anonymous user ID ready: <uuid>
⏳ [ScheduledNotifications] Waiting for OneSignal...
✅ [ScheduledNotifications] OneSignal ready, player ID: <player-id>
🔄 [ScheduledNotifications] Registering device with backend...
✅ [ScheduledNotifications] Service initialized successfully
```

### Settings Save Flow:
```
💾 [Settings] Starting save process...
💾 [Settings] Service initialized: true
💾 [Settings] Current device ID: <device-id>
💾 [Settings] Post-initialization check: { isInitialized: true, hasDeviceId: true, hasAnonUserId: true }
📤 [ScheduledNotifications] Updating device settings...
✅ [ScheduledNotifications] Settings updated successfully
```

### If Error Occurs:
Look for these log messages to identify the issue:
- `❌ [ScheduledNotifications] Missing anon user ID` - Service not initialized
- `❌ [ScheduledNotifications] OneSignal player ID not ready` - OneSignal timing issue
- `❌ [ScheduledNotifications] Registration failed:` - Backend API issue
- `⚠️ [Settings] Service initialization incomplete` - Initialization retry triggered

## Testing Instructions

### For Project Manager:

1. **Fresh Install Test**:
   - Delete app completely from device
   - Install TestFlight build
   - Complete onboarding
   - WAIT 5-10 seconds after reaching Home screen
   - Navigate to Settings → Account Settings
   - Try to change and save settings
   - Expected: Settings should save successfully

2. **Quick Navigation Test** (testing the fix):
   - Install app
   - Complete onboarding
   - IMMEDIATELY navigate to Settings → Account Settings
   - Try to change and save settings
   - If you see "OneSignal is not ready yet" error: Wait 5 seconds and try again
   - Expected: Should work after brief wait

3. **What to Report**:
   - Does the "Service Status" at bottom of Settings screen show "Connected to notification service"?
   - What exact error message do you see (take screenshot)?
   - How long after app launch did you try to save settings?
   - Are you seeing any other errors or unusual behavior?

## Network Requirements

Ensure the following for successful operation:

1. **Internet Connection**: Active cellular or WiFi connection required
2. **Domain Access**: Must be able to reach `https://godmoments.betaplanets.com`
3. **OneSignal Access**: Must be able to reach OneSignal servers for push notification registration

## Expected Behavior After Fix

1. **On App Launch**:
   - Scheduled notification service initializes in background
   - OneSignal obtains player ID (2-5 seconds)
   - Device registers with backend automatically

2. **On Settings Screen**:
   - Service Status shows "Connected to notification service" when ready
   - Settings load from both service and local storage
   - Save button triggers validation before attempting update

3. **On Settings Save**:
   - System verifies service is ready
   - If not ready, attempts re-initialization
   - Provides clear error message if prerequisites not met
   - Only proceeds with save when all prerequisites are satisfied

## Fallback Behavior

If initialization fails:
- Service marked as not initialized
- Next action (like saving settings) will retry initialization
- User sees clear error message with specific guidance
- App remains functional for non-notification features

## API Endpoints Used

- **Registration**: `POST https://godmoments.betaplanets.com/api/devices/register`
- **Update Settings**: `POST https://godmoments.betaplanets.com/api/devices/{id}/settings` (with _method=PATCH)
- **Get Schedule**: `GET https://godmoments.betaplanets.com/api/devices/{id}/schedule`

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "OneSignal is not ready yet" | Too quick after app launch | Wait 5-10 seconds, try again |
| "Service not properly initialized" | Initialization failure | Close and reopen app |
| "Registration failed" | Network or backend issue | Check internet connection |
| Service Status: "Checking..." | Still initializing | Wait a moment |
| Service Status: "Error loading settings" | Initialization error | Restart app |

## Next Steps

1. **Build and Deploy**: Create new TestFlight build with these fixes
2. **Test**: Follow testing instructions above
3. **Monitor**: Check for any new errors in production
4. **Report**: Provide feedback on whether issue is resolved
