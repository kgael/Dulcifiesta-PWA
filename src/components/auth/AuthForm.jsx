  import { useState } from 'react'
  import { supabase } from '../../lib/supabaseClient'

  export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function handleLogin(e) {
      e.preventDefault()
      setLoading(true)
      setError('')
      setSuccess('')

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error

        setSuccess('✅ Sesión iniciada')
      } catch (e) {
        setError(e.message || 'Error al iniciar sesión')
      } finally {
        setLoading(false)
      }
    }

    return (
      <section className="w-full max-w-md overflow-hidden rounded-3xl border
       border-pink-100 bg-white shadow-xl">
        {/* Encabezado decorativo */}
        <div className="bg-gradient-to-r from-pink-50 via-white
         to-pink-50 px-6 pt-6 pb-4 border-b border-pink-100">
          {/* Logo grande arriba */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-35 w-40 items-center justify-center rounded-2xl border
             border-pink-100 bg-white shadow-sm overflow-hidden">
              <img
                src="/logo-dulcifiesta.png"
                alt="Logo Dulcifiesta"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement.innerHTML = 
                  '<span style="font-size:2rem">🍬</span>'
                }}
              />
            </div>
          </div>
          </div>
        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4 px-6 py-6">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Correo</span>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-500 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    )
  }