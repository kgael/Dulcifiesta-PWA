import { Navigate } from 'react-router-dom'
import AuthForm from '../components/auth/AuthForm'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (user) return <Navigate to="/catalog" replace />

  return (
    <div className="flex min-h-[70vh] items-center pt-16 justify-center">
      <AuthForm />
    </div>
  )
}