self.addEventListener('push', (event) => {
  let data = { title: 'Dulcifiesta', message: 'Tienes una notificación 🍬' }

  try {
    if (event.data) data = event.data.json()
  } catch {
    // si no viene en JSON, dejamos defaults
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
