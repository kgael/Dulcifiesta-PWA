/* eslint-disable no-restricted-globals */

// Workbox inject manifest placeholder (OBLIGATORIO)
self.__WB_MANIFEST

self.addEventListener('push', (event) => {
  let data = { title: 'Dulcifiesta', message: 'Tienes una notificación 🍬' }

  try {
    if (event.data) data = event.data.json()
  } catch {
    // ignore
  }

  const title = data.title || 'Dulcifiesta'
  const options = {
    body: data.message || 'Notificación',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/catalog'))
})