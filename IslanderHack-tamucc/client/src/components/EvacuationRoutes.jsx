import { useState, useEffect } from 'react';
import { evacuationService } from '../services/evacuationService';
import RouteMap from './RouteMap';

export default function EvacuationRoutes() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [hazardInfo, setHazardInfo] = useState({
    needsMedical: false,
    needsPets: false,
    specialNeeds: false
  });

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const currentLocation = await evacuationService.getCurrentLocation();
      setLocation(currentLocation);
      await fetchRoutes(currentLocation);
    } catch (err) {
      setError('Unable to get your location. Please enter address manually.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError('');
    try {
      const geocoded = await evacuationService.geocodeAddress(address);
      setLocation(geocoded);
      await fetchRoutes(geocoded);
    } catch (err) {
      setError('Unable to find address. Please check and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async (origin) => {
    try {
      const evacuationRoutes = await evacuationService.getEvacuationRoutes(origin, hazardInfo);
      setRoutes(evacuationRoutes);
    } catch (err) {
      setError('Unable to calculate routes. Please try again.');
      console.error(err);
    }
  };

  const refreshRoutes = () => {
    if (location) {
      fetchRoutes(location);
    }
  };

  useEffect(() => {
    if (location) {
      refreshRoutes();
    }
  }, [hazardInfo]);

  return (
    <div className="space-y-8">
      {/* Location Input */}
      <div className="glass-card rounded-2xl p-8 fade-in-up">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
          <span className="text-4xl">🗺️</span> 
          <span>Find Evacuation Routes</span>
        </h2>
        
        <div className="space-y-6">
          <div className="flex gap-3">
            <button
              onClick={handleGetCurrentLocation}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or enter address</span>
            </div>
          </div>

          <form onSubmit={handleAddressSubmit} className="flex gap-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address or ZIP code"
              className="flex-1 px-5 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 placeholder:text-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
            >
              Search
            </button>
          </form>

          {/* Hazard Options */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium mb-2 text-slate-700">Special Requirements:</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hazardInfo.needsMedical}
                  onChange={(e) => setHazardInfo({...hazardInfo, needsMedical: e.target.checked})}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Medical needs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hazardInfo.needsPets}
                  onChange={(e) => setHazardInfo({...hazardInfo, needsPets: e.target.checked})}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Pets</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hazardInfo.specialNeeds}
                  onChange={(e) => setHazardInfo({...hazardInfo, specialNeeds: e.target.checked})}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Special needs</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Calculating routes...</span>
          </div>
        )}
      </div>

      {/* Routes Display */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recommended Evacuation Routes</h3>
            <button
              onClick={refreshRoutes}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {routes.map((routeData, index) => (
            <div
              key={index}
              className="glass-card rounded-lg p-6 slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                      index === 0 ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800">
                      {routeData.destination.name}
                    </h4>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{routeData.destination.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">
                    {routeData.summary.durationMinutes} min
                  </div>
                  <div className="text-sm text-slate-500">{routeData.summary.distanceMiles} miles</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-xs font-medium text-blue-900 mb-1">Capacity</div>
                  <div className="font-bold text-lg text-slate-900">{routeData.destination.capacity}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs font-medium text-slate-900 mb-1">Type</div>
                  <div className="font-semibold text-sm capitalize text-slate-900">{routeData.destination.type.replace('_', ' ')}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs font-medium text-slate-900 mb-1">Distance</div>
                  <div className="font-bold text-lg text-slate-900">{routeData.summary.distanceKm} km</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="text-xs font-medium text-green-900 mb-1">Traffic</div>
                  <div className="font-semibold text-slate-900">
                    {routeData.summary.trafficDelay > 0 
                      ? `+${Math.round(routeData.summary.trafficDelay / 60)} min` 
                      : 'Clear'}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-medium text-slate-900 mb-2">Facilities:</div>
                <div className="flex flex-wrap gap-2">
                  {routeData.destination.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-medium rounded-full border border-blue-200"
                    >
                      {facility.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-4 font-medium">
                {routeData.destination.description}
              </p>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedRoute(routeData)}
                  className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                >
                  Start Navigation
                </button>
                <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium">
                  Share
                </button>
              </div>

              {routeData.fallback && (
                <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Estimated time based on distance (live traffic unavailable)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Route Map Modal */}
      {selectedRoute && location && (
        <RouteMap
          route={selectedRoute.route}
          summary={selectedRoute.summary}
          origin={location}
          destination={selectedRoute.destination}
          nearbyShelters={selectedRoute.nearby_shelters || []}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  );
}
