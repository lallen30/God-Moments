# Fix for OneSignal "Never Subscribed" Issue

## Root Cause Identified

The issue is a **race condition** where:

1. User completes onboarding with their timezone selection
2. App starts background registration in fire-and-forget mode
3. OneSignal creates a local Player ID **before** obtaining APNS token from Apple
4. App sends this "premature" Player ID to Laravel backend
5. Laravel saves it to database
6. OneSignal continues trying to get APNS token in the background
7. If APNS token fetch **fails or times out**, device shows as "Never Subscribed" in OneSignal
8. But database already has the incomplete Player ID

## Evidence

- All "Never Subscribed" devices show iOS version 26.0.1 (incorrect/corrupted data)
- All "Subscribed" devices show iOS version 18.6.2 (correct data)
- Testing confirmed: Selecting China timezone triggers the issue
- The problem is systemic, not user behavior (user clicks "Allow")

## The Fix

Add validation to ensure OneSignal has a **valid push subscription with APNS/FCM token** before registering with Laravel.

### Step 1: Add Push Token Validation Method to OneSignalService.ts

Add this method after `getOneSignalUserId()`:

```typescript
/**
 * Check if OneSignal has a valid push subscription with token
 * Returns true only if device is fully subscribed and can receive notifications
 */
public async hasValidPushSubscription(): Promise<boolean> {
  if (!this.isInitialized) {
    console.log('⚠️ [OneSignal] Not initialized - no valid subscription');
    return false;
  }

  try {
    // Check if we have permission first
    const hasPermission = OneSignal?.Notifications?.hasPermission?.();
    if (!hasPermission) {
      console.log('⚠️ [OneSignal] No notification permission - no valid subscription');
      return false;
    }

    // Check for push subscription object
    if (!OneSignal?.User?.pushSubscription) {
      console.log('⚠️ [OneSignal] No pushSubscription object - no valid subscription');
      return false;
    }

    const pushSub = OneSignal.User.pushSubscription;

    // Check if subscribed (optedIn)
    if (!pushSub.optedIn) {
      console.log('⚠️ [OneSignal] Not opted in - no valid subscription');
      return false;
    }

    // CRITICAL: Check if we have a valid push token (identifier)
    if (!pushSub.token || pushSub.token === '' || pushSub.token === 'null') {
      console.log('⚠️ [OneSignal] No valid push token - APNS/FCM registration incomplete');
      return false;
    }

    // Check if we have a subscription ID
    if (!pushSub.id || pushSub.id === '') {
      console.log('⚠️ [OneSignal] No subscription ID - registration incomplete');
      return false;
    }

    console.log('✅ [OneSignal] Valid push subscription confirmed:', {
      id: pushSub.id,
      token: pushSub.token?.substring(0, 20) + '...',
      optedIn: pushSub.optedIn,
      hasPermission: hasPermission
    });

    return true;

  } catch (error) {
    console.error('❌ [OneSignal] Error checking push subscription:', error);
    return false;
  }
}
```

### Step 2: Update waitForOneSignal() in ScheduledNotificationService.ts

Replace the current implementation (lines 204-243) with:

```typescript
/**
 * Wait for OneSignal to be initialized AND have valid push subscription
 */
private async waitForOneSignal(): Promise<void> {
  const maxAttempts = 45; // 45 seconds (increased from 30)
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkOneSignal = async () => {
      attempts++;
      
      try {
        if (oneSignalService.isOneSignalInitialized()) {
          // CRITICAL: Check for valid push subscription, not just player ID
          const hasValidSubscription = await oneSignalService.hasValidPushSubscription();
          
          if (hasValidSubscription) {
            const playerId = await oneSignalService.getOneSignalUserId();
            console.log('✅ [ScheduledNotifications] OneSignal ready with valid subscription:', playerId);
            resolve();
            return;
          } else {
            console.log(`🔍 [ScheduledNotifications] Attempt ${attempts}/${maxAttempts}: Waiting for valid push subscription with APNS/FCM token...`);
          }
        }

        if (attempts >= maxAttempts) {
          console.warn('⚠️ [ScheduledNotifications] OneSignal timeout - push subscription not obtained after 45 seconds');
          console.warn('⚠️ [ScheduledNotifications] Will proceed but registration may fail if subscription still not ready');
          // IMPORTANT: Resolve anyway to allow initialization to complete
          // The registerDevice() method will check again and reject if still no valid subscription
          resolve();
          return;
        }

        // Try again in 1 second
        setTimeout(checkOneSignal, 1000);
      } catch (error) {
        console.error('❌ [ScheduledNotifications] Error waiting for OneSignal:', error);
        if (attempts >= maxAttempts) {
          console.warn('⚠️ [ScheduledNotifications] Max attempts reached, proceeding anyway');
          // Resolve to allow initialization to complete - registerDevice will validate
          resolve();
        } else {
          setTimeout(checkOneSignal, 1000);
        }
      }
    };

    checkOneSignal();
  });
}
```

### Step 3: Update registerDevice() Validation

In `registerDevice()` method (around line 300), add push subscription validation:

```typescript
public async registerDevice(customSettings?: Partial<DeviceSettings>): Promise<DeviceRegistrationResponse> {
  try {
    // CRITICAL: Verify valid push subscription before proceeding
    const hasValidSubscription = await oneSignalService.hasValidPushSubscription();
    
    if (!hasValidSubscription) {
      console.error('❌ [ScheduledNotifications] Cannot register - no valid push subscription');
      return {
        success: false,
        message: 'Cannot register device without valid push subscription. Please ensure notifications are enabled.',
        error: 'NO_VALID_SUBSCRIPTION'
      };
    }

    const playerId = await oneSignalService.getOneSignalUserId();
    
    console.log('🔍 [ScheduledNotifications] OneSignal Player ID received:', playerId);
    
    if (!playerId || playerId === 'Initialized - ID pending...') {
      throw new Error('OneSignal player ID not available');
    }

    // ... rest of existing code
```

### Step 4: Update SetPreferencesScreen.tsx Error Handling

In the onboarding screen (lines 141-217), update the retry logic to handle subscription errors:

```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    console.log(`🔔 [Onboarding] Background registration attempt ${attempt}/${maxRetries}`);
    
    // Initialize the scheduled notification service
    await scheduledNotificationService.initialize();
    
    // Verify service initialized successfully
    if (!scheduledNotificationService.isServiceInitialized()) {
      console.warn(`⚠️ [Onboarding] Background attempt ${attempt}: Service not initialized yet`);
      
      // If not last attempt, wait and retry
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ [Onboarding] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error('❌ [Onboarding] All initialization attempts failed.');
      // Save for later retry
      await AsyncStorage.setItem('pending_registration', JSON.stringify({
        tz: ianaTimezone,
        start_time: convertTo24Hour(startTime, startTimeAmPm),
        end_time: convertTo24Hour(endTime, endTimeAmPm),
        notifications_enabled: notificationsEnabled,
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    console.log(`✅ [Onboarding] Background attempt ${attempt}: Service initialized`);

    // Register device with Laravel
    const result = await scheduledNotificationService.registerDevice({
      tz: ianaTimezone,
      start_time: convertTo24Hour(startTime, startTimeAmPm),
      end_time: convertTo24Hour(endTime, endTimeAmPm),
      notifications_enabled: notificationsEnabled,
    });

    if (result.success) {
      console.log('✅ [Onboarding] Background: Device registered successfully!');
      await AsyncStorage.removeItem('pending_registration');
      return; // Success!
    } else {
      // Check if it's a subscription error
      if (result.error === 'NO_VALID_SUBSCRIPTION') {
        console.warn('⚠️ [Onboarding] Push subscription not ready yet, will retry...');
        
        if (attempt < maxRetries) {
          // Wait longer for APNS token (3x normal delay for subscription issues)
          const delay = baseDelay * Math.pow(2, attempt - 1) * 3;
          console.log(`⏳ [Onboarding] Waiting ${delay}ms for push subscription...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Handle other errors...
      const errorMsg = result.error || result.message || '';
      console.warn(`⚠️ [Onboarding] Background attempt ${attempt}: Registration failed:`, errorMsg);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // ... save for retry
    }
    
  } catch (error) {
    console.error(`❌ [Onboarding] Background attempt ${attempt} failed:`, error);
    
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
  }
}
```

## Testing After Fix

### Test Case 1: Normal Registration
1. Fresh install
2. Complete onboarding with "Allow" notifications
3. **Expected:** Device shows "Subscribed" in OneSignal
4. **Verify:** Check both database and OneSignal dashboard

### Test Case 2: China Timezone
1. Fresh install
2. Complete onboarding with China timezone
3. **Expected:** Device shows "Subscribed" in OneSignal (should now work!)
4. **Verify:** Check diagnostic tool output

### Test Case 3: Delayed Permission Grant
1. Fresh install
2. Click "Don't Allow" initially
3. App shows settings prompt
4. Enable notifications in Settings
5. Return to app
6. **Expected:** Device registers successfully after permission granted

### Test Case 4: Timeout Scenario
1. Test on slow network
2. If registration times out after 45 seconds
3. **Expected:** Error saved to `pending_registration`
4. **Expected:** User can retry later from Settings

## Verification Query

After deployment, check for devices with valid subscriptions:

```sql
SELECT 
    d.id,
    d.onesignal_player_id,
    d.created_at,
    COUNT(CASE WHEN n.status = 'sent' THEN 1 END) as sent_count,
    COUNT(CASE WHEN n.status = 'failed' THEN 1 END) as failed_count
FROM scheduled_devices d
LEFT JOIN scheduled_notifications n ON d.id = n.scheduled_device_id
WHERE d.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY d.id
ORDER BY d.created_at DESC;
```

Devices should have 0 failed notifications.

## Cleanup Existing Bad Registrations

For existing "Never Subscribed" devices, run:

```sql
-- Find devices with recent failures
SELECT 
    id,
    onesignal_player_id,
    created_at
FROM scheduled_devices
WHERE id IN (
    SELECT DISTINCT scheduled_device_id 
    FROM scheduled_notifications 
    WHERE status = 'failed'
    AND scheduled_at_utc >= DATE_SUB(NOW(), INTERVAL 7 DAY)
);

-- Delete them (users will need to re-register)
DELETE FROM scheduled_notifications 
WHERE scheduled_device_id IN (
    SELECT id FROM scheduled_devices 
    WHERE id IN (
        SELECT DISTINCT scheduled_device_id 
        FROM scheduled_notifications 
        WHERE status = 'failed'
        AND scheduled_at_utc >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    )
);

DELETE FROM scheduled_devices 
WHERE id IN (
    SELECT id FROM (
        SELECT d.id 
        FROM scheduled_devices d
        INNER JOIN scheduled_notifications n ON d.id = n.scheduled_device_id
        WHERE n.status = 'failed'
        AND n.scheduled_at_utc >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ) as temp
);
```

Then instruct affected users to update their settings in the app to trigger re-registration.

## Related Files

- `/src/services/OneSignalService.ts` - Add `hasValidPushSubscription()`
- `/src/services/ScheduledNotificationService.ts` - Update `waitForOneSignal()` and `registerDevice()`
- `/src/screens/Onboarding/SetPreferencesScreen.tsx` - Update error handling

## Timeline

**Before Fix:**
- OneSignal Player ID created locally
- Sent to Laravel immediately
- APNS token fetch happens later (and might fail)
- Result: "Never Subscribed" in OneSignal

**After Fix:**
- OneSignal Player ID created locally
- Wait for APNS token to be obtained (up to 45 seconds)
- Only send to Laravel if valid push subscription exists
- Result: Only "Subscribed" devices in database

## Deployment Steps

1. Make code changes to 3 files
2. Test locally with various timezones
3. Build and deploy new iOS app version
4. Clean up existing bad registrations in database
5. Monitor OneSignal dashboard for new registrations
6. Verify 0 "Never Subscribed" devices for new installs

---

**Last Updated:** October 15, 2025
