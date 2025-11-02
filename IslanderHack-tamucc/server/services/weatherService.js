const axios = require('axios');

/**
 * Weather and Hazard Analysis Service
 * Fetches weather data and analyzes potential hazards to trigger alerts
 */
class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.onewallUrl = 'https://api.openweathermap.org/data/3.0';
    
    // Hazard thresholds
    this.thresholds = {
      hurricane: {
        windSpeed: 74, // mph - Category 1 hurricane
        pressure: 980, // mb
      },
      tornado: {
        windSpeed: 50, // mph
        conditions: ['tornado', 'funnel', 'severe thunderstorm']
      },
      flood: {
        rainfall: 2, // inches per hour
        conditions: ['heavy rain', 'flood', 'flash flood']
      },
      storm: {
        windSpeed: 40, // mph
        conditions: ['thunderstorm', 'severe']
      },
      extremeHeat: {
        temperature: 95, // °F
        heatIndex: 105 // °F
      }
    };
  }

  /**
   * Get current weather for location
   */
  async getCurrentWeather(lat, lon) {
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'imperial' // Fahrenheit
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch current weather:', error.message);
      return null;
    }
  }

  /**
   * Get weather forecast for location
   */
  async getForecast(lat, lon) {
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'imperial'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch forecast:', error.message);
      return null;
    }
  }

  /**
   * Get weather alerts for location
   */
  async getWeatherAlerts(lat, lon) {
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured');
      return [];
    }

    try {
      // OneCall API 3.0 includes alerts
      const response = await axios.get(`${this.onewallUrl}/onecall`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          exclude: 'minutely,hourly',
          units: 'imperial'
        }
      });

      return response.data.alerts || [];
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error.message);
      return [];
    }
  }

  /**
   * Analyze weather data for hazards
   */
  analyzeHazards(weatherData, forecastData) {
    const hazards = [];

    if (!weatherData) return hazards;

    const {
      main,
      wind,
      weather,
      rain,
      snow
    } = weatherData;

    // Check for hurricane conditions
    if (wind.speed >= this.thresholds.hurricane.windSpeed ||
        main.pressure <= this.thresholds.hurricane.pressure) {
      hazards.push({
        type: 'hurricane',
        severity: this.getHurricaneSeverity(wind.speed),
        data: {
          windSpeed: wind.speed,
          pressure: main.pressure,
          description: `Hurricane conditions detected with ${wind.speed} mph winds`
        }
      });
    }

    // Check for tornado conditions
    const weatherDesc = weather[0]?.description?.toLowerCase() || '';
    const isTornadoCondition = this.thresholds.tornado.conditions.some(
      cond => weatherDesc.includes(cond)
    );
    
    if (wind.speed >= this.thresholds.tornado.windSpeed || isTornadoCondition) {
      hazards.push({
        type: 'tornado',
        severity: 'high',
        data: {
          windSpeed: wind.speed,
          conditions: weatherDesc,
          description: 'Tornado warning or severe weather conditions'
        }
      });
    }

    // Check for flood conditions
    const rainfall = rain?.['1h'] || 0;
    const isFloodCondition = this.thresholds.flood.conditions.some(
      cond => weatherDesc.includes(cond)
    );
    
    if (rainfall >= this.thresholds.flood.rainfall || isFloodCondition) {
      hazards.push({
        type: 'flood',
        severity: rainfall >= 3 ? 'critical' : 'high',
        data: {
          rainfall: rainfall,
          conditions: weatherDesc,
          description: `Heavy rainfall detected: ${rainfall} inches/hour`
        }
      });
    }

    // Check for severe storms
    const isStormCondition = this.thresholds.storm.conditions.some(
      cond => weatherDesc.includes(cond)
    );
    
    if (wind.speed >= this.thresholds.storm.windSpeed || isStormCondition) {
      hazards.push({
        type: 'storm',
        severity: 'medium',
        data: {
          windSpeed: wind.speed,
          conditions: weatherDesc,
          description: 'Severe storm conditions'
        }
      });
    }

    // Check for extreme heat
    if (main.temp >= this.thresholds.extremeHeat.temperature) {
      const heatIndex = this.calculateHeatIndex(main.temp, main.humidity);
      if (heatIndex >= this.thresholds.extremeHeat.heatIndex) {
        hazards.push({
          type: 'heat',
          severity: heatIndex >= 115 ? 'critical' : 'high',
          data: {
            temperature: main.temp,
            heatIndex: heatIndex,
            humidity: main.humidity,
            description: `Extreme heat warning: ${main.temp}°F (feels like ${heatIndex}°F)`
          }
        });
      }
    }

    return hazards;
  }

  /**
   * Calculate hurricane category from wind speed
   */
  getHurricaneSeverity(windSpeed) {
    if (windSpeed >= 157) return 'category-5';
    if (windSpeed >= 130) return 'category-4';
    if (windSpeed >= 111) return 'category-3';
    if (windSpeed >= 96) return 'category-2';
    if (windSpeed >= 74) return 'category-1';
    return 'tropical-storm';
  }

  /**
   * Calculate heat index
   */
  calculateHeatIndex(temp, humidity) {
    // Simplified heat index formula
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;

    const t = temp;
    const r = humidity;

    const heatIndex = c1 + (c2 * t) + (c3 * r) + (c4 * t * r) +
                     (c5 * t * t) + (c6 * r * r) + (c7 * t * t * r) +
                     (c8 * t * r * r) + (c9 * t * t * r * r);

    return Math.round(heatIndex);
  }

  /**
   * Get comprehensive hazard analysis for location
   */
  async analyzeLocationHazards(lat, lon) {
    try {
      const [current, forecast, alerts] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        this.getForecast(lat, lon),
        this.getWeatherAlerts(lat, lon)
      ]);

      // Analyze current conditions
      const detectedHazards = this.analyzeHazards(current, forecast);

      // Combine with official alerts
      const officialAlerts = alerts.map(alert => ({
        type: this.categorizeAlert(alert.event),
        severity: 'official',
        data: {
          event: alert.event,
          description: alert.description,
          start: alert.start,
          end: alert.end,
          sender: alert.sender_name
        }
      }));

      return {
        current: current,
        forecast: forecast?.list?.slice(0, 8), // Next 24 hours
        hazards: [...officialAlerts, ...detectedHazards],
        alerts: alerts,
        location: {
          lat,
          lon
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to analyze location hazards:', error);
      throw error;
    }
  }

  /**
   * Categorize NWS alert into our hazard types
   */
  categorizeAlert(eventName) {
    const name = eventName.toLowerCase();
    
    if (name.includes('hurricane') || name.includes('typhoon')) return 'hurricane';
    if (name.includes('tornado')) return 'tornado';
    if (name.includes('flood') || name.includes('flash flood')) return 'flood';
    if (name.includes('thunderstorm') || name.includes('storm')) return 'storm';
    if (name.includes('heat') || name.includes('excessive heat')) return 'heat';
    if (name.includes('wildfire') || name.includes('fire')) return 'wildfire';
    
    return 'other';
  }

  /**
   * Check if hazards should trigger notifications
   */
  shouldNotify(hazards, userPreferences = {}) {
    return hazards.filter(hazard => {
      // Check if user wants this type of alert
      const alertTypes = userPreferences.alertTypes || {};
      const typeEnabled = alertTypes[hazard.type];
      
      if (typeEnabled === false) return false;

      // Only notify for high severity or official alerts
      return hazard.severity === 'official' ||
             hazard.severity === 'critical' ||
             hazard.severity === 'high' ||
             hazard.severity.includes('category');
    });
  }
}

module.exports = new WeatherService();
