const { Client } = require('@googlemaps/google-maps-services-js');

/**
 * Backend Maps Service for Google Maps API
 * Node.js-compatible implementation
 */
class MapsService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Google Maps API key not configured');
        }
        this.client = new Client({});
        this.apiKey = apiKey;
    }

    /**
     * Get coordinates from address
     */
    async getCoordinates(address) {
        try {
            const response = await this.client.geocode({
                params: {
                    address: address,
                    key: this.apiKey
                }
            });

            if (response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                return {
                    lat: location.lat,
                    lng: location.lng
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }

    /**
     * Get traffic-aware evacuation route
     */
    async getTrafficAwareRoute(origin, destination, options = {}) {
        const {
            waypoints = [],
            trafficModel = 'best_guess',
            alternatives = false
        } = options;

        try {
            const params = {
                origin: origin,
                destination: destination,
                key: this.apiKey,
                mode: 'driving',
                departure_time: 'now',
                traffic_model: trafficModel,
                alternatives: alternatives
            };

            if (waypoints.length > 0) {
                params.waypoints = waypoints;
            }

            const response = await this.client.directions({ params });

            if (response.data.routes && response.data.routes.length > 0) {
                const routes = response.data.routes.map(route => {
                    const leg = route.legs[0];
                    return {
                        distance: leg.distance,
                        duration: leg.duration,
                        duration_in_traffic: leg.duration_in_traffic || leg.duration,
                        start_address: leg.start_address,
                        end_address: leg.end_address,
                        steps: leg.steps.map(step => ({
                            instruction: step.html_instructions,
                            distance: step.distance.text,
                            duration: step.duration.text,
                            maneuver: step.maneuver || ''
                        })),
                        overview_polyline: route.overview_polyline.points,
                        summary: route.summary
                    };
                });

                return {
                    origin,
                    destination,
                    traffic_model: trafficModel,
                    routes,
                    route_count: routes.length
                };
            }

            return { error: 'No routes found', routes: [] };
        } catch (error) {
            console.error('Directions error:', error);
            return { error: error.message, routes: [] };
        }
    }

    /**
     * Find evacuation shelters near a location
     */
    async findEvacuationShelters(location, options = {}) {
        const { radius = 5000, maxResults = 10 } = options;

        try {
            // First, get coordinates
            const coords = await this.getCoordinates(location);
            if (!coords) {
                return { error: `Could not geocode location: ${location}`, shelters: [] };
            }

            // Search for shelters using Places API
            const response = await this.client.placesNearby({
                params: {
                    location: `${coords.lat},${coords.lng}`,
                    radius: radius,
                    keyword: 'emergency shelter evacuation',
                    key: this.apiKey
                }
            });

            if (!response.data.results || response.data.results.length === 0) {
                return { 
                    search_location: location,
                    radius_meters: radius,
                    shelters: [],
                    count: 0 
                };
            }

            // Get details for each shelter
            const shelters = await Promise.all(
                response.data.results.slice(0, maxResults).map(async (place) => {
                    try {
                        // Get place details
                        const detailsResponse = await this.client.placeDetails({
                            params: {
                                place_id: place.place_id,
                                fields: ['name', 'formatted_address', 'geometry', 'rating', 'formatted_phone_number', 'website', 'opening_hours'],
                                key: this.apiKey
                            }
                        });

                        const details = detailsResponse.data.result;
                        
                        // Calculate distance
                        const distanceResponse = await this.client.distancematrix({
                            params: {
                                origins: [`${coords.lat},${coords.lng}`],
                                destinations: [`${details.geometry.location.lat},${details.geometry.location.lng}`],
                                key: this.apiKey
                            }
                        });

                        const element = distanceResponse.data.rows[0].elements[0];

                        return {
                            name: details.name,
                            address: details.formatted_address,
                            location: details.geometry.location,
                            rating: details.rating || 0,
                            phone: details.formatted_phone_number || '',
                            website: details.website || '',
                            open_now: details.opening_hours?.open_now ?? null,
                            distance: element.status === 'OK' ? element.distance : null,
                            duration: element.status === 'OK' ? element.duration : null
                        };
                    } catch (err) {
                        console.error('Error processing place:', err);
                        return null;
                    }
                })
            );

            // Filter out null values and sort by distance
            const validShelters = shelters.filter(s => s !== null);
            validShelters.sort((a, b) => {
                const distA = a.distance ? a.distance.value : Infinity;
                const distB = b.distance ? b.distance.value : Infinity;
                return distA - distB;
            });

            return {
                search_location: location,
                radius_meters: radius,
                shelters: validShelters,
                count: validShelters.length
            };

        } catch (error) {
            console.error('Shelter search error:', error);
            return { error: error.message, shelters: [] };
        }
    }

    /**
     * Calculate evacuation route to safe destination
     */
    async calculateEvacuationRoute(origin, options = {}) {
        const safeDestinations = [
            'San Antonio, TX',
            'Austin, TX',
            'Victoria, TX'
        ];

        try {
            const originCoords = await this.getCoordinates(origin);
            if (!originCoords) {
                return { error: `Could not geocode origin: ${origin}`, route: null };
            }

            let bestRoute = null;
            let bestDestination = null;
            let shortestTime = Infinity;

            for (const destination of safeDestinations) {
                const routeResult = await this.getTrafficAwareRoute(origin, destination, {
                    trafficModel: 'best_guess',
                    alternatives: false
                });

                if (routeResult.routes && routeResult.routes.length > 0 && !routeResult.error) {
                    const route = routeResult.routes[0];
                    const trafficTime = route.duration_in_traffic.value;

                    if (trafficTime < shortestTime) {
                        shortestTime = trafficTime;
                        bestRoute = route;
                        bestDestination = destination;
                    }
                }
            }

            if (bestRoute) {
                return {
                    origin,
                    destination: bestDestination,
                    route: bestRoute,
                    recommendation: `Evacuate to ${bestDestination} via the route below`
                };
            }

            return { error: 'Could not calculate evacuation route', route: null };

        } catch (error) {
            console.error('Evacuation route error:', error);
            return { error: error.message, route: null };
        }
    }

    /**
     * Calculate distance matrix between origins and destinations
     */
    async getDistanceMatrix(origins, destinations, options = {}) {
        const { mode = 'driving' } = options;

        try {
            const response = await this.client.distancematrix({
                params: {
                    origins: origins,
                    destinations: destinations,
                    mode: mode,
                    key: this.apiKey
                }
            });

            return response.data;
        } catch (error) {
            console.error('Distance matrix error:', error);
            return { error: error.message, rows: [] };
        }
    }
}

module.exports = MapsService;
