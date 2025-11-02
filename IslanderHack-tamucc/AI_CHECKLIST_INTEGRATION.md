# AI Checklist Integration

This document explains how the AI-powered supply checklist feature works across the Python and Node.js backends.

## Architecture

```
React Client (Port 5174)
    ↓
Node.js Server (Port 5000)
    ↓
Python FastAPI Backend (Port 8000)
    ↓
AI Service (Groq/OpenAI)
```

## Components

### 1. Python FastAPI Backend (`mavericks/`)

**Endpoint**: `GET /api/hurricane/checklist/{user_id}`

**Features**:
- Fetches user profile (household, medical needs, current supplies)
- Generates personalized AI checklist using LLM
- Supports multiple languages (en, es, vi)
- Returns structured response with checklist text

**Response Schema** (`SupplyChecklistResponse`):
```json
{
  "checklist_text": "string (AI-generated markdown/text)",
  "language": "en",
  "model_used": "groq/llama3-70b",
  "error": null
}
```

### 2. Node.js Proxy Server (`server/`)

**Endpoint**: `GET /api/checklist/:userId`

**Purpose**: Acts as a proxy to the Python backend, providing:
- Centralized API gateway for React client
- Consistent response format
- Error handling and fallback logic
- Request validation

**Additional Endpoint**: `POST /api/checklist/generate`
- Generates checklist without user profile
- Accepts custom household composition, supplies, and medical needs
- Useful for anonymous/guest users

**Response Format**:
```json
{
  "success": true,
  "userId": 1,
  "language": "en",
  "checklist": "• Water (1 gallon per person per day)\n• Non-perishable food...",
  "modelUsed": "groq/llama3-70b",
  "generatedAt": "2025-11-02T10:30:00.000Z"
}
```

### 3. React Client (`client/`)

**Service Layer** (`services/apiService.js`):
```javascript
// Get checklist for existing user
await apiService.getChecklist(userId, language)

// Generate custom checklist without profile
await apiService.generateCustomChecklist({
  household_composition: { kids: 2, elderly: 1, pets: ['dog'] },
  current_supplies: {},
  medical_needs: {},
  language: 'en'
})
```

**UI Integration** (`pages/Home.jsx`):
- "Generate with AI" button in Custom Preparedness Checklist card
- Loading state with spinner animation
- Error handling with fallback to seed checklist
- Parses AI text into array format for Redux store

## Data Flow

1. **User clicks "Generate with AI"** button
2. **React** calls `apiService.generateCustomChecklist()`
3. **Node.js server** receives request at `/api/checklist/generate`
4. **Node.js** forwards request to Python backend at `http://localhost:8000/api/ai/checklist`
5. **Python FastAPI** calls AI service (Groq) with user context
6. **AI generates** personalized checklist based on household needs
7. **Python** returns structured response
8. **Node.js** formats response and adds metadata
9. **React** parses checklist text into items array
10. **Redux store** updates with new checklist
11. **UI** displays checklist in ScoreCard component

## Configuration

### Environment Variables

**Server** (`.env`):
```bash
PYTHON_API_URL=http://localhost:8000
```

**Client** (`.env`):
```bash
VITE_API_URL=http://localhost:5000
```

### Starting Services

1. **Python Backend**:
```bash
cd mavericks
uv run uvicorn app.main:app --reload --port 8000
```

2. **Node.js Server**:
```bash
cd server
npm start
```

3. **React Client**:
```bash
cd client
npm run dev
```

## AI Checklist Features

The AI service generates checklists personalized for:

- **Household Composition**: Adjusts quantities for number of adults, kids, elderly
- **Pets**: Includes pet-specific supplies (food, medication, carriers)
- **Medical Needs**: 
  - Oxygen/concentrator supplies
  - Dialysis equipment
  - Mobility devices
  - Prescription medications (with refill reminders)
- **Current Supplies**: Suggests only missing items
- **Multi-Language**: English, Spanish, Vietnamese
- **Hazard Type**: Customized for hurricanes, floods, wildfires, etc.

## Error Handling

**Client-Side**:
- Shows error banner if API fails
- Falls back to seed checklist
- Maintains UI functionality

**Server-Side**:
- Validates user ID
- Returns 404 if user not found
- Returns 500 for internal errors
- Logs errors to console

**Python-Side**:
- Validates input parameters
- Returns error in response object
- Handles AI service timeouts/failures

## Example AI Checklist Output

```markdown
# Emergency Supply Checklist for Your Household

## Water & Food (3-day minimum)
• Water: 12 gallons (4 people × 1 gal/day × 3 days)
• Non-perishable food: 36 meals
• Manual can opener
• Pet food: 6 pounds for 1 dog

## Medical Supplies
• Oxygen concentrator backup battery (12 hours)
• Blood pressure medication (30-day supply)
• Mobility walker - check wheel condition
• First aid kit with bandages, antiseptics

## Power & Communication
• Portable phone chargers (fully charged)
• Battery-powered radio with extra batteries
• Flashlights (1 per person)
• Solar charger for devices

## Documents & Money
• Insurance policies (waterproof container)
• Medical records and prescriptions
• Photo IDs and birth certificates
• Cash ($200+ in small bills)

## Pet Supplies
• Leash, collar with ID tags
• Pet carrier/crate
• Vaccination records
• Comfort items (toys, blanket)
```

## Future Enhancements

- [ ] Store generated checklists in database
- [ ] Allow users to check off items
- [ ] Send checklist via email/SMS
- [ ] Integration with shopping lists
- [ ] Checklist versioning (compare over time)
- [ ] Share checklists with family members
- [ ] Barcode scanning for inventory tracking

## Testing

**Test Checklist Generation**:
```bash
# Using curl
curl -X GET "http://localhost:5000/api/checklist/1?language=en"

# Using JavaScript
const response = await fetch('http://localhost:5000/api/checklist/1?language=en');
const data = await response.json();
console.log(data.checklist);
```

## Troubleshooting

**Issue**: "Python backend error"
- **Solution**: Ensure Python FastAPI server is running on port 8000

**Issue**: "User not found"
- **Solution**: Use `/api/checklist/generate` endpoint for custom checklist without user profile

**Issue**: AI returns empty checklist
- **Solution**: Check AI service API keys in Python backend `.env` file

**Issue**: Checklist not updating in UI
- **Solution**: Check Redux DevTools to verify store update

## Related Files

- `server/routes/checklist.js` - Node.js proxy routes
- `client/src/services/apiService.js` - Client API methods
- `client/src/pages/Home.jsx` - UI integration
- `mavericks/app/routes/hurricane.py` - Python FastAPI endpoints
- `mavericks/app/services/ai_service.py` - AI generation logic
- `mavericks/app/schemas.py` - Response schemas
