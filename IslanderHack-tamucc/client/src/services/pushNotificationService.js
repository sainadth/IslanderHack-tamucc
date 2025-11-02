/**
 * Push Notification Service
 * Handles web push notification subscriptions and management
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('✅ Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get VAPID public key from server
 */
async function getVapidPublicKey() {
  try {
    const response = await fetch(`${API_URL}/api/notifications/vapid-public-key`);
    const data = await response.json();
    
    if (data.success) {
      return data.publicKey;
    }
    
    throw new Error('Failed to get VAPID key');
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return null;
  }
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(userId) {
  try {
    // 1. Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }

    // 2. Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service worker registration failed');
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // 3. Get VAPID public key from server
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      throw new Error('Failed to get VAPID public key');
    }

    // 4. Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('✅ Push subscription created:', subscription);

    // 5. Send subscription to server
    const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        subscription: subscription.toJSON()
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Push subscription registered on server');
      // Store subscription in localStorage for later use
      localStorage.setItem('pushSubscription', JSON.stringify(subscription.toJSON()));
      return subscription;
    }

    throw new Error('Failed to register subscription on server');

  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      localStorage.removeItem('pushSubscription');
      console.log('✅ Unsubscribed from push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isPushSubscribed() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return subscription !== null;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Test push notification (for testing purposes)
 */
export async function testPushNotification() {
  try {
    const subscription = await getPushSubscription();
    if (!subscription) {
      throw new Error('Not subscribed to push notifications');
    }

    const response = await fetch(`${API_URL}/api/notifications/test-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        title: '🧪 Test Notification',
        body: 'This is a test push notification!'
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error testing push notification:', error);
    throw error;
  }
}
