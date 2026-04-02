import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/api'

function Price({ value }) {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(value || 0))

  return <span className="font-semibold text-gray-900">{formatted}</span>
}

function SkeletonCard() {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-gray-100 animate-pulse" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-14 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </article>
  )
}

function Pagination({ page, totalPages, onPage }) {
  const pages = useMemo(() => {
    // paginación compacta: 1 ... (p-1) p (p+1) ... last
    const set = new Set([1, totalPages, page, page - 1, page + 1])
    const arr = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)

    // insertar "..." cuando hay saltos
    const out = []
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i])
      const next = arr[i + 1]
      if (next && next - arr[i] > 1) out.push('...')
    }
    return out
  }, [page, totalPages])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={() => onPage(Math.max(page - 1, 1))}
        disabled={page <= 1}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
      >
        ← Anterior
      </button>

      <div className="flex flex-wrap items-center gap-1">
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={[
                'rounded-xl px-3 py-2 text-sm font-medium transition',
                p === page
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
              ].join(' ')}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onPage(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
        className="rounded-xl bg-pink-500 px-3 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
      >
        Siguiente →
      </button>
    </div>
  )
}

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()

  const page = Math.max(parseInt(params.get('page') || '1', 10), 1)
  const q = params.get('q') || ''

  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 18, total: 0, totalPages: 1 })
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')

  const isSearching = Boolean(q.trim())

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        setStatus('loading')
        const { items, meta } = await getProducts({ page, limit: 32, q })
        if (!active) return
        setItems(items || [])
        setMeta(meta || { page: 1, limit: 32, total: 0, totalPages: 1 })
        setStatus('ready')
      } catch (e) {
        if (!active) return
        setError(e.message)
        setStatus('error')
      }
    })()

    return () => {
      active = false
    }
  }, [page, q])

  function setQuery(value) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      const v = value || ''
      if (v.trim()) next.set('q', v)
      else next.delete('q')
      next.set('page', '1')
      return next
    })
  }

  function clearQuery() {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.set('page', '1')
      return next
    })
  }

  function goToPage(p) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  return (
    <section className="space-y-5">
      {/* HERO */}
      <header className="rounded-3xl border border-pink-100 bg-gradient-to-r from-pink-50 via-white to-pink-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Catálogo</h2>
            <p className="mt-1 text-gray-600">
              {isSearching ? (
                <>
                  Resultados para <span className="font-semibold text-gray-800">“{q}”</span> ·{' '}
                  <span className="font-medium text-pink-700">{meta.total}</span> encontrado(s)
                </>
              ) : (
                <>
                  Dulces disponibles · Total{' '}
                  <span className="font-medium text-pink-700">{meta.total}</span>
                </>
              )}
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <span className="select-none text-gray-400">🔎</span>
              <input
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, categoría o descripción…"
                className="w-full bg-transparent text-sm outline-none"
              />
              {q.trim() && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* STATES */}
      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <p className="font-medium text-red-700">Error</p>
          <p className="mt-1 text-red-600">{error}</p>
        </div>
      )}

      {status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div className="rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-3xl">
              🍬
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {isSearching ? 'Sin resultados' : 'Catálogo vacío'}
            </h3>
            <p className="mt-1 text-gray-600">
              {isSearching
                ? 'Prueba con otra palabra o limpia el buscador.'
                : 'Aún no hay productos activos. Agrega algunos desde “Registrar producto”.'}
            </p>

            {isSearching && (
              <button
                onClick={clearQuery}
                className="mt-4 rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      )}

      {/* GRID */}
      {status === 'ready' && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => {
              const inStock = Number(p.stock) > 0
              return (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative">
                    <div className="aspect-[4/3] w-full bg-pink-50">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl">
                          🍬
                        </div>
                      )}
                    </div>

                    {/* badges */}
                    <div className="absolute left-3 top-3 flex gap-2">
                      {p.category && (
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-pink-700 backdrop-blur">
                          {p.category}
                        </span>
                      )}
                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          inStock
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700',
                        ].join(' ')}
                      >
                        {inStock ? `Stock: ${p.stock}` : 'Agotado'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-gray-900 leading-snug">{p.name}</h3>
                      <Price value={p.price} />
                    </div>

                    {p.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(p.created_at).toLocaleDateString('es-MX')}
                      </span>

                      <span
                        className={[
                          'rounded-xl px-3 py-1 text-xs font-medium',
                          inStock
                            ? 'bg-pink-50 text-pink-700'
                            : 'bg-gray-100 text-gray-600',
                        ].join(' ')}
                      >
                        {inStock ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* PAGINATION */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                Página <span className="font-medium text-gray-800">{meta.page}</span> de{' '}
                <span className="font-medium text-gray-800">{meta.totalPages}</span>
              </p>
              <p className="text-xs text-gray-500">
                Mostrando {items.length} de {meta.total}
              </p>
            </div>

            <Pagination page={meta.page} totalPages={meta.totalPages} onPage={goToPage} />
          </div>
        </>
      )}
    </section>
  )
}