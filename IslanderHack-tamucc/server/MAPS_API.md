# Maps Service API Documentation

The Maps Service provides Google Maps integration for evacuation routes, shelter lookup, and geocoding functionality.

## Configuration

Ensure your `.env` file contains:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## API Endpoints

### 1. Find Evacuation Shelters

**GET** `/api/maps/shelters/:zipCode`

Find evacuation shelters near a ZIP code location.

**Parameters:**
- `zipCode` (path, required): 5-digit ZIP code
- `radius` (query, optional): Search radius in meters (1000-50000, default: 10000)
- `max_results` (query, optional): Maximum number of results (1-20, default: 5)

**Example:**
```bash
curl http://localhost:5000/api/maps/shelters/78401?radius=5000&max_results=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "search_location": "78401",
    "radius_meters": 5000,
    "shelters": [
      {
        "name": "Emergency Shelter Name",
        "address": "123 Main St, Corpus Christi, TX 78401",
        "location": {
          "lat": 27.8006,
          "lng": -97.3964
        },
        "rating": 4.5,
        "phone": "+1 361-555-0100",
        "website": "https://example.com",
        "open_now": true,
        "distance": {
          "text": "1.2 mi",
          "value": 1932
        },
        "duration": {
          "text": "5 mins",
          "value": 300
        }
      }
    ],
    "count": 5
  }
}
```

### 2. Get Traffic-Aware Route

**GET** `/api/maps/route`

Get traffic-aware evacuation route between two locations.

**Parameters:**
- `origin` (query, required): Starting address or coordinates
- `destination` (query, optional): Destination address (if omitted, calculates best evacuation route)
- `traffic_model` (query, optional): "best_guess", "optimistic", or "pessimistic" (default: "best_guess")
- `alternatives` (query, optional): Return alternative routes (true/false, default: false)

**Example:**
```bash
# Specific destination
curl "http://localhost:5000/api/maps/route?origin=78401&destination=San%20Antonio,%20TX"

# Best evacuation route
curl "http://localhost:5000/api/maps/route?origin=78401"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "origin": "78401",
    "destination": "San Antonio, TX",
    "traffic_model": "best_guess",
    "routes": [
      {
        "distance": {
          "text": "143 mi",
          "value": 230123
        },
        "duration": {
          "text": "2 hours 15 mins",
          "value": 8100
        },
        "duration_in_traffic": {
          "text": "2 hours 30 mins",
          "value": 9000
        },
        "start_address": "Corpus Christi, TX 78401, USA",
        "end_address": "San Antonio, TX, USA",
        "steps": [...],
        "overview_polyline": "encoded_polyline_string",
        "summary": "US-181 N and I-37 N"
      }
    ],
    "route_count": 1
  }
}
```

### 3. Calculate Evacuation Route

**GET** `/api/maps/evacuation-route`

Calculate the best evacuation route from origin to safe destinations (San Antonio, Austin, or Victoria).

**Parameters:**
- `origin` (query, required): Starting address or ZIP code

**Example:**
```bash
curl "http://localhost:5000/api/maps/evacuation-route?origin=78401"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "origin": "78401",
    "destination": "San Antonio, TX",
    "route": {
      "distance": {...},
      "duration": {...},
      "duration_in_traffic": {...},
      "steps": [...]
    },
    "recommendation": "Evacuate to San Antonio, TX via the route below"
  }
}
```

### 4. Geocode Address

**GET** `/api/maps/geocode`

Convert an address to geographic coordinates.

**Parameters:**
- `address` (query, required): Address or ZIP code to geocode

**Example:**
```bash
curl "http://localhost:5000/api/maps/geocode?address=78401"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "78401",
    "coordinates": {
      "lat": 27.8006,
      "lng": -97.3964
    }
  }
}
```

### 5. Distance Matrix

**POST** `/api/maps/distance-matrix`

Calculate distance and duration between multiple origins and destinations.

**Body:**
```json
{
  "origins": ["78401", "78404"],
  "destinations": ["San Antonio, TX", "Austin, TX"],
  "mode": "driving"
}
```

**Parameters:**
- `origins` (array, required): Array of origin addresses/coordinates
- `destinations` (array, required): Array of destination addresses/coordinates
- `mode` (string, optional): Travel mode - "driving", "walking", "bicycling", "transit" (default: "driving")

**Example:**
```bash
curl -X POST http://localhost:5000/api/maps/distance-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "origins": ["78401"],
    "destinations": ["San Antonio, TX", "Austin, TX"],
    "mode": "driving"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "destination_addresses": ["San Antonio, TX, USA", "Austin, TX, USA"],
    "origin_addresses": ["Corpus Christi, TX 78401, USA"],
    "rows": [
      {
        "elements": [
          {
            "distance": {
              "text": "143 mi",
              "value": 230123
            },
            "duration": {
              "text": "2 hours 15 mins",
              "value": 8100
            },
            "status": "OK"
          },
          {
            "distance": {
              "text": "215 mi",
              "value": 346027
            },
            "duration": {
              "text": "3 hours 20 mins",
              "value": 12000
            },
            "status": "OK"
          }
        ]
      }
    ],
    "status": "OK"
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (geocoding failed)
- `500` - Internal Server Error

## Integration with Python FastAPI

You can call these endpoints from your Python FastAPI backend:

```python
import requests

# Find shelters
response = requests.get(
    'http://localhost:5000/api/maps/shelters/78401',
    params={'radius': 5000, 'max_results': 10}
)
shelters = response.json()

# Get evacuation route
response = requests.get(
    'http://localhost:5000/api/maps/evacuation-route',
    params={'origin': '78401'}
)
route = response.json()
```

## Testing

Start the server:
```bash
cd server
npm start
```

Test the health check:
```bash
curl http://localhost:5000/api/health
```

Test shelter lookup:
```bash
curl http://localhost:5000/api/maps/shelters/78401
```

## Notes

- The Google Maps API key must have the following APIs enabled:
  - Geocoding API
  - Directions API
  - Places API
  - Distance Matrix API
- Traffic data is only available for routes in certain regions
- Rate limits apply based on your Google Maps API plan
