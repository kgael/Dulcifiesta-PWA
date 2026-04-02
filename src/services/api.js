import { supabase } from '../lib/supabaseClient'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getProducts({ page = 1, limit = 18, q = '' } = {}) {
  const url = new URL(`${API_URL}/api/products`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  if (q && q.trim()) url.searchParams.set('q', q.trim())

  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Error al obtener productos')

  return { items: json.data, meta: json.meta }
}



export async function getMe() {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/api/me`, { headers })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Error al obtener perfil')
  return json.data
}

export async function getMovements() {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/api/inventory/movements`, { headers })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Error al obtener movimientos')
  return json.data
}

export async function createMovement(payload) {
  const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' }
  const res = await fetch(`${API_URL}/api/inventory/movements`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Error al crear movimiento')
  return json.data
}

export async function createProduct(formData) {
  const headers = await authHeaders() 
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'Error al crear producto')
  return json.data
}

