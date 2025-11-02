require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const urlencoded = bodyParser.urlencoded({ extended: false });

// Database handlers
const db = require('./db');
const { analyzeEmergency, createBlandAIScript } = require('./conversation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(urlencoded);
app.use(express.static('public'));

// In-memory store for active calls (in production, use Redis or proper cache)
const activeCalls = new Map();
// Store call transcripts for real-time updates
const callTranscripts = new Map(); // callId -> { messages: [], status: 'active' }

// Initialize BLAND AI configuration (uses environment variables)
const blandAIApiKey = process.env.BLAND_AI_API_KEY;
const blandAIVoiceId = process.env.BLAND_AI_VOICE_ID || 'e1289219-0ea2-4f22-a994-c542c2a48a0f';
const defaultTargetNumber = process.env.TARGET_PHONE_NUMBER || '+13614259843';

// Base URL for webhook callbacks (needs to be publicly accessible for production)
// BLAND AI requires webhooks to use HTTPS
let baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

// Validate that webhook URL starts with https:// (required by BLAND AI)
if (baseUrl && !baseUrl.startsWith('https://')) {
  console.error(`⚠️  ERROR: BASE_URL must start with https:// for webhooks to work.`);
  console.error(`   Current BASE_URL: ${baseUrl}`);
  console.error(`   Please set BASE_URL to an HTTPS URL (e.g., use ngrok or deploy to a cloud platform)`);
  console.error(`   See WEBHOOK_SETUP.md for setup instructions`);
}

if (!blandAIApiKey) {
  console.log('BLAND AI API key not found. Please set BLAND_AI_API_KEY in .env file');
} else {
  console.log('BLAND AI configured');
}

// Initialize database on startup
let dbInitialized = false;
db.initDatabase()
  .then((database) => {
    dbInitialized = true;
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    console.log('Server will continue, but database features will be unavailable');
  });

// API endpoint to get user details
app.get('/api/user/:userId', async (req, res) => {
  try {
    if (dbInitialized) {
      const user = await db.getUserById(req.params.userId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(503).json({ error: 'Database not initialized' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// API endpoint to make outbound call
app.post('/api/make-call', async (req, res) => {
  const { userId, transcribedMessage, phoneNumber } = req.body;

  try {
    // Validate required parameters
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        details: 'userId is required'
      });
    }

    if (!transcribedMessage) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        details: 'transcribedMessage is required'
      });
    }

    // Load user data from database
    if (!dbInitialized) {
      return res.status(503).json({ error: 'Database not initialized' });
    }

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found', details: `User with ID '${userId}' does not exist in the database` });
    }

    // Make the call using BLAND AI
    if (!blandAIApiKey) {
      return res.status(500).json({ 
        error: 'BLAND AI not configured. Please set BLAND_AI_API_KEY in .env file.' 
      });
    }

    const targetNumber = phoneNumber || defaultTargetNumber;

    // Analyze emergency type from transcribed message
    const emergencyType = analyzeEmergency(transcribedMessage || '');

    // Store call context for conversation handling
    const callContext = {
      userId,
      userData: user,
      emergencyType,
      transcribedMessage: transcribedMessage || '',
      step: 'initial'
    };

    console.log('Creating emergency call with BLAND AI...');
    console.log('User data from DB:', JSON.stringify(user, null, 2));
    
    // Create the interactive script for BLAND AI
    const script = createBlandAIScript(user, emergencyType, transcribedMessage || '');
    
    // Validate webhook URL before making API call
    const webhookUrl = `${baseUrl}/api/bland-webhook`;
    if (!webhookUrl.startsWith('https://')) {
      return res.status(400).json({ 
        error: 'Invalid webhook URL',
        details: 'webhook must be a string that starts with https://',
        message: `BASE_URL must start with https:// for BLAND AI webhooks. Current value: ${baseUrl}. Please set BASE_URL to an HTTPS URL (e.g., use ngrok for local testing or deploy to a cloud platform). See WEBHOOK_SETUP.md for instructions.`
      });
    }

    // Prepare BLAND AI API request
    const headers = {
      'Authorization': blandAIApiKey,
      'Content-Type': 'application/json'
    };

    const data = {
      "phone_number": targetNumber,
      "voice": blandAIVoiceId,
      "wait_for_greeting": false,
      "record": true,
      "answered_by_enabled": true,
      "noise_cancellation": false,
      "interruption_threshold": 500,
      "block_interruptions": false,
      "max_duration": 600, // 10 minutes for interactive conversation
      "model": "base",
      "language": "en",
      "background_track": "none",
      "voicemail_action": "hangup",
      "task": script,  // BLAND AI uses "task" parameter for the conversation script
      "webhook": webhookUrl,
      "metadata": {
        userId: userId,
        emergencyType: emergencyType
      }
    };
    
    try {
      console.log('Calling BLAND AI API...');
      const response = await axios.post('https://api.bland.ai/v1/calls', data, { headers });
      
      const callId = response.data.call_id || response.data.id;
      
      // Store call context using call ID
      if (callId) {
        activeCalls.set(callId, callContext);
        // Initialize transcript storage for this call
        callTranscripts.set(callId, {
          messages: [],
          status: 'active',
          callId: callId
        });
      }
      
      console.log('Call created successfully. Call ID:', callId);
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      
      res.json({
        success: true,
        callId: callId,
        message: 'Call initiated successfully',
        targetNumber: targetNumber,
        emergencyType: emergencyType,
        transcriptUrl: `/api/call-transcript/${callId}` // SSE endpoint for this call
      });
    } catch (callError) {
      console.error('Detailed call error:', callError.response?.data || callError.message);
      console.error('Error status:', callError.response?.status);
      throw callError;
    }

  } catch (error) {
    console.error('Error making call:', error);
    
    // Provide helpful error messages for common issues
    let errorMessage = 'Failed to make call';
    let userFriendlyMessage = error.message;
    
    if (error.response?.status === 400) {
      userFriendlyMessage = error.response?.data?.message || error.response?.data?.error || 'Invalid request. Please check the phone number format (E.164 format required, e.g., +13614259843)';
    } else if (error.response?.status === 401) {
      userFriendlyMessage = 'Invalid API key. Please check your BLAND_AI_API_KEY in .env file';
    } else if (error.response?.status === 429) {
      userFriendlyMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.response?.data) {
      userFriendlyMessage = error.response.data.message || error.response.data.error || error.message;
    }
    
    res.status(error.response?.status || 500).json({ 
      error: errorMessage,
      details: userFriendlyMessage,
      code: error.response?.status || error.code
    });
  }
});

// BLAND AI webhook endpoint for interactive call handling
app.post('/api/bland-webhook', (req, res) => {
  console.log('BLAND AI webhook received:', JSON.stringify(req.body, null, 2));
  
  const callId = req.body.call_id || req.body.callId;
  const status = req.body.status || req.body.event;
  const transcript = req.body.transcript;
  const userMessage = req.body.user_message || req.body.message;
  const aiMessage = req.body.ai_message || req.body.agent_message;
  
  // Get call context if available
  const callContext = callId ? activeCalls.get(callId) : null;
  
  // Update transcript storage
  if (callId && callTranscripts.has(callId)) {
    const transcriptData = callTranscripts.get(callId);
    
    // Add new messages to transcript
    if (transcript) {
      transcriptData.messages.push({
        type: 'transcript',
        content: transcript,
        timestamp: new Date().toISOString()
      });
      console.log('Call transcript updated:', transcript);
    }
    
    if (userMessage) {
      transcriptData.messages.push({
        type: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
      console.log('User message during call:', userMessage);
    }
    
    if (aiMessage) {
      transcriptData.messages.push({
        type: 'ai',
        content: aiMessage,
        timestamp: new Date().toISOString()
      });
      console.log('AI message during call:', aiMessage);
    }
    
    // Update status
    if (status) {
      transcriptData.status = status;
      transcriptData.lastUpdate = new Date().toISOString();
    }
    
    callTranscripts.set(callId, transcriptData);
  }
  
  if (callContext) {
    console.log('Call context found for:', callId);
    console.log('Call status:', status);
  }
  
  // Clean up stored call context when call ends
  if (status === 'ended' || status === 'completed' || status === 'failed') {
    if (callId && activeCalls.has(callId)) {
      activeCalls.delete(callId);
      console.log(`Cleaned up call context for ${callId}`);
    }
    if (callId && callTranscripts.has(callId)) {
      const transcriptData = callTranscripts.get(callId);
      transcriptData.status = status;
      transcriptData.endedAt = new Date().toISOString();
      callTranscripts.set(callId, transcriptData);
    }
  }
  
  res.status(200).json({ received: true });
});

// Server-Sent Events endpoint for live call transcript
app.get('/api/call-transcript/:callId', (req, res) => {
  const callId = req.params.callId;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  console.log(`SSE connection opened for call: ${callId}`);
  
  // Send initial transcript if available
  if (callTranscripts.has(callId)) {
    const transcriptData = callTranscripts.get(callId);
    res.write(`data: ${JSON.stringify(transcriptData)}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({ messages: [], status: 'waiting', callId: callId })}\n\n`);
  }
  
  // Set up polling to send updates every 1 second
  const interval = setInterval(() => {
    if (callTranscripts.has(callId)) {
      const transcriptData = callTranscripts.get(callId);
      res.write(`data: ${JSON.stringify(transcriptData)}\n\n`);
      
      // Close connection if call ended
      if (transcriptData.status === 'ended' || transcriptData.status === 'completed' || transcriptData.status === 'failed') {
        clearInterval(interval);
        res.end();
        console.log(`SSE connection closed for call: ${callId}`);
      }
    }
  }, 1000);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    console.log(`SSE connection closed by client for call: ${callId}`);
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`SOS Call System server running on http://localhost:${PORT}`);
  console.log('Using BLAND AI for interactive emergency calls');
  console.log('Make sure to set BLAND_AI_API_KEY in .env file');
  if (baseUrl.includes('localhost')) {
    console.log('⚠️  Note: For production, set BASE_URL in .env to your public URL for webhooks');
  }
});

