# Emergency Preparedness API Server

Backend API for the Emergency Preparedness application built with Node.js, Express, and Sequelize ORM.

## Features

- ✅ RESTful API with Express.js
- ✅ SQLite database with Sequelize ORM
- ✅ CRUD operations for emergency plans
- ✅ Automatic data validation
- ✅ JSON field support for complex data
- ✅ Auto-calculated completion percentage
- ✅ Comprehensive error handling
- ✅ CORS enabled for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with default values:

```env
PORT=5000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### Emergency Plans

#### Create Plan
```
POST /api/plans
Content-Type: application/json

{
  "userId": "user123",
  "zipCode": "78401",
  "adults": 2,
  "kids": 1,
  "pets": 1,
  "hasVehicle": true,
  "medicalNeeds": ["insulin"],
  "emergencyContacts": [
    {
      "name": "John Doe",
      "phone": "555-1234",
      "relationship": "brother"
    }
  ]
}
```

#### Get All Plans for User
```
GET /api/plans/user/:userId
```

#### Get Single Plan
```
GET /api/plans/:id
```

#### Search by Zip Code
```
GET /api/plans/search/zipcode/:zipCode
```

#### Update Plan
```
PUT /api/plans/:id
Content-Type: application/json

{
  "adults": 3,
  "kids": 2
}
```

#### Update Supplies Checklist
```
PATCH /api/plans/:id/supplies
Content-Type: application/json

{
  "water": true,
  "food": true,
  "firstAid": true
}
```

#### Update Emergency Contacts
```
PATCH /api/plans/:id/contacts
Content-Type: application/json

{
  "contacts": [
    {
      "name": "Jane Smith",
      "phone": "555-5678",
      "relationship": "sister"
    }
  ]
}
```

#### Delete Plan
```
DELETE /api/plans/:id
```

#### Get User Statistics
```
GET /api/plans/user/:userId/stats
```

Returns:
```json
{
  "success": true,
  "data": {
    "totalPlans": 3,
    "completePlans": 2,
    "incompletePlans": 1,
    "averageCompletion": 75,
    "lastUpdated": "2025-11-02T10:30:00.000Z"
  }
}
```

## Database Schema

### EmergencyPlan Model

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| userId | STRING | User identifier (required) |
| userEmail | STRING | User email |
| zipCode | STRING | ZIP code (required, 5-10 chars) |
| address | STRING | Full address |
| latitude | FLOAT | GPS latitude |
| longitude | FLOAT | GPS longitude |
| adults | INTEGER | Number of adults (default: 1) |
| kids | INTEGER | Number of kids (default: 0) |
| elderly | INTEGER | Number of elderly (default: 0) |
| pets | INTEGER | Number of pets (default: 0) |
| petDetails | TEXT | Pet details |
| hasMedicalNeeds | BOOLEAN | Has medical needs flag |
| medicalNeeds | JSON | Array of medical needs |
| medications | TEXT | Required medications |
| specialNeeds | TEXT | Special requirements |
| hasVehicle | BOOLEAN | Has vehicle flag |
| vehicleType | STRING | Type of vehicle |
| transportationNeeds | TEXT | Transportation requirements |
| emergencyContacts | JSON | Array of emergency contacts |
| preferredSafeZones | JSON | Array of safe zone IDs |
| evacuationRoute | JSON | Saved route data |
| suppliesChecklist | JSON | Supply items checklist |
| isComplete | BOOLEAN | Plan completion status |
| completionPercentage | INTEGER | Completion % (0-100) |
| notificationsEnabled | BOOLEAN | Notifications flag |
| notificationMethod | JSON | Notification preferences |
| lastUpdated | DATE | Last update timestamp |
| notes | TEXT | Additional notes |
| createdAt | DATE | Creation timestamp (auto) |
| updatedAt | DATE | Update timestamp (auto) |

## Data Validation

- ZIP code: 5-10 characters
- Numbers (adults, kids, etc.): Must be >= 0
- Completion percentage: 0-100
- Auto-calculated completion based on filled fields

## Testing with cURL

**Create a plan:**
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "zipCode": "78401",
    "adults": 2,
    "kids": 1,
    "hasVehicle": true
  }'
```

**Get user's plans:**
```bash
curl http://localhost:5000/api/plans/user/test123
```

**Update supplies:**
```bash
curl -X PATCH http://localhost:5000/api/plans/1/supplies \
  -H "Content-Type: application/json" \
  -d '{"water": true, "food": true}'
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Development Notes

- Database file: `database.sqlite` (auto-created)
- Auto-sync enabled in development mode
- Logging enabled for SQL queries in development
- Graceful shutdown on SIGTERM/SIGINT

## Production Deployment

For production, consider:
1. Using PostgreSQL or MySQL instead of SQLite
2. Setting `NODE_ENV=production`
3. Enabling HTTPS
4. Adding authentication middleware
5. Rate limiting
6. Request logging

## Next Steps

To connect the frontend:
1. Update client to use `http://localhost:5000/api`
2. Create API service module in React
3. Handle authentication tokens
4. Implement error handling in UI
