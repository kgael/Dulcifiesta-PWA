import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return null
  return user ? <Navigate to="/catalog" replace /> : <Navigate to="/login" replace />
}
