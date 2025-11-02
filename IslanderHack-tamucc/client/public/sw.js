/* eslint-disable no-undef */
// Service Worker for Push Notifications

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);

  let data = {
    title: 'Emergency Alert',
    body: 'New notification received',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png'
  };

  // Parse notification data
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
    vibrate: [200, 100, 200],
    sound: '/notification-sound.mp3'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();

  // Handle action button clicks
  if (event.action === 'view-details') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/evacuation')
    );
  } else if (event.action === 'view-route') {
    event.waitUntil(
      clients.openWindow('/evacuation')
    );
  } else if (event.action === 'find-shelter') {
    event.waitUntil(
      clients.openWindow('/evacuation#shelters')
    );
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Install event
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});
