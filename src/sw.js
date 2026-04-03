/* eslint-disable no-restricted-globals */

// Workbox will replace this array with the precache manifest
const precacheManifest = self.__WB_MANIFEST

// (Opcional) aquí podrías usar precacheManifest si quieres, no es obligatorio.
// Lo importante es que exista el placeholder en una asignación.

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