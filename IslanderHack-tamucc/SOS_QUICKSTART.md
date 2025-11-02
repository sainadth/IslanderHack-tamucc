# Quick Start: SOS Emergency Feature

## 🚨 What is it?
A voice-activated emergency calling system that records your voice, transcribes it to text, and automatically calls emergency services with your information.

## 🎯 How to Use

### For End Users

1. **Look for the red SOS button** in the bottom-right corner of the screen
2. **Click the button** to start recording
3. **Speak clearly** for up to 10 seconds describing your emergency
   - Example: "There's a fire in my building on the second floor"
   - Example: "I need medical help, someone is having a heart attack"
   - Example: "There's been a car accident at the intersection"
4. **Wait** or click again to stop recording early
5. Your message will be **automatically sent** to emergency services

### What Happens Next
- Your voice is converted to text
- Emergency type is detected (fire, medical, police, accident)
- An automated call is placed to emergency services including:
  - Your name and demographics
  - Your location
  - Your emergency contact
  - Medical information (if any)
  - Your transcribed emergency message

## ⚙️ Setup for Developers

### 1. Start the SOS Backend

```bash
cd SOS-Speech-JS
npm install
```

Create `.env` file:
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
TARGET_PHONE_NUMBER=+13614259843
```

Start server:
```bash
npm start
```

### 2. Configure Client

Create or update `client/.env`:
```env
REACT_APP_SOS_API_URL=http://localhost:3000
REACT_APP_EMERGENCY_PHONE=+13614259843
```

### 3. Run Client

```bash
cd client
npm install
npm start
```

### 4. Test the Feature

1. Open `http://localhost:5173`
2. Allow microphone permission
3. Click the red SOS button
4. Speak your test message
5. Check console for API response

## 📋 Testing Checklist

- [ ] SOS backend running on port 3000
- [ ] Client running on port 5173
- [ ] Microphone permission granted
- [ ] Twilio credentials configured
- [ ] Emergency phone number verified in Twilio (for trial accounts)
- [ ] User exists in SOS database (default: `user1`, `user2`)

## 🔧 Twilio Setup

### Trial Account
1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. **Important**: Verify the target emergency number in Twilio console

### Verify a Phone Number (Trial)
1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Click "+" to add a number
3. Enter the emergency number
4. Complete verification process

## 🎤 Browser Requirements

✅ **Supported Browsers:**
- Chrome (recommended)
- Edge (recommended)
- Safari (limited)

❌ **Not Supported:**
- Firefox

## 🐛 Common Issues

### "Microphone permission denied"
- **Fix**: Allow microphone in browser settings
- Chrome: Settings → Privacy and Security → Site Settings → Microphone

### "Speech recognition not supported"
- **Fix**: Use Chrome or Edge browser
- Firefox doesn't support Web Speech API

### "Failed to initiate emergency call"
- **Fix**: Check SOS backend is running (`http://localhost:3000`)
- Verify Twilio credentials in `.env`
- Check target phone number is verified (trial accounts)

### "User not found"
- **Fix**: User must exist in SOS database
- Use default users: `user1` or `user2`
- Or create user via API: `POST /api/user`

## 📚 Documentation

For complete documentation, see:
- **Integration Guide**: `SOS_INTEGRATION_GUIDE.md`
- **SOS Backend README**: `SOS-Speech-JS/README.md`
- **API Documentation**: `SOS_INTEGRATION_GUIDE.md#api-endpoints`

## 🎨 UI Elements

### SOS Button States

1. **Ready** (default)
   - Red button with pulsing animation
   - Text: "SOS" with microphone icon
   - Hover: Scales up

2. **Recording** (active)
   - Pulsing red button
   - Shows countdown timer (10, 9, 8...)
   - Stop icon instead of microphone
   - Transcription popup appears

3. **Processing** (after recording)
   - Loading spinner
   - Text: Processing or sending message

4. **Success**
   - Green checkmark
   - Toast notification with call ID

5. **Error**
   - Red X
   - Toast notification with error message

## 🔒 Security Notes

- Microphone access is required (requested on first use)
- All voice data is processed client-side (Web Speech API)
- Only transcribed text is sent to backend
- HTTPS required in production
- Twilio handles secure call placement

## 🚀 Production Checklist

Before deploying to production:

- [ ] Enable HTTPS on both client and backend
- [ ] Upgrade Twilio account (remove trial restrictions)
- [ ] Set production environment variables
- [ ] Migrate from SQLite to production database
- [ ] Implement user authentication
- [ ] Add call history and logging
- [ ] Set up monitoring and alerts
- [ ] Test emergency calls end-to-end
- [ ] Add terms of service for emergency feature
- [ ] Implement rate limiting
- [ ] Add emergency call confirmation dialog

## 📞 Emergency Numbers

**Default**: `+13614259843` (from .env file)

To change:
1. Update `TARGET_PHONE_NUMBER` in `SOS-Speech-JS/.env`
2. Update `REACT_APP_EMERGENCY_PHONE` in `client/.env`
3. Verify new number in Twilio (if trial account)

## 💡 Tips

1. **Speak clearly** and at normal pace
2. **Include key information**:
   - Type of emergency (fire, medical, police, accident)
   - Specific location details
   - Number of people involved
   - Immediate dangers or hazards

3. **Test before real emergency**:
   - Use with verified test numbers
   - Practice recording messages
   - Familiarize yourself with the interface

4. **Keep device charged**:
   - Ensure battery life for emergencies
   - Save emergency numbers in contacts as backup

## 📊 Analytics

Future enhancement: Track emergency call metrics
- Total calls initiated
- Response times
- Emergency types distribution
- Success/failure rates
- Geographic distribution

---

**Support**: For issues, check browser console and SOS backend logs.

**License**: MIT
