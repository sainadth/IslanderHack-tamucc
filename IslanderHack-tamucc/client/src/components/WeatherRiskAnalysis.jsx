import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function WeatherRiskAnalysis() {
  const location = useSelector((state) => state.preparedness.location);
  const [weatherData, setWeatherData] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (location?.zip || (location?.latitude && location?.longitude)) {
      fetchWeatherAndHazards();
      
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchWeatherAndHazards, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [location]);

  const fetchWeatherAndHazards = async () => {
    setLoading(true);
    
    try {
      // Use coordinates if available, otherwise use ZIP
      const params = location.latitude && location.longitude
        ? { lat: location.latitude, lon: location.longitude }
        : { zip: location.zip };

      // Fetch weather and hazard analysis
      const response = await fetch(`http://localhost:5000/api/weather/analyze?${new URLSearchParams(params)}`);
      const data = await response.json();

      if (data.success) {
        setWeatherData(data.current);
        setHazards(data.hazards || []);
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || 'Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'extreme':
        return 'bg-red-500 text-white';
      case 'high':
      case 'severe':
        return 'bg-orange-500 text-white';
      case 'moderate':
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getHazardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hurricane':
      case 'tropical storm':
        return '🌀';
      case 'tornado':
        return '🌪️';
      case 'flood':
      case 'flooding':
        return '🌊';
      case 'severe thunderstorm':
      case 'storm':
        return '⛈️';
      case 'heat':
      case 'excessive heat':
        return '🌡️';
      case 'winter storm':
      case 'snow':
      case 'ice':
        return '❄️';
      case 'fire':
      case 'wildfire':
        return '🔥';
      default:
        return '⚠️';
    }
  };

  if (!location?.zip && !(location?.latitude && location?.longitude)) {
    return (
      <div className="bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">🌦️</span>
          Multi-Hazard Risk Analysis
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Connect your location to view real-time weather and hazard alerts for your area.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🌦️</span>
          Multi-Hazard Risk Analysis
        </h3>
        <button
          onClick={fetchWeatherAndHazards}
          disabled={loading}
          className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
          title="Refresh"
        >
          <svg
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {loading && !weatherData ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : weatherData ? (
        <div className="space-y-4">
          {/* Current Weather */}
          <div className="bg-white/60 dark:bg-slate-700/60 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Current Conditions</p>
                <p className="text-3xl font-bold">{Math.round(weatherData.temp)}°F</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                  {weatherData.description}
                </p>
              </div>
              <div className="text-5xl">
                {weatherData.icon || '☁️'}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Wind</p>
                <p className="font-semibold">{Math.round(weatherData.wind_speed)} mph</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Humidity</p>
                <p className="font-semibold">{weatherData.humidity}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pressure</p>
                <p className="font-semibold">{weatherData.pressure} mb</p>
              </div>
            </div>
          </div>

          {/* Hazard Alerts */}
          {hazards.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <span>⚠️</span>
                Active Hazards ({hazards.length})
              </h4>
              {hazards.map((hazard, idx) => (
                <div
                  key={idx}
                  className={`${getSeverityColor(hazard.severity)} rounded-lg p-3 shadow-md`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{getHazardIcon(hazard.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-sm">{hazard.type}</h5>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-white/20 rounded">
                          {hazard.severity}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">{hazard.description}</p>
                      {hazard.recommendation && (
                        <p className="text-xs mt-2 font-medium">
                          💡 {hazard.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <span className="text-3xl mb-2 block">✅</span>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                No active hazards detected
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Your area is currently safe
              </p>
            </div>
          )}

          {/* Last Update */}
          {lastUpdate && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-slate-600 dark:text-slate-300">
          <p className="text-sm">Unable to load weather data</p>
          <button
            onClick={fetchWeatherAndHazards}
            className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
