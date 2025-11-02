/**
 * API Service for connecting React client to Node.js backend
 * Base URL can be configured via environment variable
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Handle non-JSON responses (e.g., network errors, CORS errors)
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, create a generic error
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      // Try to parse JSON, handle cases where response might not be JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn(`Response from ${endpoint} is not valid JSON`, parseError);
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      // Enhanced error logging
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error(`API request failed (CORS/Network): ${endpoint}. Check if server is running at ${this.baseUrl}`);
      } else {
        console.error(`API request failed: ${endpoint}`, error);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.fetch(url);
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ==================== MAPS API ====================

  /**
   * Find evacuation shelters near a location
   * @param {string} zipCode - 5-digit ZIP code
   * @param {Object} options - Search options
   * @param {number} options.radius - Search radius in meters (default: 10000)
   * @param {number} options.max_results - Max results to return (default: 5)
   */
  async findShelters(zipCode, options = {}) {
    const { radius = 10000, max_results = 5 } = options;
    return this.get(`/api/maps/shelters/${zipCode}`, { radius, max_results });
  }

  /**
   * Get traffic-aware route between two locations
   * @param {string} origin - Starting address or coordinates
   * @param {string} destination - Destination address (optional)
   * @param {Object} options - Route options
   */
  async getRoute(origin, destination = null, options = {}) {
    const params = { origin, ...options };
    if (destination) {
      params.destination = destination;
    }
    return this.get('/api/maps/route', params);
  }

  /**
   * Calculate best evacuation route from origin to safe destinations
   * @param {string} origin - Starting address or ZIP code
   * @param {boolean} includeShelters - Include nearby shelters (default: true)
   */
  async getEvacuationRoute(origin, includeShelters = true) {
    return this.get('/api/maps/evacuation-route', { 
      origin,
      include_shelters: includeShelters 
    });
  }

  /**
   * Convert address to geographic coordinates
   * @param {string} address - Address or ZIP code to geocode
   */
  async geocode(address) {
    return this.get('/api/maps/geocode', { address });
  }

  /**
   * Calculate distance matrix between multiple origins and destinations
   * @param {Array<string>} origins - Array of origin addresses/coordinates
   * @param {Array<string>} destinations - Array of destination addresses/coordinates
   * @param {string} mode - Travel mode (default: 'driving')
   */
  async getDistanceMatrix(origins, destinations, mode = 'driving') {
    return this.post('/api/maps/distance-matrix', { origins, destinations, mode });
  }

  // ==================== PLANS API ====================

  /**
   * Create a new emergency plan
   * @param {Object} planData - Emergency plan data
   */
  async createPlan(planData) {
    return this.post('/api/plans', planData);
  }

  /**
   * Get an emergency plan by ID
   * @param {string} planId - Plan ID
   */
  async getPlan(planId) {
    return this.get(`/api/plans/${planId}`);
  }

  /**
   * Get all plans for a user
   * @param {string} userId - User ID
   */
  async getUserPlans(userId) {
    return this.get('/api/plans/user', { userId });
  }

  /**
   * Update an existing plan
   * @param {string} planId - Plan ID
   * @param {Object} updates - Fields to update
   */
  async updatePlan(planId, updates) {
    return this.fetch(`/api/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a plan
   * @param {string} planId - Plan ID
   */
  async deletePlan(planId) {
    return this.fetch(`/api/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check if the API server is running
   */
  async healthCheck() {
    return this.get('/api/health');
  }

  // ==================== CHECKLIST API ====================

  /**
   * Get AI-generated supply checklist for a user
   * @param {number} userId - User ID
   * @param {string} language - Language code (en, es, vi)
   */
  async getChecklist(userId, language = 'en') {
    return this.get(`/api/checklist/${userId}`, { language });
  }

  /**
   * Generate custom checklist without user profile
   * @param {Object} options - Checklist generation options
   * @param {Object} options.household_composition - Household info (kids, elderly, pets)
   * @param {Object} options.current_supplies - Current supplies status
   * @param {Object} options.medical_needs - Medical requirements
   * @param {string} options.language - Language code (default: en)
   */
  async generateCustomChecklist(options = {}) {
    return this.post('/api/checklist/generate', options);
  }

  // ==================== NOTIFICATIONS API ====================

  /**
   * Send AI-customized hazard alert (email + push)
   * @param {Object} hazardData - Hazard information
   * @param {Object} userProfile - User profile with email
   * @param {Array} pushSubscriptions - Push notification subscriptions
   */
  async sendHazardAlert(hazardData, userProfile, pushSubscriptions = []) {
    return this.post('/api/notifications/hazard-alert', {
      hazardData,
      userProfile,
      pushSubscriptions
    });
  }

  /**
   * Send checklist reminder notification
   * @param {Object} userProfile - User profile with email
   * @param {Array} incompleteItems - List of incomplete checklist items
   * @param {Array} pushSubscriptions - Push notification subscriptions
   */
  async sendChecklistReminder(userProfile, incompleteItems, pushSubscriptions = []) {
    return this.post('/api/notifications/checklist-reminder', {
      userProfile,
      incompleteItems,
      pushSubscriptions
    });
  }

  /**
   * Test email notification
   * @param {string} email - Email address to send test to
   */
  async testEmail(email) {
    return this.post('/api/notifications/test-email', { email });
  }

  /**
   * Check notification service configuration status
   */
  async getNotificationStatus() {
    return this.get('/api/notifications/config-status');
  }

  /**
   * Get VAPID public key for push notifications
   */
  async getVapidPublicKey() {
    return this.get('/api/notifications/vapid-public-key');
  }

  // ==================== CHAT API ====================

  /**
   * Send chat message to AI assistant
   * @param {Array} messages - Array of message objects with role and content
   * @returns {Promise<Object>} AI response
   */
  async sendChatMessage(messages) {
    return this.post('/api/chat', { messages });
  }

  /**
   * Stream chat response from AI assistant
   * @param {Array} messages - Array of message objects
   * @param {Function} onChunk - Callback for each chunk of streamed content
   * @returns {Promise<void>}
   */
  async streamChatMessage(messages, onChunk) {
    const url = `${this.baseUrl}/api/chat/stream`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              onChunk(data.content || '');
              if (data.done) return;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing or creating custom instances
export default ApiService;

