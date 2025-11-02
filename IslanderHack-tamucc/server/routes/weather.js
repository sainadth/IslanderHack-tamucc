const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const notificationService = require('../services/notificationService');

/**
 * Get current weather and hazards for location
 * GET /api/weather/analyze?lat=27.8006&lon=-97.3964
 */
router.get('/analyze', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const analysis = await weatherService.analyzeLocationHazards(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Weather analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze weather conditions'
    });
  }
});

/**
 * Get current weather
 * GET /api/weather/current?lat=27.8006&lon=-97.3964
 */
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
});

/**
 * Get weather forecast
 * GET /api/weather/forecast?lat=27.8006&lon=-97.3964
 */
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const forecast = await weatherService.getForecast(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Failed to fetch forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast data'
    });
  }
});

/**
 * Get official weather alerts
 * GET /api/weather/alerts?lat=27.8006&lon=-97.3964
 */
router.get('/alerts', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const alerts = await weatherService.getWeatherAlerts(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert data'
    });
  }
});

/**
 * Monitor location and send notifications for hazards
 * POST /api/weather/monitor
 * Body: { lat, lon, userId, email, phoneNumber, preferences }
 */
router.post('/monitor', async (req, res) => {
  try {
    const { lat, lon, userId, email, phoneNumber, preferences } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Analyze hazards
    const analysis = await weatherService.analyzeLocationHazards(
      parseFloat(lat),
      parseFloat(lon)
    );

    // Check if any hazards should trigger notifications
    const notifiableHazards = weatherService.shouldNotify(
      analysis.hazards,
      preferences
    );

    if (notifiableHazards.length > 0) {
      // Send notifications for each critical hazard
      const notifications = await Promise.all(
        notifiableHazards.map(async (hazard) => {
          const message = `⚠️ ${hazard.type.toUpperCase()} ALERT: ${hazard.data.description}`;
          
          try {
            await notificationService.sendNotification(
              userId,
              email,
              phoneNumber,
              {
                title: `${hazard.type.toUpperCase()} Alert`,
                message: message,
                type: hazard.type,
                severity: hazard.severity,
                data: hazard.data
              }
            );
            return { hazard: hazard.type, sent: true };
          } catch (error) {
            console.error(`Failed to send ${hazard.type} notification:`, error);
            return { hazard: hazard.type, sent: false, error: error.message };
          }
        })
      );

      res.json({
        success: true,
        data: {
          analysis,
          notifications,
          hazardsDetected: notifiableHazards.length
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          analysis,
          notifications: [],
          hazardsDetected: 0,
          message: 'No critical hazards detected'
        }
      });
    }
  } catch (error) {
    console.error('Weather monitoring failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to monitor weather conditions'
    });
  }
});

module.exports = router;
