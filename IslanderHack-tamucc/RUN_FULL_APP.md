# 🚀 How to Run the Full Web App

This guide will help you run all three servers needed for the complete application.

## 📋 Overview

Your application consists of **3 servers** that need to run simultaneously:

1. **Main Backend Server** (Port 5000) - Emergency Preparedness API
2. **SOS Emergency Call Server** (Port 3000) - BLAND AI voice calling
3. **React Client App** (Port 5173) - Frontend interface

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Client (Port 5173)          │
│   http://localhost:5173              │
│   - Main UI                          │
│   - SOS Button                       │
│   - Evacuation Routes                │
│   - Weather, Alerts, etc.           │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Main Server  │  │ SOS Server   │
│ Port 5000    │  │ Port 3000    │
│              │  │              │
│ - Maps API   │  │ - BLAND AI   │
│ - Plans      │  │ - Calls      │
│ - Weather    │  │ - Transcripts│
│ - Checklist  │  │              │
└──────────────┘  └──────────────┘
```

## 📋 Prerequisites

- Node.js (v14 or higher
- npm or yarn
- BLAND AI API key (for SOS feature)
- Google Maps API key (for maps feature)

## 🔧 Step 1: Environment Configuration

### Main Backend Server (`server/.env`)

Create or update `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Google Maps API (for evacuation routes, shelters)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Database (SQLite)
# Database path will be created automatically

# Other services (if configured)
OPENAI_API_KEY=your_openai_key_if_using_ai_features
```

### SOS Backend Server (`SOS-Speech-JS/.env`)

Create or update `SOS-Speech-JS/.env`:

```env
# BLAND AI Configuration (REQUIRED)
BLAND_AI_API_KEY=your_bland_ai_api_key_here

# Voice Settings
BLAND_AI_VOICE_ID=e1289219-0ea2-4f22-a994-c542c2a48a0f

# Webhook URL (REQUIRED - use ngrok for local testing)
BASE_URL=http://localhost:3000
# For production/testing with webhooks:
# BASE_URL=https://your-ngrok-url.ngrok.io

# Server
PORT=3000

# Emergency Number
TARGET_PHONE_NUMBER=+13614259843
```

**Note for BASE_URL**: For local testing without webhooks, `http://localhost:3000` works. For full webhook functionality (live transcripts), use ngrok or deploy.

### React Client (`client/.env`)

Create or update `client/.env`:

```env
# Main Backend API
VITE_API_URL=http://localhost:5000
VITE_USE_BACKEND_API=true

# SOS Emergency Service
REACT_APP_SOS_API_URL=http://localhost:3000
REACT_APP_EMERGENCY_PHONE=+13614259843

# TomTom Maps (fallback)
VITE_TOMTOM_API_KEY=vVNyaLo1DEfT5tYVFbB5p1JyfxmpBtfB

# Firebase (if using authentication)
# Add your Firebase config here if needed
```

## 🚀 Step 2: Install Dependencies

Install dependencies for all three services:

```bash
# Terminal 1: Install main server dependencies
cd server
npm install

# Terminal 2: Install SOS server dependencies
cd SOS-Speech-JS
npm install

# Terminal 3: Install client dependencies
cd client
npm install
```

## ▶️ Step 3: Start All Servers

You need **3 terminal windows** to run all services:

### Terminal 1: Main Backend Server

```bash
cd server
npm start
# Or for development with auto-reload:
npm run dev
```

✅ Server should be running on: **http://localhost:5000**

You should see:
```
Server is running on port 5000
Emergency Preparedness API ready
```

### Terminal 2: SOS Emergency Call Server

```bash
cd SOS-Speech-JS
npm start
```

✅ Server should be running on: **http://localhost:3000**

You should see:
```
SOS Call System server running on http://localhost:3000
Using BLAND AI for interactive emergency calls
```

### Terminal 3: React Client

```bash
cd client
npm run dev
```

✅ Client should be running on: **http://localhost:5173**

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 Step 4: Access the Application

Open your browser and navigate to:

**http://localhost:5173**

You should see the main Emergency Preparedness application with:
- 🏠 Home page
- 🗺️ Evacuation Routes
- 📋 Emergency Checklist
- 🌤️ Weather Risk Analysis
- 🚨 **SOS Emergency Button** (top-right corner)
- 💬 AI Chatbot

## ✅ Verification Checklist

Check that all services are running:

### 1. Main Backend Health Check
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status": "Server is running", ...}`

### 2. SOS Backend Check
```bash
curl http://localhost:3000/api/user/user1
```
Should return user data (if user exists in database)

### 3. Client
Open **http://localhost:5173** in browser
- Should load without errors
- SOS button visible in top-right corner

## 🚨 Testing the SOS Emergency Feature

To test the emergency calling feature:

1. **Click the SOS button** in the top-right corner
2. **Allow microphone access** when prompted
3. **Record your message** (speak for up to 10 seconds)
4. **Watch the call initiate** and see live transcript appear

**Note**: Make sure you have:
- ✅ BLAND AI API key configured
- ✅ BASE_URL set (use ngrok for webhook testing)
- ✅ Valid phone number in TARGET_PHONE_NUMBER

## 🔄 Quick Start Script (Optional)

You can create a convenience script to start all servers at once:

### For macOS/Linux (`start-all.sh`):

```bash
#!/bin/bash

# Start Main Server
cd server && npm start &
MAIN_PID=$!

# Start SOS Server
cd ../SOS-Speech-JS && npm start &
SOS_PID=$!

# Start Client
cd ../client && npm run dev &
CLIENT_PID=$!

echo "All servers started!"
echo "Main Server PID: $MAIN_PID"
echo "SOS Server PID: $SOS_PID"
echo "Client PID: $CLIENT_PID"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $MAIN_PID $SOS_PID $CLIENT_PID" EXIT
wait
```

Make it executable:
```bash
chmod +x start-all.sh
./start-all.sh
```

### For Windows (`start-all.bat`):

```batch
@echo off

start "Main Server" cmd /k "cd server && npm start"
timeout /t 2 /nobreak > nul

start "SOS Server" cmd /k "cd SOS-Speech-JS && npm start"
timeout /t 2 /nobreak > nul

start "Client" cmd /k "cd client && npm run dev"

echo All servers started!
pause
```

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Server Won't Start

1. **Check dependencies installed**:
   ```bash
   cd server && npm install
   cd ../SOS-Speech-JS && npm install
   cd ../client && npm install
   ```

2. **Check environment variables**:
   - Verify all `.env` files exist
   - Check API keys are valid

3. **Check logs**:
   - Look at terminal output for error messages
   - Check browser console (F12) for client errors

### SOS Feature Not Working

1. **Verify BLAND AI API key**:
   ```bash
   # Check SOS-Speech-JS/.env has valid key
   cat SOS-Speech-JS/.env | grep BLAND_AI_API_KEY
   ```

2. **Check SOS server is running**:
   ```bash
   curl http://localhost:3000/api/user/user1
   ```

3. **For webhook testing, use ngrok**:
   ```bash
   # In a new terminal
   ngrok http 3000
   # Copy the HTTPS URL and update BASE_URL in SOS-Speech-JS/.env
   ```

### Client Can't Connect to Servers

1. **Check CORS** - Servers should have CORS enabled (already configured)
2. **Verify URLs** - Check `client/.env` has correct URLs
3. **Restart client** - Environment variables require restart

## 📝 Environment Variables Summary

| Service | Port | Key Environment Variables |
|---------|------|--------------------------|
| **Main Server** | 5000 | `GOOGLE_MAPS_API_KEY`, `PORT` |
| **SOS Server** | 3000 | `BLAND_AI_API_KEY`, `BASE_URL`, `PORT` |
| **Client** | 5173 | `VITE_API_URL`, `REACT_APP_SOS_API_URL` |

## 🎯 Quick Reference

### Start Commands
```bash
# Terminal 1
cd server && npm start

# Terminal 2  
cd SOS-Speech-JS && npm start

# Terminal 3
cd client && npm run dev
```

### URLs
- **Main App**: http://localhost:5173
- **Main API**: http://localhost:5000
- **SOS API**: http://localhost:3000

### API Endpoints
- Main API: `/api/health`, `/api/maps/*`, `/api/plans/*`
- SOS API: `/api/make-call`, `/api/user/:userId`, `/api/call-transcript/:callId`

## ✨ You're All Set!

Once all three servers are running:
1. ✅ Main backend on port 5000
2. ✅ SOS backend on port 3000  
3. ✅ Client on port 5173

Open **http://localhost:5173** and start using your Emergency Preparedness app!

---

**Need Help?**
- Check individual README files:
  - `server/README.md`
  - `SOS-Speech-JS/README.md`
  - `client/README.md`
- Review integration guides:
  - `BLAND_AI_INTEGRATION_COMPLETE.md`
  - `QUICKSTART_CLIENT_SERVER.md`

