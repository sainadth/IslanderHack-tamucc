# SOS Voice Emergency Integration Guide

## Overview
The SOS-Speech-JS emergency calling system has been integrated into the Hazard Preparedness application. This allows users to make voice-activated emergency calls with automatic speech-to-text transcription and intelligent emergency type detection.

## Features Integrated

### 🚨 SOS Emergency Button
- **Location**: Fixed bottom-right corner of the screen (above the AI chatbot)
- **Functionality**: 
  - Voice-activated emergency recording (10 seconds)
  - Real-time speech-to-text transcription
  - Automatic emergency call placement via Twilio
  - Visual status indicators and countdown timer
  
### 🎤 Speech Recognition
- Uses browser's Web Speech API (Chrome/Edge recommended)
- Records and transcribes emergency messages in real-time
- Automatically adds punctuation to transcribed text
- 10-second recording window

### 📞 Emergency Call System
- Automatic outbound calls via Twilio
- Structured emergency message delivery including:
  - User name, age, and sex
  - Current location
  - Emergency contact information
  - Medical information (if provided)
  - Transcribed emergency message
  - Detected emergency type (fire, medical, police, accident)

## Setup Instructions

### 1. Start SOS Backend Server

Navigate to the SOS-Speech-JS directory:
```bash
cd SOS-Speech-JS
npm install
```

Create a `.env` file with your Twilio credentials:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TARGET_PHONE_NUMBER=+13614259843
PORT=3000
```

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

### 2. Configure Client Application

In the client `.env` file (or create one in `client/` directory):
```env
REACT_APP_SOS_API_URL=http://localhost:3000
REACT_APP_EMERGENCY_PHONE=+13614259843
```

### 3. Run the Client

```bash
cd client
npm start
```

## Components Added

### 1. SOSButton Component
**File**: `client/src/components/SOSButton.jsx`

A floating emergency button that:
- Starts voice recording when clicked
- Shows recording status and countdown (10 seconds)
- Displays transcription in real-time
- Initiates emergency call when recording completes
- Provides visual feedback throughout the process

**Props**: None (uses Redux state for user information)

### 2. SOS Service
**File**: `client/src/services/sosService.js`

API integration service with methods:
- `makeEmergencyCall(userId, transcribedMessage, phoneNumber)` - Initiate emergency call
- `getUserDetails(userId)` - Fetch user data from SOS database
- `createOrUpdateUser(userData)` - Create or update user in SOS database
- `analyzeEmergencyType(message)` - Detect emergency type from message

## How It Works

### User Flow

1. **Activation**
   - User clicks the red SOS button in bottom-right corner
   - Microphone permission is requested (if not already granted)

2. **Recording**
   - System records audio for 10 seconds
   - Speech-to-text runs in real-time
   - Transcription appears in a popup above the button
   - User can stop early by clicking the button again

3. **Processing**
   - Transcribed text is analyzed for emergency type
   - User data is fetched from Redux store (email, location)
   - API call is made to SOS backend

4. **Emergency Call**
   - SOS backend retrieves complete user data from database
   - Twilio places call to emergency number
   - Structured message is delivered including:
     - User identification and demographics
     - Location information
     - Emergency contact
     - Medical information
     - Transcribed emergency message
     - Detected emergency type

5. **Confirmation**
   - User receives toast notification with call status
   - Call SID is displayed for tracking
   - Status indicator shows success or failure

## Integration with Existing Features

### Redux Store Integration
The SOS button accesses user data from the Redux store:
- `notificationSettings.email` - Used to generate user ID
- `location` - Current user location (ZIP, lat/long)

### Firebase Auth Integration
Can be extended to use Firebase user authentication:
```javascript
const user = useSelector((s) => s.auth.user)
const userId = user?.email || user?.uid
```

### Location Services
Leverages the existing location access feature:
- User location from Quick Start "Connect location" button
- Reverse geocoding via Google Maps API
- Stored in Redux: `{ zip, latitude, longitude }`

## API Endpoints

### SOS Backend (Port 3000)

#### POST `/api/make-call`
Make an emergency call with transcribed message.

**Request:**
```json
{
  "userId": "user@example.com",
  "transcribedMessage": "There is a fire in my building",
  "phoneNumber": "+13614259843"
}
```

**Response:**
```json
{
  "success": true,
  "callSid": "CA59e7bf428ffb3b39f701a0c0a69fab5a",
  "message": "Call initiated successfully",
  "targetNumber": "+13614259843",
  "emergencyType": "fire"
}
```

#### GET `/api/user/:userId`
Get user details by ID.

**Response:**
```json
{
  "user_id": "user1",
  "name": "John Peter",
  "age": "35",
  "sex": "Male",
  "emergencyContact": "361 555 1110",
  "location": "1702 Ennis Joslin Rd, Corpus Christi, TX 78412",
  "medicalInfo": "Specially Abled"
}
```

#### POST `/api/user`
Create or update user information.

**Request:**
```json
{
  "user_id": "user@example.com",
  "name": "Jane Doe",
  "age": "28",
  "sex": "Female",
  "emergencyContact": "+1-555-0123",
  "location": "123 Main St, City, State 12345",
  "medicalInfo": "None"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created/updated successfully",
  "user": { ...userData }
}
```

## Emergency Type Detection

The system automatically analyzes the transcribed message to determine emergency type:

| Emergency Type | Keywords |
|---------------|----------|
| **Fire** | fire, burning, smoke, flames, blaze, burn |
| **Medical** | heart, chest, pain, hurt, injured, bleeding, unconscious, cannot breathe, ambulance, medical, doctor, hospital, sick, fell, broken |
| **Police** | attack, robbery, theft, intruder, threat, danger, weapon, police, crime, assault, break in |
| **Accident** | accident, crash, collision, car, vehicle, wreck, hit |

Default: `medical` if no specific type detected

## User Data Management

### Syncing User Data
To sync user data from the main app to the SOS database:

```javascript
import sosService from './services/sosService'

// After user completes wizard or updates profile
async function syncUserToSOS(userData) {
  try {
    await sosService.createOrUpdateUser({
      user_id: userData.email,
      name: userData.name,
      age: userData.age,
      sex: userData.sex,
      emergencyContact: userData.emergencyContact,
      location: `${userData.address}, ${userData.zip}`,
      medicalInfo: userData.medicalConditions || 'None'
    })
    console.log('User synced to SOS database')
  } catch (error) {
    console.error('Failed to sync user:', error)
  }
}
```

### Database Schema
SQLite database (`SOS-Speech-JS/users.db`):

```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age TEXT,
  sex TEXT,
  emergencyContact TEXT,
  location TEXT,
  medicalInfo TEXT
)
```

## Browser Compatibility

| Browser | Speech Recognition | Status |
|---------|-------------------|--------|
| Chrome | ✅ Full Support | Recommended |
| Edge | ✅ Full Support | Recommended |
| Firefox | ❌ No Support | Not supported |
| Safari | ⚠️ Limited | Partial support |

## Troubleshooting

### Speech Recognition Not Working
- **Solution**: Use Chrome or Edge browser
- Check microphone permissions in browser settings
- Ensure HTTPS in production (not needed for localhost)

### Call Fails
- Check Twilio credentials in SOS backend `.env` file
- Verify target phone number is verified (Twilio trial accounts)
- Check SOS backend server is running on port 3000

### User Not Found Error
- User must exist in SOS database before making calls
- Use `sosService.createOrUpdateUser()` to create user first
- Alternatively, use default users: `user1` or `user2`

### CORS Errors
- Ensure SOS backend has CORS enabled (already configured)
- Check API URL in client `.env` file
- Verify both servers are running

## Production Deployment

### Requirements
1. **HTTPS**: Required for Web Speech API in production
2. **Twilio Account**: Upgrade from trial for unrestricted calling
3. **Environment Variables**: Set all required env vars on production servers
4. **Database**: Consider migrating from SQLite to PostgreSQL/MySQL for production

### Deployment Checklist
- [ ] Set up HTTPS for both client and SOS backend
- [ ] Update `REACT_APP_SOS_API_URL` to production URL
- [ ] Upgrade Twilio account (or verify all emergency numbers)
- [ ] Set production environment variables
- [ ] Test emergency calls end-to-end
- [ ] Set up monitoring and logging
- [ ] Configure database backups

## Future Enhancements

### Planned Features
1. **User Profile Sync**: Automatic sync of user data from main app to SOS database
2. **Multi-language Support**: Transcription in multiple languages
3. **Location Tracking**: Automatic location detection and inclusion in calls
4. **Call History**: Track and display previous emergency calls
5. **Test Mode**: Practice emergency calls without actual Twilio calls
6. **Emergency Contacts**: Call multiple emergency contacts
7. **SMS Fallback**: Send SMS if call fails
8. **Photo/Video**: Capture and send multimedia evidence

### API Enhancements
- WebSocket for real-time call status updates
- Call recording playback
- Emergency call analytics dashboard
- Integration with local emergency services APIs

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify SOS backend server logs
3. Review Twilio call logs in Twilio console
4. Test with default users (`user1`, `user2`) first

## License
MIT License - Same as parent project
