# Client-Server Data Flow Diagram

## 🔄 Complete Request Flow Example: Finding Evacuation Shelters

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  USER ACTION: Clicks "Find Shelters" with ZIP code 78401          │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  REACT COMPONENT (EvacuationRoutes.jsx)                            │
│  ────────────────────────────────────────────────                  │
│  const shelters = await evacuationService.findShelters(            │
│    '78401',                                                         │
│    10000,  // radius                                               │
│    10      // max results                                          │
│  );                                                                 │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  EVACUATION SERVICE (evacuationService.js)                          │
│  ────────────────────────────────────────────────                  │
│  if (USE_BACKEND_API) {                                            │
│    // Try backend first                                            │
│    response = await apiService.findShelters(                       │
│      searchLocation,                                               │
│      { radius, max_results }                                       │
│    );                                                               │
│  }                                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API SERVICE (apiService.js)                                        │
│  ────────────────────────────────────────────────                  │
│  async findShelters(zipCode, options) {                            │
│    return this.get(                                                │
│      `/api/maps/shelters/${zipCode}`,                             │
│      { radius, max_results }                                       │
│    );                                                               │
│  }                                                                  │
│                                                                     │
│  HTTP GET Request                                                   │
│  http://localhost:5000/api/maps/shelters/78401?radius=10000       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ Network Request
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NODE.JS EXPRESS SERVER (Port 5000)                                │
│  ────────────────────────────────────────────────                  │
│  server.js → routes/maps.js                                        │
│                                                                     │
│  router.get('/shelters/:zipCode', async (req, res) => {           │
│    const result = await mapsService.findEvacuationShelters(       │
│      zipCode,                                                      │
│      { radius, maxResults }                                        │
│    );                                                               │
│    res.json({ success: true, data: result });                     │
│  });                                                                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MAPS SERVICE (mapsService.js)                                      │
│  ────────────────────────────────────────────────                  │
│  async findEvacuationShelters(location, options) {                 │
│    // 1. Geocode ZIP to coordinates                               │
│    const coords = await this.getCoordinates(location);            │
│                                                                     │
│    // 2. Search for shelters using Google Places API              │
│    const response = await this.client.placesNearby({              │
│      params: {                                                     │
│        location: `${coords.lat},${coords.lng}`,                   │
│        radius: radius,                                             │
│        keyword: 'emergency shelter evacuation',                    │
│        key: this.apiKey                                            │
│      }                                                              │
│    });                                                              │
│                                                                     │
│    // 3. Get details for each shelter                             │
│    // 4. Calculate distances                                       │
│    // 5. Sort by distance                                          │
│                                                                     │
│    return { shelters, count };                                     │
│  }                                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ API Call
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GOOGLE MAPS API                                                    │
│  ────────────────────────────────────────────────                  │
│  - Places API: Find shelters                                       │
│  - Places Details API: Get shelter information                     │
│  - Distance Matrix API: Calculate distances                        │
│                                                                     │
│  Returns: Shelter data with coordinates, ratings, etc.            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ Response
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RESPONSE FLOWS BACK UP THE CHAIN                                  │
│  ────────────────────────────────────────────────                  │
│  Google Maps API                                                    │
│      ↓ [Shelter data]                                              │
│  Maps Service                                                       │
│      ↓ [Formatted shelter objects]                                 │
│  Express Route Handler                                              │
│      ↓ [JSON: { success: true, data: {...} }]                     │
│  Network (HTTP Response)                                            │
│      ↓ [HTTP 200 OK + JSON body]                                  │
│  API Service                                                        │
│      ↓ [Parsed response.data]                                      │
│  Evacuation Service                                                 │
│      ↓ [Transformed shelter data]                                  │
│  React Component                                                    │
│      ↓ [setState(shelters)]                                        │
│  UI Update                                                          │
│      ↓ [Render shelter list]                                       │
│  USER SEES: List of 10 nearby shelters with distances!            │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔀 Fallback Flow (If Backend Unavailable)

```
┌─────────────────────────────────────────────────────────────────────┐
│  EVACUATION SERVICE (evacuationService.js)                          │
│  ────────────────────────────────────────────────────────────────────│
│  if (USE_BACKEND_API) {                                            │
│    try {                                                            │
│      response = await apiService.findShelters(...);                │
│    } catch (error) {                                               │
│      console.warn('Backend failed, falling back to TomTom');      │
│      // ⬇️ FALLBACK PATH                                           │
│    }                                                                │
│  }                                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ Fallback
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TOMTOM API (Direct from Client)                                    │
│  ────────────────────────────────────────────────────                  │
│  fetch('https://api.tomtom.com/search/2/...')                      │
│                                                                     │
│  Returns: Similar shelter data from TomTom                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ Still fails?
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LOCAL DATA FALLBACK                                                │
│  ────────────────────────────────────────────────────                  │
│  return CORPUS_CHRISTI_SAFE_ZONES                                  │
│    .map(zone => ({ ...zone, distance: calculate() }))             │
│    .slice(0, maxResults);                                          │
│                                                                     │
│  Returns: Hardcoded safe zones from local data                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Response Format Comparison

### Backend API Response
```json
{
  "success": true,
  "data": {
    "search_location": "78401",
    "radius_meters": 10000,
    "shelters": [
      {
        "name": "American Bank Center",
        "address": "1901 N Shoreline Blvd, Corpus Christi, TX",
        "location": { "lat": 27.8052, "lng": -97.3972 },
        "rating": 4.5,
        "phone": "+1 361-555-0100",
        "website": "https://example.com",
        "open_now": true,
        "distance": { "text": "1.2 mi", "value": 1932 },
        "duration": { "text": "5 mins", "value": 300 }
      }
    ],
    "count": 5
  }
}
```

### After Transformation (In UI)
```javascript
{
  name: "American Bank Center",
  address: "1901 N Shoreline Blvd, Corpus Christi, TX",
  lat: 27.8052,
  lng: -97.3972,
  rating: 4.5,
  phone: "+1 361-555-0100",
  distance: 1.932,  // km
  distanceMiles: 1.2,
  duration: "5 mins"
}
```

## 🎯 Key Benefits of This Architecture

### 1. **Separation of Concerns**
```
UI Layer         → Only handles display and user interaction
Service Layer    → Business logic and data transformation
API Layer        → HTTP communication
Backend Layer    → External API calls and data storage
```

### 2. **Security**
```
Before: API keys in client code (visible in browser)
After:  API keys only on server (hidden from users)
```

### 3. **Maintainability**
```
Before: API calls scattered across components
After:  Centralized in apiService.js
```

### 4. **Testability**
```
Mock apiService → Test components without real API calls
Mock mapsService → Test routes without Google Maps
```

### 5. **Flexibility**
```
Can switch from Google Maps to another provider
Only need to update mapsService.js
Client code remains unchanged
```

## 🔧 How to Toggle Backends

### Use Node.js Backend (Default)
```env
VITE_USE_BACKEND_API=true
```

### Use TomTom Direct
```env
VITE_USE_BACKEND_API=false
```

### Use Different Backend URL
```env
VITE_API_URL=https://your-production-server.com
```

## 📈 Performance Flow

```
User Request
    ↓ [~0ms]
React Component
    ↓ [~1-5ms - JavaScript execution]
Service Layer
    ↓ [~0ms - function call]
API Service
    ↓ [~50-200ms - Network to localhost]
Express Server
    ↓ [~10-50ms - Route handling]
Maps Service
    ↓ [~200-500ms - External API call]
Google Maps API
    ↓ [~100-300ms - Processing]
Response Back
    ↓ [~50-200ms - Network back]
Component Updates
    ↓ [~10-50ms - React render]
User Sees Result

Total: ~400-1300ms (typically < 1 second)
```

## 🎨 Visual Component Hierarchy

```
App.jsx
  │
  ├─ Header.jsx
  │
  ├─ Home.jsx
  │
  └─ EvacuationPage.jsx
       │
       └─ EvacuationRoutes.jsx
            │
            ├─ Uses: evacuationService
            │         ↓
            │    Uses: apiService
            │         ↓
            │    Calls: Node.js Server
            │
            └─ RouteMap.jsx (displays results)
```

## 🚀 Deployment Considerations

### Development
```
Client:  http://localhost:5173
Server:  http://localhost:5000
```

### Production
```
Client:  https://your-app.com
Server:  https://api.your-app.com

Update .env:
VITE_API_URL=https://api.your-app.com
```

---

This architecture provides a solid foundation for building a scalable, maintainable, and secure emergency preparedness application! 🎉
