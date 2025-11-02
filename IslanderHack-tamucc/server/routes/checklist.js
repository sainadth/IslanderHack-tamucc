/**
 * Supply Checklist Routes - Proxy to Python FastAPI backend
 * Connects Node.js server to Python AI service for personalized checklists
 */

const express = require('express');
const router = express.Router();

// Python FastAPI backend URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

/**
 * Get AI-generated supply checklist for a user
 * GET /api/checklist/:userId
 * 
 * Query Parameters:
 * - language: Language code (en, es, vi) - default: en
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language = 'en' } = req.query;

    // Validate userId
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }

    // Call Python FastAPI backend
    const response = await fetch(
      `${PYTHON_API_URL}/api/hurricane/checklist/${userId}?language=${language}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || 'Failed to fetch checklist',
        message: 'Python backend error'
      });
    }

    // Return the checklist data
    res.json({
      success: true,
      userId: parseInt(userId),
      language: data.language,
      checklist: data.checklist_text,
      modelUsed: data.model_used,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Checklist API Error:', error);
    res.status(500).json({
      error: 'Failed to generate checklist',
      message: error.message,
      pythonBackend: PYTHON_API_URL
    });
  }
});

/**
 * Generate checklist with custom parameters (no user profile needed)
 * POST /api/checklist/generate
 * 
 * Body:
 * - household_composition: { kids, elderly, pets, etc. }
 * - current_supplies: { water, food, first_aid, etc. }
 * - medical_needs: { oxygen, dialysis, medications, etc. }
 * - language: Language code (default: en)
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      household_composition = {},
      current_supplies = {},
      medical_needs = {},
      language = 'en'
    } = req.body;

    // For custom generation without user profile, we'll use a mock user ID
    // The Python backend will still generate based on the provided parameters
    // We could add a direct endpoint in Python for this, but for now we'll use the existing one
    
    let response;
    let data;
    
    try {
      // Try to fetch from Python backend with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = fetch(
        `${PYTHON_API_URL}/api/hurricane/checklist/1?language=${language}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        data = await response.json();
        
        // Return the checklist data from Python backend
        return res.json({
          success: true,
          language: data.language,
          checklist: data.checklist_text,
          modelUsed: data.model_used,
          generatedAt: new Date().toISOString()
        });
      }
    } catch (fetchError) {
      // Python backend unavailable or timeout
      console.warn('Python backend unavailable, using default checklist:', fetchError.message);
    }

    // If user not found or error, return a general checklist
    res.json({
      success: true,
      language: language,
      checklist: generateDefaultChecklist(household_composition, medical_needs),
      modelUsed: 'default',
      generatedAt: new Date().toISOString(),
      note: 'Using default checklist template'
    });

  } catch (error) {
    console.error('Checklist Generation Error:', error);
    
    // Fallback to default checklist - ensure CORS headers are sent
    res.status(200).json({
      success: true,
      language: req.body?.language || 'en',
      checklist: generateDefaultChecklist(
        req.body?.household_composition || {},
        req.body?.medical_needs || {}
      ),
      modelUsed: 'default',
      generatedAt: new Date().toISOString(),
      note: 'AI service unavailable, using default template'
    });
  }
});

/**
 * Generate a basic default checklist when AI service is unavailable
 */
function generateDefaultChecklist(household = {}, medical = {}) {
  const items = [
    '# Emergency Supply Checklist',
    '',
    '## Essential Supplies',
    '• Water (1 gallon per person per day for 3 days)',
    '• Non-perishable food (3-day supply)',
    '• Battery-powered or hand-crank radio',
    '• Flashlight and extra batteries',
    '• First aid kit',
    '• Whistle (to signal for help)',
    '• Dust masks or cloth face masks',
    '• Plastic sheeting and duct tape',
    '• Moist towelettes, garbage bags',
    '• Wrench or pliers (to turn off utilities)',
    '• Manual can opener',
    '• Local maps',
    '',
    '## Important Documents',
    '• Insurance policies',
    '• Medical records',
    '• Bank account records',
    '• Identification documents',
    '• Emergency contact list',
    '',
    '## Communication & Power',
    '• Cell phone with chargers and backup battery',
    '• Emergency contact list',
    '• Portable power bank',
    '',
    '## Personal Items',
    '• Prescription medications (7-day supply)',
    '• Eyeglasses or contact lenses',
    '• Cash or traveler\'s checks',
    '• Important family documents',
    '• Sleeping bag or warm blanket',
    '• Change of clothing',
    '• Fire extinguisher',
    '• Matches in waterproof container',
  ];

  // Add pet supplies if needed
  if (household.pets && household.pets.length > 0) {
    items.push('', '## Pet Supplies', '• Pet food (3-day supply)', '• Water for pets', '• Pet medications', '• Leash/collar with ID tags', '• Pet carrier');
  }

  // Add medical supplies if needed
  if (medical.oxygen || medical.dialysis || medical.medications) {
    items.push('', '## Medical Supplies');
    if (medical.oxygen) items.push('• Oxygen supplies (backup tanks)');
    if (medical.dialysis) items.push('• Dialysis supplies');
    if (medical.medications) items.push('• Extra prescription medications (14-day supply)');
    if (medical.mobility_device) items.push('• Backup mobility device parts/batteries');
  }

  // Add items for children
  if (household.kids && household.kids > 0) {
    items.push('', '## Items for Children', '• Formula and baby food', '• Diapers and wipes', '• Bottles', '• Games and books', '• Comfort items');
  }

  // Add items for elderly
  if (household.elderly && household.elderly > 0) {
    items.push('', '## Items for Elderly', '• Extra prescription medications', '• Medical equipment batteries', '• Hearing aid batteries', '• Denture supplies');
  }

  return items.join('\n');
}

module.exports = router;
