const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./config/database');
const planRoutes = require('./routes/plans');
const mapsRoutes = require('./routes/maps');
const checklistRoutes = require('./routes/checklist');
const notificationRoutes = require('./routes/notifications');
const weatherRoutes = require('./routes/weather');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware - ORDER MATTERS!
// CORS must be first to handle preflight requests
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  // Log CORS headers for debugging
  if (req.method === 'OPTIONS') {
    console.log('  OPTIONS preflight request received');
  }
  next();
});

// Routes
app.use('/api/plans', planRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'bAI Watch API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      plans: '/api/plans',
      maps: {
        shelters: '/api/maps/shelters/:zipCode',
        route: '/api/maps/route',
        evacuationRoute: '/api/maps/evacuation-route',
        geocode: '/api/maps/geocode',
        distanceMatrix: '/api/maps/distance-matrix'
      },
      checklist: {
        userChecklist: '/api/checklist/:userId',
        generateCustom: '/api/checklist/generate'
      },
      notifications: {
        hazardAlert: '/api/notifications/hazard-alert',
        checklistReminder: '/api/notifications/checklist-reminder',
        testEmail: '/api/notifications/test-email',
        testPush: '/api/notifications/test-push',
        subscribe: '/api/notifications/subscribe',
        configStatus: '/api/notifications/config-status',
        vapidPublicKey: '/api/notifications/vapid-public-key'
      },
      weather: {
        analyze: '/api/weather/analyze',
        current: '/api/weather/current',
        forecast: '/api/weather/forecast',
        alerts: '/api/weather/alerts',
        monitor: '/api/weather/monitor'
      },
      chat: {
        message: '/api/chat',
        stream: '/api/chat/stream'
      }
    }
  });
});

// 404 handler - must preserve CORS headers
app.use((req, res) => {
  // Ensure CORS headers are sent even for 404
  const origin = req.headers.origin;
  const allowedOrigins = corsOptions.origin;
  
  if (origin && (Array.isArray(allowedOrigins) ? allowedOrigins.includes(origin) : allowedOrigins === origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  }
  
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware - must preserve CORS headers
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Ensure CORS headers are still sent even on errors
  const origin = req.headers.origin;
  const allowedOrigins = corsOptions.origin;
  
  if (origin && (Array.isArray(allowedOrigins) ? allowedOrigins.includes(origin) : allowedOrigins === origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync models (create tables if they don't exist)
    // Use { alter: true } in development to update existing tables
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synced');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`💾 Database: SQLite`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

startServer();
