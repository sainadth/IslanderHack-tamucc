const nodemailer = require('nodemailer');
const webpush = require('web-push');
const OpenAI = require('openai');

/**
 * AI-Powered Notification Service
 * Uses OpenAI to customize messages based on hazard type and user context
 */
class NotificationService {
  constructor() {
    // Alert toggles from environment
    this.emailEnabled = process.env.ENABLE_EMAIL_ALERTS === 'true';
    this.pushEnabled = process.env.ENABLE_PUSH_ALERTS === 'true';
    this.smsEnabled = process.env.ENABLE_SMS_ALERTS === 'true';

    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Email transporter (Gmail)
    if (this.emailEnabled) {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD // Use App Password
        }
      });
    }

    // Web Push setup (generate keys: npx web-push generate-vapid-keys)
    if (this.pushEnabled && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        `mailto:${process.env.EMAIL_USER || 'emergency@example.com'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }

    // SMS setup (Twilio)
    if (this.smsEnabled && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      } catch (error) {
        console.warn('⚠️ Twilio not installed. Run: npm install twilio');
        this.smsEnabled = false;
      }
    }
  }

  /**
   * Generate AI-customized alert message based on hazard type and user context
   */
  async generateCustomAlert(hazardData, userProfile) {
    try {
      const prompt = `You are an emergency alert system. Generate a personalized, actionable emergency alert message.

HAZARD INFORMATION:
Type: ${hazardData.type} (e.g., hurricane, tornado, flood, wildfire)
Severity: ${hazardData.severity || 'Unknown'}
Name: ${hazardData.name || 'N/A'}
Distance: ${hazardData.distance_miles || 'Unknown'} miles away
Wind Speed: ${hazardData.wind_speed || 'N/A'}
Category: ${hazardData.category || 'N/A'}
Description: ${hazardData.description || ''}

USER CONTEXT:
Location: ${userProfile.address || userProfile.zip_code}
Household: ${userProfile.adults || 0} adults, ${userProfile.kids || 0} children, ${userProfile.elderly || 0} elderly, ${userProfile.pets || 0} pets
Medical Needs: ${userProfile.hasMedicalNeeds ? 'Yes' : 'No'}
Has Vehicle: ${userProfile.hasVehicle ? 'Yes' : 'No'}

INSTRUCTIONS:
Generate TWO versions:
1. SHORT (SMS): Max 160 characters. Urgent, direct, actionable. Include emoji for visual impact.
2. DETAILED (Email subject + body): Subject line (max 60 chars) + HTML email body with:
   - Clear urgency level
   - Specific actions for this user's situation (consider kids, elderly, pets, medical needs)
   - Evacuation guidance if needed
   - Safety instructions
   - What to bring based on their household
   
Format response as JSON:
{
  "sms": "160-char urgent message with emoji",
  "emailSubject": "Clear, urgent subject line",
  "emailBody": "HTML formatted email body with <h2>, <ul>, <strong>, etc.",
  "pushTitle": "Push notification title",
  "pushBody": "Push notification body (max 100 chars)",
  "urgencyLevel": "critical|high|moderate|low"
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert emergency management system that creates personalized, clear, and actionable alerts. Always prioritize life safety.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500
      });

      const alertContent = JSON.parse(completion.choices[0].message.content);
      console.log('✅ AI-generated custom alert:', alertContent);
      
      return alertContent;
    } catch (error) {
      console.error('Error generating AI alert:', error);
      
      // Fallback to basic template
      return this.generateFallbackAlert(hazardData, userProfile);
    }
  }

  /**
   * Fallback alert template (when AI is unavailable)
   */
  generateFallbackAlert(hazardData, userProfile) {
    const hazardName = hazardData.name || hazardData.type || 'Emergency';
    const distance = hazardData.distance_miles || 'nearby';
    
    const householdDetails = [];
    if (userProfile.kids > 0) householdDetails.push(`${userProfile.kids} children`);
    if (userProfile.elderly > 0) householdDetails.push(`${userProfile.elderly} elderly`);
    if (userProfile.pets > 0) householdDetails.push(`${userProfile.pets} pets`);
    
    return {
      sms: `🚨 ALERT: ${hazardName} ${distance} miles away. Evacuate immediately with ${householdDetails.join(', ') || 'family'}. Check email for details.`,
      emailSubject: `🚨 URGENT: ${hazardName} Evacuation Required`,
      emailBody: `
        <h2 style="color: #d32f2f;">🚨 EMERGENCY EVACUATION ALERT</h2>
        <p><strong>${hazardName}</strong> is ${distance} miles from your location at ${userProfile.address || userProfile.zip_code}.</p>
        <h3>Immediate Actions:</h3>
        <ul>
          <li>Evacuate NOW to a safe location</li>
          ${userProfile.kids > 0 ? '<li>Secure children and bring comfort items</li>' : ''}
          ${userProfile.elderly > 0 ? '<li>Assist elderly family members</li>' : ''}
          ${userProfile.pets > 0 ? '<li>Bring pets, carriers, and pet supplies</li>' : ''}
          ${userProfile.hasMedicalNeeds ? '<li>Pack all medications and medical equipment</li>' : ''}
          <li>Take emergency supplies and documents</li>
          <li>Follow evacuation routes</li>
        </ul>
        <p><strong>Stay safe and follow local emergency instructions.</strong></p>
      `,
      pushTitle: `🚨 ${hazardName} Alert`,
      pushBody: `Evacuate immediately. ${distance} miles away.`,
      urgencyLevel: 'critical'
    };
  }

  /**
   * Send email with AI-generated content
   */
  async sendEmail(to, subject, htmlContent) {
    if (!this.emailEnabled) {
      console.log('📧 Email alerts disabled in settings');
      return { success: false, error: 'Email alerts disabled', disabled: true };
    }

    try {
      const mailOptions = {
        from: `Emergency Alert System <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        priority: 'high'
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('📧 Email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS with AI-generated content (Twilio)
   */
  async sendSMS(phoneNumber, message) {
    if (!this.smsEnabled) {
      console.log('📱 SMS alerts disabled in settings');
      return { success: false, error: 'SMS alerts disabled', disabled: true };
    }

    if (!this.twilioClient) {
      console.warn('⚠️ Twilio not configured');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhone,
        to: phoneNumber // Format: +1234567890
      });

      console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('📱 SMS error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send web push notification
   */
  async sendPushNotification(subscription, payload) {
    if (!this.pushEnabled) {
      console.log('🔔 Push alerts disabled in settings');
      return { success: false, error: 'Push alerts disabled', disabled: true };
    }

    try {
      if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn('⚠️ VAPID keys not configured, skipping push notification');
        return { success: false, error: 'VAPID keys not configured' };
      }

      await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );
      
      console.log('✅ Push notification sent');
      return { success: true };
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send complete hazard alert (Email + SMS + Push)
   */
  async sendHazardAlert(hazardData, userProfile, pushSubscriptions = []) {
    console.log(`📢 Sending hazard alert for ${hazardData.type} to ${userProfile.userEmail}`);

    try {
      // Generate AI-customized messages
      const alertContent = await this.generateCustomAlert(hazardData, userProfile);

      const results = {};

      // Send email if enabled
      if (this.emailEnabled) {
        results.email = await this.sendEmail(
          userProfile.userEmail,
          alertContent.emailSubject,
          alertContent.emailBody
        );
      } else {
        results.email = { success: false, disabled: true };
      }

      // Send SMS if enabled and phone number provided
      if (this.smsEnabled && userProfile.phoneNumber) {
        results.sms = await this.sendSMS(
          userProfile.phoneNumber,
          alertContent.sms
        );
      } else if (this.smsEnabled && !userProfile.phoneNumber) {
        results.sms = { success: false, error: 'Phone number not provided' };
      } else {
        results.sms = { success: false, disabled: true };
      }

      // Send push notifications to all subscribed devices if enabled
      if (this.pushEnabled && pushSubscriptions.length > 0) {
        const pushResults = await Promise.allSettled(
          pushSubscriptions.map(subscription => 
            this.sendPushNotification(subscription, {
              title: alertContent.pushTitle,
              body: alertContent.pushBody,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              tag: `hazard-${hazardData.type}-${Date.now()}`,
              requireInteraction: alertContent.urgencyLevel === 'critical',
              urgency: alertContent.urgencyLevel === 'critical' ? 'high' : 'normal',
              actions: [
                { action: 'view-details', title: 'View Details' },
                { action: 'view-route', title: 'Evacuation Route' },
                { action: 'find-shelter', title: 'Find Shelter' }
              ],
              data: {
                url: '/evacuation',
                hazardType: hazardData.type,
                urgency: alertContent.urgencyLevel,
                timestamp: new Date().toISOString()
              }
            })
          )
        );
        results.push = pushResults.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason });
      } else {
        results.push = this.pushEnabled ? [] : [{ success: false, disabled: true }];
      }

      return {
        success: true,
        ...results,
        aiGenerated: true,
        alertContent: alertContent,
        enabledChannels: {
          email: this.emailEnabled,
          sms: this.smsEnabled,
          push: this.pushEnabled
        }
      };

    } catch (error) {
      console.error('Error sending hazard alert:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send checklist reminder with AI personalization
   */
  async sendChecklistReminder(userProfile, incompleteItems, pushSubscriptions = []) {
    try {
      const prompt = `Generate a friendly but urgent reminder for a user who hasn't completed their hurricane preparedness checklist.

User: ${userProfile.userEmail}
Location: ${userProfile.zip_code}
Household: ${userProfile.adults} adults, ${userProfile.kids} kids, ${userProfile.pets} pets
Incomplete items: ${incompleteItems.length}

Items to complete:
${incompleteItems.slice(0, 5).map(item => `- ${item}`).join('\n')}
${incompleteItems.length > 5 ? `...and ${incompleteItems.length - 5} more items` : ''}

Generate:
1. EMAIL_SUBJECT: Motivational subject line (max 60 chars)
2. EMAIL_BODY: HTML email encouraging completion, highlighting importance
3. PUSH_MESSAGE: Short push notification (max 100 chars)

Format as JSON:
{
  "emailSubject": "subject",
  "emailBody": "html body",
  "pushTitle": "title",
  "pushBody": "body"
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful emergency preparedness assistant.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8
      });

      const content = JSON.parse(completion.choices[0].message.content);

      // Send email
      const emailResult = await this.sendEmail(
        userProfile.userEmail,
        content.emailSubject,
        content.emailBody
      );

      // Send push notifications
      const pushResults = await Promise.allSettled(
        pushSubscriptions.map(sub => 
          this.sendPushNotification(sub, {
            title: content.pushTitle,
            body: content.pushBody,
            icon: '/icon-192x192.png',
            tag: 'checklist-reminder',
            data: { url: '/checklist' }
          })
        )
      );

      return {
        success: true,
        email: emailResult,
        push: pushResults
      };

    } catch (error) {
      console.error('Error sending checklist reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check - verify service is configured
   */
  isConfigured() {
    return {
      enabled: {
        email: this.emailEnabled,
        push: this.pushEnabled,
        sms: this.smsEnabled
      },
      configured: {
        email: !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD),
        push: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
        sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
        openai: !!process.env.OPENAI_API_KEY
      },
      ready: {
        email: this.emailEnabled && !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD),
        push: this.pushEnabled && !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
        sms: this.smsEnabled && !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        openai: !!process.env.OPENAI_API_KEY
      }
    };
  }
}

module.exports = NotificationService;
