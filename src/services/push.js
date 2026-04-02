import { supabase } from '../lib/supabaseClient'
import { API_URL } from './api'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export async function enablePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push no soportado en este navegador')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Permiso de notificaciones denegado')
  }

  // Obtener public key VAPID
  const resKey = await fetch(`${API_URL}/api/push/vapid-public-key`)
  const jsonKey = await resKey.json()
  if (!resKey.ok || !jsonKey.ok) throw new Error('No se pudo obtener VAPID public key')

  const publicKey = jsonKey.data.publicKey
  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })

  const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' }
  const res = await fetch(`${API_URL}/api/push/subscribe`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ subscription }),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo guardar suscripción')

  return true
}

export async function sendTestPush(title, message) {
  const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' }
  const res = await fetch(`${API_URL}/api/push/test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, message }),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo enviar push')
  return json.data
}
