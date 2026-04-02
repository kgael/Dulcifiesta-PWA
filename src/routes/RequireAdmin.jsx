import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMe } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin() {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true

    ;(async () => {
      if (!user) return
      try {
        setStatus('loading')
        const me = await getMe()
        if (!active) return
        setIsAdmin(me.role === 'admin')
        setStatus('ready')
      } catch {
        if (!active) return
        setStatus('error')
      }
    })()

    return () => {
      active = false
    }
  }, [user])

  if (loading || status === 'loading') {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <p className="text-gray-600">Verificando permisos...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/catalog" replace />

  return <Outlet />
}
