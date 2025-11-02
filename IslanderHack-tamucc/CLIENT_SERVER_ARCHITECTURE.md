# Client-Server Architecture Documentation

## Overview

The application now follows a clean 3-tier architecture:

```
┌─────────────────────────────────────────┐
│         React Client (Port 5173)        │
│     - UI Components                     │
│     - Services Layer                    │
│     - State Management                  │
└────────────┬────────────────────────────┘
             │ HTTP Requests
             ▼
┌─────────────────────────────────────────┐
│    Node.js Express Server (Port 5000)   │
│     - REST API Endpoints                │
│     - Google Maps Integration           │
│     - Emergency Plans Management        │
│     - Database (SQLite)                 │
└────────────┬────────────────────────────┘
             │ API Calls (Optional)
             ▼
┌─────────────────────────────────────────┐
│   Python FastAPI Server (Port 8000)     │
│     - Hurricane Data                    │
│     - AI/ML Services                    │
│     - Weather Integration               │
└─────────────────────────────────────────┘
```

## Data Flow

### 1. Evacuation Routes Flow

```
User Action → React Component → evacuat ionService → apiService → Node.js Server → Google Maps API
                                       ↓ (fallback)
                                    TomTom API (direct)
```

**Example:**
```javascript
// User clicks "Get Evacuation Route"
// 1. EvacuationRoutes.jsx calls:
const routes = await evacuationService.getEvacuationRoutes(origin, hazardInfo);

// 2. evacuationService.js tries backend first:
const response = await apiService.getEvacuationRoute(originStr);

// 3. apiService.js makes HTTP request:
GET http://localhost:5000/api/maps/evacuation-route?origin=78401

// 4. Node.js server (maps.js) processes:
const result = await mapsService.calculateEvacuationRoute(origin);

// 5. mapsService.js calls Google Maps:
const response = await this.client.directions({ params });

// 6. Response flows back through the chain
```

### 2. Shelter Lookup Flow

```
User Input (ZIP) → React Component → evacuationService → apiService → Node.js Server → Google Maps Places API
```

**Example:**
```javascript
// User enters ZIP code 78401
// 1. EvacuationRoutes.jsx calls:
const shelters = await evacuationService.findShelters('78401', 10000, 10);

// 2. evacuationService.js uses backend:
const response = await apiService.findShelters(searchLocation, { radius, max_results });

// 3. apiService.js makes HTTP request:
GET http://localhost:5000/api/maps/shelters/78401?radius=10000&max_results=10

// 4. Node.js server processes and returns shelter data
```

### 3. Emergency Plan Flow

```
User Form → React Component → apiService → Node.js Server → SQLite Database
```

**Example:**
```javascript
// User saves emergency plan
// 1. Component calls:
await apiService.createPlan(planData);

// 2. apiService.js makes request:
POST http://localhost:5000/api/plans
Body: { userId, zipCode, household, ... }

// 3. Node.js server saves to database:
const plan = await EmergencyPlan.create(planData);
```

## Client Architecture

### Services Layer

#### `apiService.js` - Backend Communication
- **Purpose**: Single source of truth for all backend API calls
- **Features**:
  - Centralized error handling
  - Request/response formatting
  - Base URL configuration
  - Type-safe method signatures

**Key Methods:**
```javascript
apiService.findShelters(zipCode, options)
apiService.getEvacuationRoute(origin)
apiService.geocode(address)
apiService.createPlan(planData)
apiService.healthCheck()
```

#### `evacuationService.js` - Business Logic
- **Purpose**: Evacuation-specific logic and fallback handling
- **Features**:
  - Tries backend API first
  - Falls back to TomTom API if backend unavailable
  - Uses local data for offline support
  - Calculates safety scores
  - Distance calculations

**Key Methods:**
```javascript
evacuationService.getEvacuationRoutes(origin, hazardInfo)
evacuationService.findShelters(location, radius, maxResults)
evacuationService.geocodeAddress(address)
evacuationService.getCurrentLocation()
```

### Components

#### `EvacuationRoutes.jsx`
- **Purpose**: Main evacuation interface
- **Data Flow**:
  1. User inputs location or uses geolocation
  2. Calls `evacuationService.getEvacuationRoutes()`
  3. Receives route data with traffic info
  4. Displays routes on map and in list
  5. User selects best route

## Server Architecture (Node.js)

### API Endpoints

#### Maps API (`/api/maps/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/maps/shelters/:zipCode` | GET | Find shelters near ZIP code |
| `/api/maps/route` | GET | Get traffic-aware route |
| `/api/maps/evacuation-route` | GET | Calculate best evacuation route |
| `/api/maps/geocode` | GET | Convert address to coordinates |
| `/api/maps/distance-matrix` | POST | Calculate distances |

#### Plans API (`/api/plans/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/plans` | POST | Create emergency plan |
| `/api/plans/:id` | GET | Get plan by ID |
| `/api/plans/user` | GET | Get user's plans |
| `/api/plans/:id` | PUT | Update plan |
| `/api/plans/:id` | DELETE | Delete plan |

### Services Layer

#### `mapsService.js`
- **Purpose**: Google Maps API integration
- **Features**:
  - Geocoding
  - Directions with traffic
  - Places search
  - Distance matrix

#### Database (`database.js`, `EmergencyPlan.js`)
- **Database**: SQLite with Sequelize ORM
- **Models**: EmergencyPlan
- **Features**: Full CRUD operations

## Configuration

### Client Environment Variables

**`.env` file:**
```env
# Backend API
VITE_API_URL=http://localhost:5000

# Enable/disable backend usage
VITE_USE_BACKEND_API=true

# TomTom fallback
VITE_TOMTOM_API_KEY=your_key_here
```

### Server Environment Variables

**`server/.env` file:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# APIs
GOOGLE_MAPS_API_KEY=your_key_here
TOMTOM_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Running the Application

### 1. Start Node.js Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Start React Client
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 3. (Optional) Start Python FastAPI
```bash
cd mavericks
uv sync
python -m uvicorn app.main:app --reload
# API runs on http://localhost:8000
```

## API Communication Examples

### From React to Node.js

```javascript
// In React component
import { apiService } from '../services/apiService';

// Get evacuation route
const response = await apiService.getEvacuationRoute('78401');
console.log(response);
// {
//   success: true,
//   data: {
//     origin: "78401",
//     destination: "San Antonio, TX",
//     route: { ... },
//     recommendation: "Evacuate to San Antonio, TX via the route below"
//   }
// }

// Find shelters
const shelters = await apiService.findShelters('78401', {
  radius: 5000,
  max_results: 10
});
console.log(shelters);
// {
//   success: true,
//   data: {
//     shelters: [ ... ],
//     count: 10
//   }
// }
```

### From Node.js to Google Maps

```javascript
// In mapsService.js
const response = await this.client.directions({
  params: {
    origin: '78401',
    destination: 'San Antonio, TX',
    key: this.apiKey,
    mode: 'driving',
    departure_time: 'now'
  }
});
```

## Error Handling

### Client-Side
```javascript
try {
  const routes = await evacuationService.getEvacuationRoutes(origin);
  setRoutes(routes);
} catch (error) {
  // Fallback to local data or show error message
  console.error('Failed to fetch routes:', error);
  setError('Unable to calculate routes. Using offline data.');
}
```

### Server-Side
```javascript
try {
  const result = await mapsService.findEvacuationShelters(zipCode);
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Shelter lookup error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message 
  });
}
```

## Fallback Strategy

The client implements a **graceful degradation** strategy:

1. **Primary**: Use Node.js backend with Google Maps
   - Best performance
   - Centralized API key management
   - Consistent data format

2. **Fallback 1**: Use TomTom API directly from client
   - If backend is unavailable
   - Still provides real-time data

3. **Fallback 2**: Use local static data
   - If all APIs fail
   - Limited but functional
   - No traffic data

## Benefits of This Architecture

✅ **Separation of Concerns**
- UI logic separate from data fetching
- Business logic separate from API calls

✅ **Security**
- API keys stored on server
- No exposure in client code

✅ **Scalability**
- Easy to add caching
- Can switch APIs without changing client
- Can add rate limiting

✅ **Maintainability**
- Single place to update API calls
- Consistent error handling
- Easy to test

✅ **Resilience**
- Multiple fallback options
- Graceful degradation
- Offline support

## Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Shelter Lookup
```bash
curl "http://localhost:5000/api/maps/shelters/78401?radius=5000"
```

### Test from Client Console
```javascript
// Open browser console on http://localhost:5173
import { apiService } from './src/services/apiService';

// Test health check
await apiService.healthCheck();

// Test shelter lookup
await apiService.findShelters('78401', { radius: 5000, max_results: 5 });
```

## Next Steps

1. **Add Caching**: Redis or in-memory cache for frequent requests
2. **Add Authentication**: JWT tokens for user-specific data
3. **Add Rate Limiting**: Protect against API abuse
4. **Add Monitoring**: Log API usage and errors
5. **Add Tests**: Unit and integration tests
6. **Add WebSockets**: Real-time updates for emergency alerts

## Troubleshooting

### Client can't connect to server
- Check server is running on port 5000
- Verify VITE_API_URL in `.env`
- Check CORS settings in server

### Routes not showing
- Verify Google Maps API key
- Check API quotas not exceeded
- Look at browser console for errors

### Fallback to TomTom
- Backend server may be down
- Check server logs
- Verify network connectivity
