# 🚀 Quick Start Guide - Client-Server Integration

## ✅ What's Been Updated

Your React client now communicates with your Node.js backend server for all data fetching!

## 🎯 New Architecture

```
React Client (Port 5173)
     ↓ HTTP Requests
Node.js Server (Port 5000)
     ↓ API Calls
Google Maps API / SQLite DB
```

## 📁 New Files Created

### Client
- ✅ `client/src/services/apiService.js` - Backend API client
- ✅ `client/src/pages/ApiTestPage.jsx` - API testing interface
- ✅ `client/.env.example` - Environment template

### Documentation
- ✅ `CLIENT_SERVER_ARCHITECTURE.md` - Complete architecture guide
- ✅ `CLIENT_INTEGRATION_COMPLETE.md` - Integration summary

### Server (Already Created)
- ✅ `server/services/mapsService.js` - Google Maps integration
- ✅ `server/routes/maps.js` - Maps API endpoints
- ✅ `server/MAPS_API.md` - API documentation

## 🚀 How to Run

### 1. Start Node.js Server
```bash
cd server
npm start
```
✅ Server runs on http://localhost:5000

### 2. Start React Client
```bash
cd client
npm run dev
```
✅ Client runs on http://localhost:5173

### 3. Test the Integration

**Visit:** http://localhost:5173

**Use the Evacuation Page:**
- Click on "Evacuation Routes"
- Enter a location or use "My Location"
- See routes fetched from your Node.js server!

**Test API directly:**
```bash
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/maps/shelters/78401?radius=5000"
```

## 🔧 Configuration

Your `.env` files are already configured:

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_USE_BACKEND_API=true
VITE_TOMTOM_API_KEY=vVNyaLo1DEfT5tYVFbB5p1JyfxmpBtfB
```

**Server** (`server/.env`):
```env
GOOGLE_MAPS_API_KEY=AIzaSyBoI4Es0phAjBLJy0bVoljkqGpfFkWCEgI
PORT=5000
# ... other settings
```

## 🧪 How to Test

### Option 1: Use the App
1. Start both servers
2. Go to http://localhost:5173
3. Navigate to "Evacuation Routes"
4. Test the features!

### Option 2: Browser Console
```javascript
// Open console on http://localhost:5173
import { apiService } from './src/services/apiService.js';

// Test
await apiService.healthCheck();
await apiService.findShelters('78401', { radius: 5000 });
await apiService.getEvacuationRoute('78401');
```

### Option 3: Command Line
```bash
# Test server endpoints
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/maps/shelters/78401"
curl "http://localhost:5000/api/maps/evacuation-route?origin=78401"
```

## 📚 Key Files to Know

### Client Files
- **`client/src/services/apiService.js`** - All backend API calls
- **`client/src/services/evacuationService.js`** - Business logic + fallbacks
- **`client/src/components/EvacuationRoutes.jsx`** - Main UI component

### Server Files
- **`server/server.js`** - Express app entry point
- **`server/routes/maps.js`** - Maps API endpoints
- **`server/services/mapsService.js`** - Google Maps integration

## 🎨 What Changed in Your Components

### Before (Direct TomTom calls)
```javascript
// Components called TomTom directly
const routeData = await fetch('https://api.tomtom.com/...');
```

### After (Backend API)
```javascript
// Components call your backend
import { apiService } from '../services/apiService';
const routes = await apiService.getEvacuationRoute('78401');
```

## ✨ Features

✅ **Centralized API Management**
- All API keys on server
- Single source of truth
- Easy to update

✅ **Automatic Fallbacks**
- Tries backend first
- Falls back to TomTom if needed
- Uses local data as last resort

✅ **Better Security**
- API keys hidden from client
- CORS protection
- Server-side validation

✅ **Easy Testing**
- Health check endpoint
- Test page available
- Clear error messages

## 🔍 API Endpoints Available

### Maps API
- `GET /api/maps/shelters/:zipCode` - Find shelters
- `GET /api/maps/route` - Get traffic route
- `GET /api/maps/evacuation-route` - Best evacuation route
- `GET /api/maps/geocode` - Address to coordinates
- `POST /api/maps/distance-matrix` - Multiple distances

### Plans API
- `POST /api/plans` - Create emergency plan
- `GET /api/plans/:id` - Get plan by ID
- `GET /api/plans/user?userId=...` - Get user's plans
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### System
- `GET /api/health` - Health check
- `GET /` - Available endpoints list

## 🐛 Troubleshooting

### Server won't start
```bash
cd server
npm install
npm start
```

### Client shows errors
```bash
cd client
npm install
npm run dev
```

### Can't connect to server
- Make sure server is running on port 5000
- Check `.env` has correct `VITE_API_URL`
- Restart client after env changes

### No routes showing
- Check Google Maps API key in server `.env`
- Look at server console for errors
- Try: `curl http://localhost:5000/api/health`

## 📖 Documentation

For detailed information, see:

- **CLIENT_SERVER_ARCHITECTURE.md** - Complete architecture guide
- **CLIENT_INTEGRATION_COMPLETE.md** - Implementation details
- **server/MAPS_API.md** - API endpoint documentation
- **server/INTEGRATION_COMPLETE.md** - Server setup guide

## 🎉 You're All Set!

Your app now has a clean client-server architecture with:
- ✅ Centralized API management
- ✅ Proper error handling
- ✅ Fallback strategies
- ✅ Security best practices
- ✅ Easy testing
- ✅ Comprehensive documentation

**Next Steps:**
1. Start both servers
2. Test the evacuation routes feature
3. Check the API health endpoint
4. Review the documentation files

Happy coding! 🚀
