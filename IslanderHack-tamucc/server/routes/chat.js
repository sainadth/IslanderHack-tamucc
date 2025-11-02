const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/chat
 * Chat endpoint with streaming support
 */
router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      details: 'Please set OPENAI_API_KEY in server .env file'
    });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request',
      details: 'messages array is required'
    });
  }

  try {
    // Format messages for OpenAI (remove timestamp and other custom fields)
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system prompt for emergency assistant context
    const systemMessage = {
      role: 'system',
      content: `You are an AI Emergency Preparedness Assistant. You help users with:
- Emergency preparedness tips and guidance
- Weather hazard information and safety protocols
- Evacuation planning and route suggestions
- Supply checklist recommendations
- Real-time safety alerts and emergency procedures
- Natural disaster preparedness (hurricanes, floods, tornadoes, wildfires, earthquakes)

Be concise, helpful, and prioritize life safety. Use emojis sparingly for visual impact. Provide actionable, practical advice.`
    };

    // Use gpt-5-nano
    const model = 'gpt-5-nano';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [systemMessage, ...formattedMessages],
      temperature: 0.7,
      max_tokens: 500,
      stream: false // Set to true for streaming, but requires different response handling
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      message: aiResponse,
      model: model
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    let errorMessage = 'Failed to get AI response';
    if (error.response?.status === 401) {
      errorMessage = 'Invalid OpenAI API key';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(error.response?.status || 500).json({
      error: errorMessage,
      details: error.response?.data?.error?.message || 'Please check your OpenAI API key and try again'
    });
  }
});

/**
 * POST /api/chat/stream
 * Streaming chat endpoint
 */
router.post('/stream', async (req, res) => {
  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured'
    });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request',
      details: 'messages array is required'
    });
  }

  try {
    // Format messages for OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const systemMessage = {
      role: 'system',
      content: `You are an AI Emergency Preparedness Assistant. You help users with emergency preparedness, weather hazards, evacuation planning, supply checklists, and safety alerts. Be concise, helpful, and prioritize life safety.`
    };

    // Set up Server-Sent Events for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Use gpt-5-nano
    const model = 'gpt-5-nano';

    const stream = await openai.chat.completions.create({
      model: model,
      messages: [systemMessage, ...formattedMessages],
      temperature: 0.7,
      max_tokens: 500,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('OpenAI Streaming Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
});

module.exports = router;

