/**
 * SOS Emergency Call Service
 * Integrates with SOS-Speech-JS backend for emergency voice calls
 */

const SOS_API_BASE_URL = process.env.REACT_APP_SOS_API_URL || 'http://localhost:3000'

/**
 * Make an emergency call with transcribed message
 * @param {string} userId - User identifier
 * @param {string} transcribedMessage - Emergency message from speech-to-text
 * @param {string} phoneNumber - Optional target phone number (E.164 format)
 * @returns {Promise<Object>} Call result with callId and emergency type
 */
export async function makeEmergencyCall(userId, transcribedMessage, phoneNumber = null) {
  try {
    const response = await fetch(`${SOS_API_BASE_URL}/api/make-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        transcribedMessage,
        phoneNumber
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Failed to make emergency call')
    }

    return data
  } catch (error) {
    console.error('SOS Service Error:', error)
    throw error
  }
}

/**
 * Get user details from SOS database
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} User data including name, age, location, emergency contact
 */
export async function getUserDetails(userId) {
  try {
    const response = await fetch(`${SOS_API_BASE_URL}/api/user/${userId}`)
    
    if (!response.ok) {
      throw new Error('User not found')
    }

    const userData = await response.json()
    return userData
  } catch (error) {
    console.error('Get User Error:', error)
    throw error
  }
}

/**
 * Create or update user in SOS database
 * @param {Object} userData - User information
 * @returns {Promise<Object>} Created/updated user data
 */
export async function createOrUpdateUser(userData) {
  try {
    // This endpoint would need to be added to SOS-Speech-JS backend
    const response = await fetch(`${SOS_API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create/update user')
    }

    return data
  } catch (error) {
    console.error('Create/Update User Error:', error)
    throw error
  }
}

/**
 * Analyze emergency message to determine type
 * @param {string} message - Emergency message text
 * @returns {string} Emergency type: 'fire', 'medical', 'police', 'accident', or 'general'
 */
export function analyzeEmergencyType(message) {
  const msg = message.toLowerCase()
  
  const fireKeywords = ['fire', 'burning', 'smoke', 'flames', 'blaze', 'burn']
  const medicalKeywords = ['heart', 'chest', 'pain', 'hurt', 'injured', 'bleeding', 'unconscious', 'cannot breathe', 'ambulance', 'medical', 'doctor', 'hospital', 'sick', 'fell', 'broken']
  const policeKeywords = ['attack', 'robbery', 'theft', 'intruder', 'threat', 'danger', 'weapon', 'police', 'crime', 'assault', 'break in']
  const accidentKeywords = ['accident', 'crash', 'collision', 'car', 'vehicle', 'wreck', 'hit']
  
  const fireScore = fireKeywords.filter(kw => msg.includes(kw)).length
  const medicalScore = medicalKeywords.filter(kw => msg.includes(kw)).length
  const policeScore = policeKeywords.filter(kw => msg.includes(kw)).length
  const accidentScore = accidentKeywords.filter(kw => msg.includes(kw)).length
  
  if (fireScore > 0 && fireScore >= medicalScore && fireScore >= policeScore) {
    return 'fire'
  } else if (medicalScore > 0 && medicalScore >= policeScore && medicalScore >= accidentScore) {
    return 'medical'
  } else if (policeScore > 0 && policeScore >= accidentScore) {
    return 'police'
  } else if (accidentScore > 0) {
    return 'accident'
  }
  
  return 'medical' // Default
}

export const sosService = {
  makeEmergencyCall,
  getUserDetails,
  createOrUpdateUser,
  analyzeEmergencyType
}

export default sosService
