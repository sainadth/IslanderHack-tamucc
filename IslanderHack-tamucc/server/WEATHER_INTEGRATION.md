# Weather and Hazard Analysis Integration

This system provides real-time weather monitoring and automatic hazard detection with alert notifications.

## Features

### 🌤️ Weather Data
- **Current Weather**: Real-time weather conditions for any location
- **5-Day Forecast**: Hourly weather predictions
- **Official Alerts**: NWS weather warnings and advisories

### ⚠️ Hazard Detection
The system automatically analyzes weather data to detect:

- **🌀 Hurricanes**: Wind speed ≥74 mph or pressure ≤980 mb
  - Categories 1-5 based on wind speed
  
- **🌪️ Tornadoes**: Wind speed ≥50 mph or severe storm conditions
  
- **🌊 Floods**: Rainfall ≥2 inches/hour or flood warnings
  
- **⛈️ Severe Storms**: Wind speed ≥40 mph or thunderstorm conditions
  
- **🌡️ Extreme Heat**: Temperature ≥95°F and heat index ≥105°F

### 📲 Automatic Notifications
When critical hazards are detected:
- Email alerts (if enabled)
- Push notifications (if enabled)
- SMS alerts (if enabled and configured)

## API Endpoints

### Weather Analysis
```
GET /api/weather/analyze?lat=27.8006&lon=-97.3964
```
Returns comprehensive hazard analysis including:
- Current weather conditions
- Detected hazards with severity levels
- Official weather alerts
- 24-hour forecast

**Response:**
```json
{
  "success": true,
  "data": {
    "current": { /* weather data */ },
    "forecast": [ /* next 24 hours */ ],
    "hazards": [
      {
        "type": "hurricane",
        "severity": "category-2",
        "data": {
          "windSpeed": 100,
          "pressure": 965,
          "description": "Hurricane conditions detected with 100 mph winds"
        }
      }
    ],
    "alerts": [ /* official NWS alerts */ ],
    "location": { "lat": 27.8006, "lon": -97.3964 },
    "timestamp": "2025-11-02T..."
  }
}
```

### Current Weather
```
GET /api/weather/current?lat=27.8006&lon=-97.3964
```

### Weather Forecast
```
GET /api/weather/forecast?lat=27.8006&lon=-97.3964
```

### Weather Alerts
```
GET /api/weather/alerts?lat=27.8006&lon=-97.3964
```

### Monitor & Notify
```
POST /api/weather/monitor
Body: {
  "lat": 27.8006,
  "lon": -97.3964,
  "userId": "user123",
  "email": "user@example.com",
  "phoneNumber": "+15551234567",
  "preferences": {
    "alertTypes": {
      "hurricane": true,
      "tornado": true,
      "flood": true,
      "storm": false,
      "heat": true
    }
  }
}
```

Analyzes location, detects hazards, and sends notifications based on user preferences.

## Setup

### 1. Get OpenWeather API Key
1. Sign up at https://openweathermap.org/api
2. Free tier includes:
   - Current weather
   - 5-day/3-hour forecast
   - Weather alerts (One Call API 3.0)

### 2. Configure Environment
Add to `server/.env`:
```bash
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
cd server
npm install axios
```

### 4. Start Server
```bash
cd server
npm start
```

## Usage Examples

### Test Weather Analysis
```bash
# Test with Corpus Christi, TX coordinates
curl "http://localhost:5000/api/weather/analyze?lat=27.8006&lon=-97.3964"
```

### Monitor Location for Hazards
```bash
curl -X POST http://localhost:5000/api/weather/monitor \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 27.8006,
    "lon": -97.3964,
    "userId": "user123",
    "email": "user@example.com",
    "preferences": {
      "alertTypes": {
        "hurricane": true,
        "tornado": true,
        "flood": true
      }
    }
  }'
```

## Client Integration

### Import Service
```javascript
import weatherService from './services/weatherService';
```

### Get User Location & Analyze Hazards
```javascript
// Get user's location
const location = await weatherService.getUserLocation();

// Analyze hazards
const analysis = await weatherService.analyzeLocationHazards(
  location.lat,
  location.lon
);

console.log('Detected hazards:', analysis.data.hazards);
```

### Monitor with Notifications
```javascript
const result = await weatherService.monitorLocationHazards(
  location.lat,
  location.lon,
  userId,
  email,
  phoneNumber,
  {
    alertTypes: {
      hurricane: true,
      tornado: true,
      flood: true,
      storm: false,
      heat: true
    }
  }
);

console.log('Notifications sent:', result.data.notifications);
```

### Display Hazards in UI
```javascript
{analysis.data.hazards.map(hazard => (
  <div key={hazard.type} 
       className={weatherService.getSeverityColor(hazard.severity)}>
    <h3>{weatherService.formatHazardType(hazard.type)}</h3>
    <p>{hazard.data.description}</p>
  </div>
))}
```

## Hazard Severity Levels

- **Critical**: Immediate danger, take action now
- **High**: Dangerous conditions, prepare to take action
- **Medium**: Monitor conditions, be prepared
- **Low**: Be aware, no immediate action needed
- **Official**: Official NWS alert, follow guidance
- **Category 1-5**: Hurricane classification by wind speed

## Automatic Monitoring

You can set up automatic monitoring by:

1. Getting user's location
2. Calling `/api/weather/monitor` periodically (e.g., every 15-30 minutes)
3. System will send notifications when hazards are detected

Example with setInterval:
```javascript
// Monitor every 30 minutes
setInterval(async () => {
  const location = await getUserLocation();
  await monitorLocationHazards(
    location.lat,
    location.lon,
    userId,
    email,
    phoneNumber,
    preferences
  );
}, 30 * 60 * 1000);
```

## Notes

- Free tier has rate limits (60 calls/minute, 1M calls/month)
- Weather data updates every 10 minutes
- Coordinates use decimal degrees (lat: -90 to 90, lon: -180 to 180)
- All temperatures in Fahrenheit, wind speeds in mph
- Hazard detection runs on every weather check
- Notifications only sent for high/critical severity or official alerts
