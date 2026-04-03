/* eslint-disable no-restricted-globals */

import { precacheAndRoute } from 'workbox-precaching'

// 🔥 ESTA LÍNEA ES LA CLAVE
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  let data = { title: 'Dulcifiesta', message: 'Tienes una notificación 🍬' }

  try {
    if (event.data) data = event.data.json()
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'Dulcifiesta', {
      body: data.message || 'Notificación',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/catalog'))
})