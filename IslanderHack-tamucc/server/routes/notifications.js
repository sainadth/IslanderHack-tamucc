const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');

const notificationService = new NotificationService();

/**
 * POST /api/notifications/hazard-alert
 * Send AI-customized hazard alert (email + push)
 * 
 * Body:
 * {
 *   "hazardData": {
 *     "type": "hurricane",
 *     "name": "Hurricane Milton",
 *     "severity": "Category 4",
 *     "category": 4,
 *     "wind_speed": 150,
 *     "distance_miles": 50,
 *     "description": "Extremely dangerous hurricane..."
 *   },
 *   "userProfile": {
 *     "userId": "user123",
 *     "userEmail": "user@example.com",
 *     "address": "123 Main St, Miami, FL",
 *     "zip_code": "33101",
 *     "adults": 2,
 *     "kids": 1,
 *     "elderly": 0,
 *     "pets": 1,
 *     "hasMedicalNeeds": false,
 *     "hasVehicle": true
 *   },
 *   "pushSubscriptions": [
 *     {
 *       "endpoint": "https://...",
 *       "keys": { "p256dh": "...", "auth": "..." }
 *     }
 *   ]
 * }
 */
router.post('/hazard-alert', async (req, res) => {
  try {
    const { hazardData, userProfile, pushSubscriptions = [] } = req.body;

    // Validate required fields
    if (!hazardData || !userProfile || !userProfile.userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: hazardData, userProfile with userEmail'
      });
    }

    console.log(`📧 Sending hazard alert: ${hazardData.type} to ${userProfile.userEmail}`);

    const result = await notificationService.sendHazardAlert(
      hazardData,
      userProfile,
      pushSubscriptions
    );

    res.json(result);

  } catch (error) {
    console.error('Error sending hazard alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/checklist-reminder
 * Send AI-generated checklist reminder
 * 
 * Body:
 * {
 *   "userProfile": { ... },
 *   "incompleteItems": ["Water supply", "First aid kit", ...],
 *   "pushSubscriptions": [ ... ]
 * }
 */
router.post('/checklist-reminder', async (req, res) => {
  try {
    const { userProfile, incompleteItems = [], pushSubscriptions = [] } = req.body;

    if (!userProfile || !userProfile.userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userProfile with userEmail'
      });
    }

    const result = await notificationService.sendChecklistReminder(
      userProfile,
      incompleteItems,
      pushSubscriptions
    );

    res.json(result);

  } catch (error) {
    console.error('Error sending checklist reminder:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/test-email
 * Test email configuration
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email, subject = 'Test Email', message = 'This is a test email.' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address required'
      });
    }

    const result = await notificationService.sendEmail(
      email,
      subject,
      `<h2>${subject}</h2><p>${message}</p>`
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/test-push
 * Test push notification
 */
router.post('/test-push', async (req, res) => {
  try {
    const { subscription, title = 'Test Push', body = 'This is a test notification' } = req.body;

    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'Push subscription required'
      });
    }

    const result = await notificationService.sendPushNotification(
      subscription,
      { title, body, icon: '/icon-192x192.png' }
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/subscribe
 * Store push notification subscription for a user
 * (In production, you'd save this to database)
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({
        success: false,
        error: 'userId and subscription required'
      });
    }

    // TODO: Save subscription to database associated with userId
    // For now, just acknowledge receipt
    console.log(`📱 Push subscription registered for user: ${userId}`);

    res.json({
      success: true,
      message: 'Push subscription registered',
      userId: userId
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notifications/config-status
 * Check notification service configuration and enabled channels
 */
router.get('/config-status', (req, res) => {
  const status = notificationService.isConfigured();
  
  // Determine overall readiness
  const readyChannels = [];
  if (status.ready.email) readyChannels.push('Email');
  if (status.ready.push) readyChannels.push('Push');
  if (status.ready.sms) readyChannels.push('SMS');
  
  const enabledChannels = [];
  if (status.enabled.email) enabledChannels.push('Email');
  if (status.enabled.push) enabledChannels.push('Push');
  if (status.enabled.sms) enabledChannels.push('SMS');

  let message = '';
  if (readyChannels.length === 0) {
    message = '⚠️ No notification channels are configured and enabled';
  } else if (enabledChannels.length > readyChannels.length) {
    message = `✅ ${readyChannels.join(', ')} ready. Some enabled channels need configuration.`;
  } else {
    message = `✅ ${readyChannels.join(', ')} ready to send alerts`;
  }

  res.json({
    ...status,
    ready: readyChannels.length > 0,
    readyChannels,
    enabledChannels,
    message
  });
});

/**
 * GET /api/notifications/vapid-public-key
 * Get public VAPID key for push notifications (client needs this)
 */
router.get('/vapid-public-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(503).json({
      success: false,
      error: 'VAPID keys not configured on server'
    });
  }

  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

module.exports = router;
