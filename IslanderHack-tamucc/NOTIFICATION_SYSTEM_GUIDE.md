# AI-Powered Emergency Notification System

## 🚀 Features

- **AI-Customized Alerts**: Uses OpenAI to personalize emergency messages based on:
  - Hazard type (hurricane, tornado, flood, wildfire, etc.)
  - User household composition (kids, elderly, pets)
  - Medical needs and vehicle availability
  - Location and distance from hazard

- **Multi-Channel Delivery**:
  - 📧 **Email**: Rich HTML emails with specific action items
  - 📱 **Web Push**: Browser notifications with action buttons
  
- **Smart Personalization**:
  - Messages tailored to user's specific situation
  - Different urgency levels (critical, high, moderate, low)
  - Actionable instructions based on household needs

## 📋 Setup Instructions

### 1. Install Dependencies

Already installed via npm:
```bash
cd server
npm install nodemailer web-push openai
```

### 2. Configure Email (Gmail)

#### Get Gmail App Password:
1. Go to your Google Account: https://myaccount.google.com
2. Security → 2-Step Verification (enable if not already)
3. App passwords: https://myaccount.google.com/apppasswords
4. Select "Mail" and your device
5. Copy the 16-character password

#### Add to `.env`:
```env
EMAIL_USER=your.email@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### 3. Generate VAPID Keys for Web Push

```bash
cd server
npx web-push generate-vapid-keys
```

Copy output to `.env`:
```env
VAPID_PUBLIC_KEY=BFxG...long string...
VAPID_PRIVATE_KEY=Z3c...long string...
```

### 4. Add OpenAI API Key

Get your key from: https://platform.openai.com/api-keys

Add to `.env`:
```env
OPENAI_API_KEY=sk-proj-...your-key...
```

### 5. Complete `.env` File Example

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PYTHON_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Email Notifications (Gmail)
EMAIL_USER=your.email@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# Web Push Notifications (VAPID Keys)
VAPID_PUBLIC_KEY=BFxG...
VAPID_PRIVATE_KEY=Z3c...
```

## 🧪 Testing the System

### 1. Start the Server

```bash
cd server
npm start
```

Server will start on http://localhost:5000

### 2. Check Configuration Status

```bash
curl http://localhost:5000/api/notifications/config-status
```

Expected response:
```json
{
  "configured": {
    "email": true,
    "push": true,
    "openai": true
  },
  "ready": true,
  "message": "All services configured"
}
```

### 3. Test Email Notification

```bash
curl -X POST http://localhost:5000/api/notifications/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@example.com",
    "subject": "Test Alert",
    "message": "Testing the notification system!"
  }'
```

### 4. Send a Test Hazard Alert

```bash
curl -X POST http://localhost:5000/api/notifications/hazard-alert \
  -H "Content-Type: application/json" \
  -d '{
    "hazardData": {
      "type": "hurricane",
      "name": "Hurricane Test",
      "severity": "Category 4",
      "category": 4,
      "wind_speed": 140,
      "distance_miles": 75,
      "description": "Extremely dangerous hurricane approaching"
    },
    "userProfile": {
      "userId": "test123",
      "userEmail": "your.email@example.com",
      "address": "123 Main St, Miami, FL 33101",
      "zip_code": "33101",
      "adults": 2,
      "kids": 1,
      "elderly": 0,
      "pets": 1,
      "hasMedicalNeeds": false,
      "hasVehicle": true
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "email": {
    "success": true,
    "messageId": "..."
  },
  "push": [],
  "aiGenerated": true,
  "alertContent": {
    "sms": "🌀 HURRICANE ALERT: ...",
    "emailSubject": "🚨 URGENT: Hurricane Test Evacuation",
    "emailBody": "<h2>...",
    "pushTitle": "🌀 Hurricane Test Alert",
    "pushBody": "Evacuate immediately...",
    "urgencyLevel": "critical"
  }
}
```

## 🎯 Client-Side Integration (React)

### 1. Enable Push Notifications

```javascript
import { 
  subscribeToPushNotifications, 
  isPushSubscribed,
  testPushNotification 
} from '../services/pushNotificationService';

// Request permission and subscribe
async function enableNotifications() {
  try {
    const subscription = await subscribeToPushNotifications('user123');
    console.log('✅ Subscribed to push notifications');
    
    // Test it
    await testPushNotification();
  } catch (error) {
    console.error('Failed to enable notifications:', error);
  }
}

// Check if already subscribed
async function checkStatus() {
  const isSubscribed = await isPushSubscribed();
  console.log('Push notifications:', isSubscribed ? 'Enabled' : 'Disabled');
}
```

### 2. Send Hazard Alert from Client

```javascript
import { apiService } from '../services/apiService';
import { getPushSubscription } from '../services/pushNotificationService';

async function sendEmergencyAlert(hazardData) {
  // Get user's push subscription
  const pushSub = await getPushSubscription();
  const pushSubscriptions = pushSub ? [pushSub.toJSON()] : [];

  // User profile (from your app state)
  const userProfile = {
    userId: currentUser.id,
    userEmail: currentUser.email,
    address: currentUser.address,
    zip_code: currentUser.zipCode,
    adults: currentUser.adults,
    kids: currentUser.kids,
    elderly: currentUser.elderly,
    pets: currentUser.pets,
    hasMedicalNeeds: currentUser.hasMedicalNeeds,
    hasVehicle: currentUser.hasVehicle
  };

  // Send alert
  const result = await apiService.sendHazardAlert(
    hazardData,
    userProfile,
    pushSubscriptions
  );

  console.log('Alert sent:', result);
}
```

### 3. Example: Hurricane Approach Alert

```javascript
// When a hurricane is detected approaching the user
const hurricaneData = {
  type: 'hurricane',
  name: 'Hurricane Milton',
  severity: 'Category 5',
  category: 5,
  wind_speed: 160,
  distance_miles: 50,
  description: 'Catastrophic hurricane with sustained winds of 160 mph'
};

await sendEmergencyAlert(hurricaneData);
```

## 📧 Example AI-Generated Messages

### Critical Hurricane Alert

**Email Subject:**
```
🚨 URGENT: Hurricane Milton Evacuation - Leave Now
```

**Email Body:**
```html
<h2 style="color: #d32f2f;">🌀 CRITICAL EVACUATION ALERT</h2>

<p><strong>Hurricane Milton (Category 5)</strong> is 50 miles from your location in Miami, FL.</p>

<div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ff9800;">
  <h3>⚠️ EVACUATE IMMEDIATELY</h3>
  <p>This is a life-threatening situation. You must leave NOW.</p>
</div>

<h3>Your Household Action Plan:</h3>
<ul>
  <li>✅ Secure your 1 child - bring comfort items and medications</li>
  <li>✅ Prepare carrier and supplies for your 1 pet</li>
  <li>✅ Use your vehicle to evacuate immediately</li>
  <li>✅ Take 3-day supply of water, food, and medications</li>
  <li>✅ Pack important documents in waterproof bag</li>
</ul>

<h3>Nearest Evacuation Shelter:</h3>
<p><strong>Miami Convention Center</strong><br>
15 miles north<br>
Open 24/7 - Pet-friendly</p>

<p><a href="http://yourapp.com/evacuation" style="background: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">View Evacuation Route</a></p>
```

**Push Notification:**
```
Title: 🌀 Hurricane Milton - EVACUATE NOW
Body: Category 5 storm 50 miles away. Leave immediately with family and pets.
Actions: [View Route] [Find Shelter]
```

## 🔄 Automatic Alerts Integration

### Monitor Weather API and Auto-Send

```javascript
// Example: Periodic check for approaching hazards
async function checkForHazards() {
  // Get current weather/hurricane data
  const hazards = await weatherService.getActiveHazards(userLocation);
  
  for (const hazard of hazards) {
    if (hazard.distance_miles < 100 && hazard.severity === 'critical') {
      // Send automatic alert
      await apiService.sendHazardAlert(hazard, userProfile, pushSubscriptions);
      
      console.log(`🚨 Alert sent for ${hazard.name}`);
    }
  }
}

// Run every 15 minutes
setInterval(checkForHazards, 15 * 60 * 1000);
```

## 🎨 Customization Options

### Different Hazard Types

The AI automatically customizes messages for:
- 🌀 **Hurricanes**: Evacuation routes, wind safety, storm surge
- 🌪️ **Tornadoes**: Shelter-in-place, basement safety
- 🌊 **Floods**: High ground, water hazards
- 🔥 **Wildfires**: Air quality, escape routes
- ⚡ **Severe Storms**: Lightning safety, wind damage

### Urgency Levels

- **Critical**: Immediate life-threatening (red, push requires interaction)
- **High**: Urgent action needed soon (orange)
- **Moderate**: Prepare and monitor (yellow)
- **Low**: Awareness only (blue)

## 🐛 Troubleshooting

### Email not sending

1. Check Gmail app password (not regular password)
2. Verify 2-factor authentication is enabled
3. Check `EMAIL_USER` matches the account

### Push notifications not working

1. Generate new VAPID keys if invalid
2. Check browser supports notifications (Chrome, Firefox, Edge)
3. Verify HTTPS (required for production)
4. Check user granted notification permission

### AI responses seem generic

1. Provide more detailed hazard data
2. Include complete user profile information
3. Check OpenAI API key is valid
4. Monitor API usage limits

## 📊 Cost Estimates

| Service | Free Tier | Cost Per Alert |
|---------|-----------|----------------|
| **Gmail** | Unlimited | Free |
| **Web Push** | Unlimited | Free |
| **OpenAI** (GPT-4o-mini) | $5 free credit | ~$0.001/alert |

**Example cost for 1000 alerts**: ~$1.00 (OpenAI only)

## 🔐 Security Best Practices

1. **Never commit `.env`** - Keep API keys private
2. **Use environment variables** - Don't hardcode secrets
3. **Validate user input** - Sanitize hazard data
4. **Rate limiting** - Prevent notification spam
5. **HTTPS in production** - Required for push notifications

## 📚 API Endpoints

### POST /api/notifications/hazard-alert
Send AI-customized hazard alert

### POST /api/notifications/checklist-reminder
Send checklist completion reminder

### POST /api/notifications/test-email
Test email configuration

### GET /api/notifications/config-status
Check service configuration

### GET /api/notifications/vapid-public-key
Get public VAPID key for client

## 🎉 Next Steps

1. ✅ Configure all environment variables
2. ✅ Test email and push notifications
3. ✅ Integrate with weather/hazard API
4. ✅ Add notification preferences to user settings
5. ✅ Set up automatic monitoring system
6. ✅ Create notification history/logs
7. ✅ Add SMS support (optional - Twilio)

## 📞 Support

For issues or questions:
- Check server logs: `npm start`
- Test configuration: `GET /api/notifications/config-status`
- Review AI responses in console
- Check browser console for push notification errors
