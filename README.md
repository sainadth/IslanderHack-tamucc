# SOS Voice Outbound Call Alert System

An emergency alert system that records 10 seconds of speech, transcribes it, fetches user data, and makes an **interactive AI-powered call** via BLAND AI to deliver the emergency message.

## 🚀 Quick Run Checklist

Follow these steps in order:

- [ ] Install dependencies: `npm install`
- [ ] Get BLAND AI API key from [bland.ai](https://bland.ai)
- [ ] Create `.env` file with your API key
- [ ] Set up public URL (use ngrok or deploy)
- [ ] Start server: `npm start`
- [ ] Open browser: `http://localhost:3000`
- [ ] Test with SOS button

## Features

- 🚨 Simple SOS button interface
- 🎤 Real-time speech-to-text transcription (10 seconds)
- 📊 Fetches user data from database (name, age, sex, emergency contact, location)
- 📞 Automated outbound call with structured message delivery
- 💰 **100% Free** - Uses free services

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Web Speech API for speech-to-text)
- **Backend**: Node.js, Express
- **Voice Calls**: BLAND AI (interactive AI-powered calls)
- **Database**: SQLite3 (users.db)
- **AI Analysis**: Emergency type detection (fire, medical, police, accident)

## Prerequisites

Before starting, you'll need:
1. **BLAND AI Account & API Key**: Sign up at [bland.ai](https://bland.ai) and get your API key
2. **Node.js**: Version 14 or higher
3. **Public URL** (for webhooks): Use ngrok for testing, or deploy for production

## Quick Start Guide

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Get Your BLAND AI API Key

1. Sign up at [bland.ai](https://bland.ai) (or log in if you have an account)
2. Navigate to your dashboard and copy your API key
3. It should look like: `org_xxxxxxxxxxxxx...`

### Step 3: Create Environment File

Create a `.env` file in the root directory with the following:

```env
BLAND_AI_API_KEY=your_bland_ai_api_key_here
BLAND_AI_VOICE_ID=e1289219-0ea2-4f22-a994-c542c2a48a0f
TARGET_PHONE_NUMBER=+13614259843
BASE_URL=http://localhost:3000
```

**Environment Variables Explained**:
- `BLAND_AI_API_KEY` **(REQUIRED)**: Your BLAND AI API key from step 2
- `BLAND_AI_VOICE_ID` (optional): Voice ID for the AI caller (default provided works)
- `TARGET_PHONE_NUMBER` (optional): Default emergency number to call (use E.164 format: +1XXXXXXXXXX)
- `BASE_URL` (required for webhooks): Public URL for webhook callbacks (see Step 4)

### Step 4: Set Up Public URL (Required for Webhooks)

BLAND AI needs a publicly accessible URL to send webhook callbacks. Choose one option:

#### Option A: Using ngrok (Quick Testing)

1. **Install ngrok**:
   ```bash
   # macOS
   brew install ngrok/ngrok/ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **In a new terminal window, start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Update your `.env` file**:
   ```env
   BASE_URL=https://abc123.ngrok.io
   ```

> **Note**: Free ngrok URLs change each time you restart. For a stable URL, use Option B or get an ngrok paid plan.

#### Option B: Deploy to Cloud (Production)

Deploy your app to a cloud platform that provides a permanent URL:

- **Railway**: https://railway.app (free tier available)
- **Render**: https://render.com (free tier available)
- **Heroku**: https://heroku.com (paid)

After deployment, update `BASE_URL` in your `.env` (or environment variables in the platform) to your deployment URL.

### Step 5: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
BLAND AI configured
SOS Call System server running on http://localhost:3000
Using BLAND AI for interactive emergency calls
Database initialized successfully
```

### Step 6: Open the Application

Navigate to: **`http://localhost:3000`**

The database (`users.db`) is automatically created with default users:
- `user1` - John Peter
- `user2` - Jane Doe

### Step 7: Test the System

1. **Enter a User ID**: Type `user1` (or leave default)
2. **Click the SOS Button**: Press and hold the button
3. **Speak your emergency**: Say something like "I need help, there's a fire"
4. **Release the button**: After 10 seconds, it will automatically process
5. **Call Initiated**: BLAND AI will make an interactive call to the emergency number

## Complete Pipeline Flow

Here's what happens when you trigger SOS:

1. **🎤 **Speech Recording**: Browser records 10 seconds of audio
2. **📝 **Transcription**: Web Speech API converts speech to text
3. **🤖 **AI Analysis**: System detects emergency type (fire/medical/police/accident)
4. **💾 **Database Lookup**: Fetches user info (name, location, contacts, medical info)
5. **📞 **BLAND AI Call**: Makes interactive call to emergency number
   - AI introduces itself and provides emergency details
   - Can answer operator questions naturally
   - Provides location, contact info, medical info as needed
6. **🔄 **Webhook Callbacks**: Receives real-time updates about the call status

## Important Notes

- **Browser Compatibility**: Works best in Chrome/Edge (Web Speech API support)
- **BLAND AI**: Requires a valid API key. Interactive calls allow natural conversation with emergency operators.
- **Webhooks**: For production, ensure BASE_URL is set to a publicly accessible HTTPS URL
- **HTTPS**: Required for production (Web Speech API), not needed for localhost

## API Documentation

### For External Integration

You can integrate the SOS button in your own frontend by calling the API endpoint directly.

#### Endpoint: `POST /api/make-call`

**Base URL**: `http://your-server-url:3000` (or your deployed URL)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": "user1",
  "transcribedMessage": "I need help, there is a fire in my building",
  "phoneNumber": "+13614259843"
}
```

**Parameters**:
- `userId` (required): The user ID from your database (must exist in users.db)
- `transcribedMessage` (required): The emergency message/transcription text
- `phoneNumber` (optional): Target phone number in E.164 format (e.g., +13614259843). If not provided, uses default from `.env` file.

**Response (Success)**:
```json
{
  "success": true,
  "callId": "call_abc123",
  "message": "Call initiated successfully",
  "targetNumber": "+13614259843",
  "emergencyType": "fire"
}
```

**Response (Error)**:
```json
{
  "error": "Failed to make call",
  "details": "User not found",
  "code": "404"
}
```

**Example Integration (JavaScript)**:
```javascript
async function triggerSOS(userId, emergencyMessage, targetPhoneNumber) {
  try {
    const response = await fetch('http://your-server-url:3000/api/make-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        transcribedMessage: emergencyMessage,
        phoneNumber: targetPhoneNumber || '+13614259843'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('Emergency call initiated:', data.callId);
      return data;
    } else {
      console.error('Failed to make call:', data.error);
      throw new Error(data.details || data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage:
triggerSOS('user1', 'I need help, there is a fire', '+13614259843')
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

**Example Integration (cURL)**:
```bash
curl -X POST http://your-server-url:3000/api/make-call \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "transcribedMessage": "I need help, there is a fire in my building",
    "phoneNumber": "+13614259843"
  }'
```

**Emergency Types Detected**:
The API automatically analyzes the message and determines emergency type:
- `fire`: Detects words like "fire", "smoke", "burning"
- `medical`: Detects words like "medical", "heart attack", "breathing", "injury", "sick"
- `police`: Detects words like "police", "robbery", "assault", "theft", "intruder"
- `accident`: Detects words like "accident", "crash", "collision"
- Default: `medical` if no specific type detected

**Note for External Integration**:
- Ensure your server is accessible (deploy to a public URL for production)
- The user must exist in the database before making a call
- For production, use HTTPS and set BASE_URL to your public URL for webhooks
- Phone numbers must be in E.164 format (e.g., +13614259843)

#### Endpoint: `GET /api/user/:userId`

Get user details by ID.

**Request**: `GET /api/user/user1`

**Response**:
```json
{
  "user_id": "user1",
  "name": "John Peter",
  "age": "35",
  "sex": "Male",
  "emergencyContact": "361 555 1110",
  "location": "1702 Ennis Joslin Rd, Corpus Christi, TX 72412",
  "medicalInfo": "Specially Abled"
}
```

## Customization

- Change target phone number in `public/app.js` or via API `phoneNumber` parameter
- Modify message format in `server.js`
- Add more user fields in `db.js` and update database schema
- Customize UI in `public/styles.css`

## Troubleshooting

### Common Issues

#### ❌ "Missing required parameter: task" Error
**Solution**: This has been fixed in the latest version. Make sure you're using the latest code. The API uses `task` parameter for the conversation script.

#### ❌ "BLAND AI not configured" Error
**Solution**: 
- Check your `.env` file exists in the root directory
- Verify `BLAND_AI_API_KEY` is set correctly (no extra spaces)
- Make sure the API key starts with `org_`

#### ❌ "Speech recognition not working"
**Solution**: 
- Use Chrome or Edge browser (Web Speech API support required)
- Allow microphone permissions when prompted
- Use HTTPS in production (required for Web Speech API)

#### ❌ "Call fails" or "Invalid API key"
**Solution**:
- Verify your BLAND AI API key is correct
- Check your account has available credits/quota
- Ensure phone number is in E.164 format: `+1XXXXXXXXXX` (include country code)

#### ❌ "Webhook not receiving callbacks"
**Solution**:
- Ensure `BASE_URL` is set to a publicly accessible HTTPS URL
- For local testing, use ngrok (see Step 4, Option A)
- Verify your server is running and accessible
- Check firewall/security group settings

#### ❌ "Error 400: Invalid parameters"
**Solution**:
- Verify all required parameters are included
- Check phone number format is E.164: `+1XXXXXXXXXX`
- Ensure `BASE_URL` webhook URL is publicly accessible

#### ❌ Database errors
**Solution**:
- Delete `users.db` file and restart server (it will recreate)
- Check file permissions for the database file

### Debugging Tips

1. **Check Server Logs**: Look at the terminal where you ran `npm start` for detailed error messages
2. **Test API Key**: Verify your BLAND AI API key works by checking your dashboard
3. **Test Webhook URL**: Visit your `BASE_URL/api/bland-webhook` in a browser (should return JSON)
4. **Check ngrok**: If using ngrok, ensure it's running and the URL hasn't changed

### Getting Help

- Check the [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) file for detailed webhook setup
- Review BLAND AI documentation: https://docs.bland.ai
- Check server logs for specific error messages

## License

MIT

