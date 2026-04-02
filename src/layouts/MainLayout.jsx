import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function TopLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-pink-500 text-white shadow-sm'
            : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function MainLayout({ children }) {
  const { user, loading } = useAuth()
  const [me, setMe] = useState(null)
  const [meLoading, setMeLoading] = useState(false)

  useEffect(() => {
    let active = true

    ;(async () => {
      if (!user) {
        setMe(null)
        return
      }

      try {
        setMeLoading(true)
        // Leemos rol directo desde Supabase (evita depender de /api/me solo para pintar UI)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', user.id)
          .single()

        if (!active) return
        if (error) throw error
        setMe(data)
      } catch {
        if (!active) return
        setMe(null)
      } finally {
        if (active) setMeLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [user])

  const isAdmin = me?.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-pink-100 bg-white shadow-sm flex items-center justify-center">
              <img
                src="/logo-dulcifiesta.png"
                alt="Logo Dulcifiesta"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement.innerHTML = '<span style="font-size:1.1rem">🍬</span>'
                }}
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-base font-bold text-pink-600">Dulcifiesta</h1>
              <p className="text-[11px] text-gray-500">Catálogo e inventario</p>
            </div>
          </div>

          {/* Links */}
          <nav className="ml-auto hidden items-center gap-2 md:flex">
  <TopLink to="/catalog">+ Catálogo</TopLink>

  {!loading && !user && <TopLink to="/login">+ Iniciar sesión</TopLink>}

  {!loading && user && (
    <>
      <TopLink to="/notifications">+ Notificaciones</TopLink>

      {!meLoading && isAdmin && (
        <>
          <TopLink to="/inventory">+ Entradas/Salidas</TopLink>
          <TopLink to="/movements">+ Movimientos</TopLink>
          <TopLink to="/products/new">+ Registrar producto</TopLink>
        </>
      )}
    </>
  )}
</nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {!loading && user && (
              <div className="hidden text-right md:block">
                <p className="text-[11px] text-gray-500">Sesión</p>
                <p className="max-w-[220px] truncate text-sm font-medium text-gray-800">
                  {user.email}
                </p>
              </div>
            )}

            {!loading && user && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>

        {/* NAV móvil (simple, en 2 filas) */}
        <div className="mx-auto max-w-7xl px-4 pb-3 md:hidden">
          <div className="flex flex-wrap gap-2">
            <TopLink to="/catalog">🍬 Catálogo</TopLink>

            {!loading && !user && <TopLink to="/login">🔑 Iniciar sesión</TopLink>}

            {!loading && user && (
              <>
                <TopLink to="/notifications">🔔 Notificaciones</TopLink>

                {!meLoading && isAdmin && (
                  <>
                    <TopLink to="/inventory">📦 Entradas/Salidas</TopLink>
                    <TopLink to="/movements">🧾 Movimientos</TopLink>
                    <TopLink to="/products/new">➕ Producto</TopLink>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-pink-100 bg-white/70 p-4 shadow-sm backdrop-blur">
          {children}
        </div>
      </main>
    </div>
  )
}