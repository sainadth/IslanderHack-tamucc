#!/bin/bash

# Test script for Maps Service API endpoints
# Make sure the server is running on http://localhost:5000

echo "🧪 Testing Maps Service API Endpoints"
echo "========================================="
echo ""

BASE_URL="http://localhost:5000"

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "${BASE_URL}/api/health" | jq '.'
echo ""
echo ""

# Test 2: Root Endpoint (should show all available endpoints)
echo "2️⃣  Testing Root Endpoint (Available Endpoints)..."
curl -s "${BASE_URL}/" | jq '.'
echo ""
echo ""

# Test 3: Geocode Address
echo "3️⃣  Testing Geocode (ZIP Code 78401)..."
curl -s "${BASE_URL}/api/maps/geocode?address=78401" | jq '.'
echo ""
echo ""

# Test 4: Find Shelters
echo "4️⃣  Testing Shelter Lookup (ZIP Code 78401)..."
curl -s "${BASE_URL}/api/maps/shelters/78401?radius=5000&max_results=3" | jq '.'
echo ""
echo ""

# Test 5: Evacuation Route
echo "5️⃣  Testing Evacuation Route (from 78401)..."
curl -s "${BASE_URL}/api/maps/evacuation-route?origin=78401" | jq '.'
echo ""
echo ""

# Test 6: Traffic-Aware Route
echo "6️⃣  Testing Traffic-Aware Route (78401 to San Antonio)..."
curl -s "${BASE_URL}/api/maps/route?origin=78401&destination=San%20Antonio,%20TX" | jq '.'
echo ""
echo ""

# Test 7: Distance Matrix
echo "7️⃣  Testing Distance Matrix..."
curl -s -X POST "${BASE_URL}/api/maps/distance-matrix" \
  -H "Content-Type: application/json" \
  -d '{
    "origins": ["78401"],
    "destinations": ["San Antonio, TX", "Austin, TX"],
    "mode": "driving"
  }' | jq '.'
echo ""
echo ""

# Test 8: Error Handling - Invalid ZIP Code
echo "8️⃣  Testing Error Handling (Invalid ZIP Code)..."
curl -s "${BASE_URL}/api/maps/shelters/INVALID" | jq '.'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Note: Some tests may show errors or empty results if:"
echo "  - Google Maps API key is not configured"
echo "  - API quota is exceeded"
echo "  - Network issues"
echo ""
echo "Check the server logs for detailed error messages."
