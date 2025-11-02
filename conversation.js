// Conversation handler for interactive emergency calls

// Analyze transcribed message to determine emergency type
function analyzeEmergency(transcribedMessage) {
  const message = transcribedMessage.toLowerCase();
  
  // Keywords for different emergency types
  const fireKeywords = ['fire', 'burning', 'smoke', 'flames', 'blaze', 'burn'];
  const medicalKeywords = ['heart', 'chest', 'pain', 'hurt', 'injured', 'bleeding', 'unconscious', 'cannot breathe', 'ambulance', 'medical', 'doctor', 'hospital'];
  const policeKeywords = ['attack', 'robbery', 'theft', 'intruder', 'threat', 'danger', 'weapon', 'police', 'crime'];
  const accidentKeywords = ['accident', 'crash', 'collision', 'car', 'vehicle', 'wreck'];
  
  // Count matches
  let fireScore = fireKeywords.filter(kw => message.includes(kw)).length;
  let medicalScore = medicalKeywords.filter(kw => message.includes(kw)).length;
  let policeScore = policeKeywords.filter(kw => message.includes(kw)).length;
  let accidentScore = accidentKeywords.filter(kw => message.includes(kw)).length;
  
  // Determine emergency type
  if (fireScore > 0 && fireScore >= medicalScore && fireScore >= policeScore) {
    return 'fire';
  } else if (medicalScore > 0 && medicalScore >= policeScore && medicalScore >= accidentScore) {
    return 'medical';
  } else if (policeScore > 0 && policeScore >= accidentScore) {
    return 'police';
  } else if (accidentScore > 0) {
    return 'accident'; // Usually needs fire and medical
  }
  
  // Default to medical if unclear
  return 'medical';
}

// Generate response based on 911 operator's question
function generateResponse(question, userData, emergencyType, transcribedMessage) {
  const q = question.toLowerCase();
  
  // Handle service type question
  if (q.includes('what service') || q.includes('what kind') || q.includes('what type') || q.includes('need')) {
    switch (emergencyType) {
      case 'fire':
        return `I need the fire department. ${transcribedMessage || 'There is a fire emergency.'}`;
      case 'medical':
        return `I need an ambulance. ${transcribedMessage || 'There is a medical emergency.'}`;
      case 'police':
        return `I need the police. ${transcribedMessage || 'There is a security emergency.'}`;
      case 'accident':
        return `I need both fire and medical services. There has been an accident. ${transcribedMessage || ''}`;
      default:
        return `I need emergency assistance. ${transcribedMessage || 'Please send help immediately.'}`;
    }
  }
  
  // Handle location question
  if (q.includes('location') || q.includes('where') || q.includes('address')) {
    return `The location is ${userData.location || 'unknown location'}. Please send help immediately.`;
  }
  
  // Handle name question
  if (q.includes('name') || q.includes('who')) {
    return `This is ${userData.name || 'an emergency alert'}. I need help.`;
  }
  
  // Handle contact question
  if (q.includes('contact') || q.includes('phone') || q.includes('number')) {
    return `The emergency contact is ${userData.emergencyContact || 'not available'}. Please send help to ${userData.location || 'the location provided'}.`;
  }
  
  // Handle medical info question
  if (q.includes('medical') || q.includes('condition') || q.includes('health')) {
    if (userData.medicalInfo && userData.medicalInfo !== 'None provided') {
      return `Medical information: ${userData.medicalInfo}. ${transcribedMessage || 'Please send medical assistance.'}`;
    }
    return transcribedMessage || 'Please send medical assistance immediately.';
  }
  
  // Handle status/update question
  if (q.includes('status') || q.includes('update') || q.includes('still') || q.includes('okay') || q.includes('ok')) {
    return `The situation is still active. Please send help immediately to ${userData.location || 'the location'}. ${transcribedMessage || ''}`;
  }
  
  // Default response
  return transcribedMessage || `This is an emergency alert for ${userData.name || 'a person in need'}. Please send help to ${userData.location || 'the location provided'}.`;
}

// Create interactive TwiML response (DEPRECATED - no longer used with BLAND AI)
// Kept for reference only. This function requires Twilio SDK which has been removed.
function createConversationTwiML(step, userData, emergencyType, transcribedMessage, userInput = '', inlineMode = false) {
  throw new Error('createConversationTwiML is deprecated. This system now uses BLAND AI for calls.');
  // const twiml = new twilio.twiml.VoiceResponse();
  const userId = userData.user_id || '';
  
  // Step 1: Initial emergency message
  if (step === 'initial') {
    // Sanitize inputs to prevent TwiML errors
    const sanitize = (text) => {
      if (!text) return '';
      return String(text).replace(/[<>]/g, '').substring(0, 500); // Remove potential XML chars and limit length
    };
    
    const name = sanitize(userData.name || 'a person in need');
    const age = sanitize(userData.age || 'unknown');
    const sex = sanitize(userData.sex || 'unknown');
    const location = sanitize(userData.location || 'location unknown');
    const contact = sanitize(userData.emergencyContact || 'not provided');
    const medicalInfo = userData.medicalInfo && userData.medicalInfo !== 'None provided' 
      ? `Medical information: ${sanitize(userData.medicalInfo)}.` 
      : '';
    const message = transcribedMessage 
      ? `Message from the person: ${sanitize(transcribedMessage)}` 
      : 'Emergency assistance is needed.';
    
    const emergencyGreeting = `Hello, this is an automated emergency alert system calling on behalf of ${name}. Age: ${age}, Sex: ${sex}. Location: ${location}. Emergency contact: ${contact}. ${medicalInfo} ${message}`.trim();
    
    twiml.say({
      voice: 'alice',
      language: 'en-US',
      rate: 'medium'
    }, emergencyGreeting);
    
    // Based on emergency type, suggest service needed
    let serviceNeeded = '';
    switch (emergencyType) {
      case 'fire':
        serviceNeeded = 'Fire department services are needed.';
        break;
      case 'medical':
        serviceNeeded = 'Ambulance and medical services are needed.';
        break;
      case 'police':
        serviceNeeded = 'Police services are needed.';
        break;
      case 'accident':
        serviceNeeded = 'Fire and medical services are needed for an accident.';
        break;
      default:
        serviceNeeded = 'Emergency services are needed.';
    }
    
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, serviceNeeded);
    
    // In inline mode, don't use Gather (no webhook available)
    if (inlineMode) {
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, 'This is an automated emergency alert. Help is being dispatched. Goodbye.');
      twiml.hangup();
    } else {
      // Gather input from operator (can ask questions) - only if webhook URL available
      const gather = twiml.gather({
        input: 'speech dtmf',
        language: 'en-US',
        speechTimeout: 'auto',
        action: `/api/twiml-conversation?step=response&userId=${encodeURIComponent(userData.user_id || '')}&emergencyType=${emergencyType}&transcribedMessage=${encodeURIComponent(transcribedMessage)}`,
        method: 'POST',
        numDigits: 1,
        timeout: 10
      });
      
      gather.say({
        voice: 'alice',
        language: 'en-US'
      }, 'Please press any key or speak if you need more information.');
      
      // If no input, end call
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, 'Thank you. Help is being dispatched.');
      
      twiml.hangup();
    }
  }
  
  // Step 2: Response to operator's question
  else if (step === 'response') {
    const response = generateResponse(userInput, userData, emergencyType, transcribedMessage);
    
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, response);
    
    // Ask if operator needs more info
    const gather = twiml.gather({
      input: 'speech dtmf',
      language: 'en-US',
      speechTimeout: 'auto',
      action: `/api/twiml-conversation?step=response&userId=${encodeURIComponent(userData.user_id || '')}&emergencyType=${emergencyType}&transcribedMessage=${encodeURIComponent(transcribedMessage)}`,
      method: 'POST',
      numDigits: 1,
      timeout: 10
    });
    
    gather.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Do you need any additional information? Press 1 or say yes to continue, or press 9 to end the call.');
    
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Thank you. Help is being dispatched. Goodbye.');
    
    twiml.hangup();
  }
  
  // Step 3: Final confirmation
  else if (step === 'final') {
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Thank you for your assistance. Emergency services have been notified. Goodbye.');
    
    twiml.hangup();
  }
  
  return twiml;
}

// Create BLAND AI script for interactive emergency calls
function createBlandAIScript(userData, emergencyType, transcribedMessage) {
  // Helper function to format phone numbers
  const formatPhoneNumberDigits = (phone) => {
    if (!phone || phone === 'not provided' || phone === 'Not provided') {
      return 'not provided';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 0) {
      return phone;
    }
    const digitWords = digits.split('').map(digit => {
      const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return words[parseInt(digit)] || digit;
    }).join(' ');
    return digitWords;
  };
  
  // Build user information
  const name = (userData.name || 'a person in need').toString();
  const age = (userData.age || 'unknown').toString();
  const sex = (userData.sex || 'unknown').toString();
  const location = (userData.location || 'location unknown').toString();
  const contactRaw = (userData.emergencyContact || 'not provided').toString();
  const contact = formatPhoneNumberDigits(contactRaw);
  const medical = userData.medicalInfo && userData.medicalInfo !== 'None provided' 
    ? (userData.medicalInfo.toString()) 
    : '';
  const msg = transcribedMessage ? transcribedMessage.toString() : 'Emergency assistance is needed';
  
  // Determine service needed
  let serviceType = '';
  switch (emergencyType) {
    case 'fire':
      serviceType = 'Fire department services';
      break;
    case 'medical':
      serviceType = 'Ambulance and medical services';
      break;
    case 'police':
      serviceType = 'Police services';
      break;
    case 'accident':
      serviceType = 'Fire and medical services for an accident';
      break;
    default:
      serviceType = 'Emergency services';
  }
  
  // Create the interactive script for BLAND AI
  const script = `You are calling as an automated emergency alert system. This is an emergency call.

Start by saying: "Hello, this is an automated emergency alert system calling on behalf of ${name}. This is an urgent emergency situation."

Then provide the following information clearly:
- The person's name is ${name}
- Age: ${age}
- Sex: ${sex}
- Location: ${location}
- Emergency contact number: ${contact}
${medical ? `- Medical information: ${medical}` : ''}
- Message from the person: ${msg}
- ${serviceType} are needed.

After providing this information, engage in a natural conversation with the emergency operator. Be ready to answer questions such as:

1. If they ask about the location, repeat: "${location}"
2. If they ask about the emergency contact, say: "${contact}"
3. If they ask about the person's condition, refer to: "${msg}${medical ? ' Additional medical information: ' + medical : ''}"
4. If they ask what service is needed, say: "${serviceType}"
5. If they ask for clarification or more details, provide relevant information from what you know

Be polite, clear, and concise. Speak at a moderate pace. If the operator confirms they understand and will send help, thank them and end the call professionally. If they need more information, answer their questions based on the information provided. Always emphasize the urgency of the situation.`;
  
  return script;
}

module.exports = {
  analyzeEmergency,
  generateResponse,
  createConversationTwiML,
  createBlandAIScript
};

