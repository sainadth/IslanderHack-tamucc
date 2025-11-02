import apiService from './apiService';

/**
 * Weather and Hazard Analysis Service
 * Client-side service for fetching weather data and hazard alerts
 */

/**
 * Get comprehensive hazard analysis for location
 */
export const analyzeLocationHazards = async (lat, lon) => {
  try {
    const response = await apiService.get(`/weather/analyze?lat=${lat}&lon=${lon}`);
    return response;
  } catch (error) {
    console.error('Failed to analyze location hazards:', error);
    throw error;
  }
};

/**
 * Get current weather for location
 */
export const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await apiService.get(`/weather/current?lat=${lat}&lon=${lon}`);
    return response;
  } catch (error) {
    console.error('Failed to get current weather:', error);
    throw error;
  }
};

/**
 * Get weather forecast for location
 */
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await apiService.get(`/weather/forecast?lat=${lat}&lon=${lon}`);
    return response;
  } catch (error) {
    console.error('Failed to get weather forecast:', error);
    throw error;
  }
};

/**
 * Get official weather alerts for location
 */
export const getWeatherAlerts = async (lat, lon) => {
  try {
    const response = await apiService.get(`/weather/alerts?lat=${lat}&lon=${lon}`);
    return response;
  } catch (error) {
    console.error('Failed to get weather alerts:', error);
    throw error;
  }
};

/**
 * Monitor location and trigger notifications for hazards
 */
export const monitorLocationHazards = async (lat, lon, userId, email, phoneNumber, preferences) => {
  try {
    const response = await apiService.post('/weather/monitor', {
      lat,
      lon,
      userId,
      email,
      phoneNumber,
      preferences
    });
    return response;
  } catch (error) {
    console.error('Failed to monitor location hazards:', error);
    throw error;
  }
};

/**
 * Get user's current location
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Format hazard type for display
 */
export const formatHazardType = (type) => {
  const typeMap = {
    'hurricane': '🌀 Hurricane',
    'tornado': '🌪️ Tornado',
    'flood': '🌊 Flood',
    'storm': '⛈️ Storm',
    'heat': '🌡️ Extreme Heat',
    'wildfire': '🔥 Wildfire',
    'other': '⚠️ Weather Alert'
  };
  return typeMap[type] || type;
};

/**
 * Get severity color for UI
 */
export const getSeverityColor = (severity) => {
  const colorMap = {
    'critical': 'text-red-600 bg-red-50',
    'high': 'text-orange-600 bg-orange-50',
    'medium': 'text-yellow-600 bg-yellow-50',
    'low': 'text-blue-600 bg-blue-50',
    'official': 'text-purple-600 bg-purple-50',
    'category-5': 'text-red-700 bg-red-100',
    'category-4': 'text-red-600 bg-red-50',
    'category-3': 'text-orange-600 bg-orange-50',
    'category-2': 'text-yellow-600 bg-yellow-50',
    'category-1': 'text-yellow-500 bg-yellow-50',
    'tropical-storm': 'text-blue-600 bg-blue-50'
  };
  return colorMap[severity] || 'text-gray-600 bg-gray-50';
};

export default {
  analyzeLocationHazards,
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  monitorLocationHazards,
  getUserLocation,
  formatHazardType,
  getSeverityColor
};
