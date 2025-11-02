# Redux Store Integration for Notification Settings ✅

## Overview
Integrated notification settings and status into the centralized Redux store to maintain consistent state across the application.

## Changes Made

### 1. **Updated Redux Store** (`client/src/store/store.js`)

Added two new state properties to the `preparedness` slice:

```javascript
notificationSettings: {
  email: '',
  phoneNumber: '',
  emailEnabled: true,
  smsEnabled: false,
  hurricaneAlerts: true,
  floodAlerts: true,
  tornadoAlerts: true,
  severeWeatherAlerts: true,
  checklistReminders: true,
},
notificationStatus: null, // Server notification status
```

Added two new actions:
- `setNotificationSettings(payload)` - Update notification preferences
- `setNotificationStatus(payload)` - Update server notification status

### 2. **Updated AlertsPage** (`client/src/pages/AlertsPage.jsx`)

**Before:** Used local `useState` for preferences and status

**After:** Uses Redux store with `useSelector` and `useDispatch`

```javascript
// Get state from Redux store
const preferences = useSelector((state) => state.preparedness.notificationSettings);
const notificationStatus = useSelector((state) => state.preparedness.notificationStatus);

// Update state via dispatch
dispatch(setNotificationSettings({ email: user.email }));
dispatch(setNotificationStatus(status));
```

Created helper function `updatePreference` to simplify form handlers:
```javascript
const updatePreference = (key, value) => {
  dispatch(setNotificationSettings({ [key]: value }));
};

// Usage in form inputs
onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
```

## Benefits

✅ **Centralized State** - All notification settings in one place
✅ **Persistent Across Navigation** - Settings maintained when user navigates between pages
✅ **Easier to Share** - Other components can access notification status
✅ **Better for Future Features** - Easy to add notification center, history, etc.
✅ **Type Safety** - Redux structure provides clear state shape

## Fixing "Not Configured" Status

The email status shows "Not Configured" because the server needs to be restarted to pick up the `.env` file changes.

### Solution:

1. **Verify `.env` file** (`server/.env`):
   ```properties
   ENABLE_EMAIL_ALERTS=true
   EMAIL_USER=sainadthpagadala@gmail.com
   EMAIL_APP_PASSWORD=sqkx vnuh tdtd qfzc
   ```

2. **Restart the server**:
   ```bash
   cd server
   npm start
   # or if using nodemon
   npx nodemon server.js
   ```

3. **Verify configuration in terminal output**:
   The server should show:
   ```
   ✅ Email Notifications: Enabled & Configured
   ```

4. **Refresh the AlertsPage**:
   - Click the "🔄 Refresh Status" button
   - Email Alerts should show "✅ Ready"

### Troubleshooting

If email still shows "Not Configured" after server restart:

**Check 1: Environment variables are loaded**
```javascript
// In server, add console log to verify
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '***' : 'NOT SET');
```

**Check 2: `.env` file location**
- Must be in `server/.env` (not root directory)
- Must not be named `.env.example`

**Check 3: dotenv is loaded**
```javascript
// server/server.js or server.js should have at the top:
require('dotenv').config();
```

**Check 4: Test the notification endpoint directly**
```bash
curl http://localhost:5000/api/notifications/config-status
```

Expected response:
```json
{
  "enabled": { "email": true, "push": true, "sms": false },
  "configured": { "email": true, "push": true, "sms": false, "openai": true },
  "ready": { "email": true, "push": true, "sms": false, "openai": true },
  "readyChannels": ["Email", "Push"],
  "enabledChannels": ["Email", "Push"],
  "message": "✅ Email, Push ready to send alerts"
}
```

## State Flow Diagram

```
User Action (Toggle/Input)
  ↓
updatePreference(key, value)
  ↓
dispatch(setNotificationSettings({ [key]: value }))
  ↓
Redux Store Updated
  ↓
useSelector gets new state
  ↓
Component Re-renders with new preferences
  ↓
Save Button → localStorage + (future: API save)
```

## How to Access Notification Settings from Other Components

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setNotificationSettings } from '../store/store';

function SomeComponent() {
  const dispatch = useDispatch();
  const notificationSettings = useSelector(
    (state) => state.preparedness.notificationSettings
  );
  const notificationStatus = useSelector(
    (state) => state.preparedness.notificationStatus
  );

  // Check if email alerts are enabled
  if (notificationSettings.emailEnabled && notificationSettings.hurricaneAlerts) {
    // Show hurricane alert banner
  }

  // Update settings
  dispatch(setNotificationSettings({ emailEnabled: false }));
}
```

## Future Enhancements

### 1. API Integration
Instead of just localStorage, sync settings to backend:
```javascript
const savePreferences = async () => {
  setSaving(true);
  try {
    // Save to backend API
    await apiService.saveUserPreferences(user.id, preferences);
    
    // Also save to localStorage as backup
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    
    toast.success('✅ Preferences saved!');
  } catch (error) {
    toast.error('❌ Failed to save preferences');
  }
  setSaving(false);
};
```

### 2. Notification History
Add notification history to store:
```javascript
notificationHistory: [],

addNotificationToHistory(state, action) {
  state.notificationHistory.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type: action.payload.type,
    message: action.payload.message,
    read: false,
  });
},
```

### 3. Real-time Status Polling
Poll server every 30 seconds to keep status updated:
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    loadNotificationStatus();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);
```

### 4. Notification Center Component
Create a notification center that shows:
- Recent alerts
- Notification history
- Quick settings toggle
- Status indicators

## Testing Checklist

- [x] Redux store has notification settings
- [x] AlertsPage uses Redux store
- [x] All form inputs update Redux state
- [x] Toast notifications work
- [x] No compile errors
- [ ] Server shows email configured (requires restart)
- [ ] Refresh Status button updates from server
- [ ] Settings persist in localStorage
- [ ] Settings persist across page navigation
- [ ] Email test button works

## Summary

✅ Notification settings now managed by Redux store
✅ Centralized state management for better maintainability
✅ Toast notifications integrated
✅ Push notifications removed
✅ Ready for server restart to fix "Not Configured" status

**Next Step:** Restart the server to pick up `.env` changes and verify email configuration shows as "Ready"!
