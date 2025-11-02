const express = require('express');
const router = express.Router();
const MapsService = require('../services/mapsService');

// Initialize Maps Service with API key from environment
const mapsService = new MapsService(process.env.GOOGLE_MAPS_API_KEY);

/**
 * GET /api/maps/shelters/:zipCode
 * Find evacuation shelters near a ZIP code
 */
router.get('/shelters/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    const radius = parseInt(req.query.radius) || 10000;
    const maxResults = parseInt(req.query.max_results) || 5;

    // Validate ZIP code format
    if (!/^\d{5}$/.test(zipCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ZIP code format. Must be 5 digits.'
      });
    }

    // Validate radius
    if (radius < 1000 || radius > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Radius must be between 1000 and 50000 meters'
      });
    }

    // Validate max results
    if (maxResults < 1 || maxResults > 20) {
      return res.status(400).json({
        success: false,
        error: 'Max results must be between 1 and 20'
      });
    }

    const result = await mapsService.findEvacuationShelters(zipCode, {
      radius,
      maxResults
    });

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Shelter lookup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/maps/route
 * Get traffic-aware evacuation route
 */
router.get('/route', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    
    if (!origin) {
      return res.status(400).json({ 
        success: false, 
        error: 'Origin is required' 
      });
    }

    let result;
    
    if (destination) {
      // Get route to specific destination
      result = await mapsService.getTrafficAwareRoute(origin, destination, {
        trafficModel: req.query.traffic_model || 'best_guess',
        alternatives: req.query.alternatives === 'true'
      });
    } else {
      // Calculate best evacuation route to safe destination
      result = await mapsService.calculateEvacuationRoute(origin);
    }

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/maps/evacuation-route
 * Calculate best evacuation route from origin to safe destinations
 * Includes nearby shelters along the route
 */
router.get('/evacuation-route', async (req, res) => {
  try {
    const { origin, include_shelters = 'true' } = req.query;
    
    if (!origin) {
      return res.status(400).json({ 
        success: false, 
        error: 'Origin is required' 
      });
    }

    // Calculate evacuation route
    const routeResult = await mapsService.calculateEvacuationRoute(origin);

    if (routeResult.error) {
      return res.status(400).json({ success: false, error: routeResult.error });
    }

    // If shelters are requested, find shelters near origin
    let nearbyShelters = null;
    if (include_shelters === 'true') {
      try {
        const sheltersResult = await mapsService.findEvacuationShelters(origin, {
          radius: 15000, // 15km radius
          maxResults: 10
        });
        
        if (!sheltersResult.error) {
          nearbyShelters = sheltersResult.shelters;
        }
      } catch (error) {
        console.warn('Failed to fetch shelters:', error);
        // Continue without shelters if there's an error
      }
    }

    // Combine route and shelters data
    const response = {
      ...routeResult,
      nearby_shelters: nearbyShelters,
      shelter_count: nearbyShelters ? nearbyShelters.length : 0
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Evacuation route calculation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/maps/geocode
 * Convert address to coordinates
 */
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        error: 'Address is required' 
      });
    }

    const coords = await mapsService.getCoordinates(address);

    if (!coords) {
      return res.status(404).json({ 
        success: false, 
        error: `Could not geocode address: ${address}` 
      });
    }

    res.json({ 
      success: true, 
      data: { address, coordinates: coords } 
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/maps/distance-matrix
 * Calculate distance and duration between multiple origins and destinations
 */
router.post('/distance-matrix', async (req, res) => {
  try {
    const { origins, destinations, mode } = req.body;
    
    if (!origins || !Array.isArray(origins) || origins.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Origins array is required and must not be empty' 
      });
    }

    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Destinations array is required and must not be empty' 
      });
    }

    const result = await mapsService.getDistanceMatrix(origins, destinations, {
      mode: mode || 'driving'
    });

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Distance matrix error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
