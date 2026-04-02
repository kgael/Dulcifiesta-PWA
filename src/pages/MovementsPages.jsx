import { useEffect, useState } from 'react'
import { getMovements } from '../services/api'

export default function MovementsPage() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        setStatus('loading')
        const data = await getMovements()
        if (!active) return
        setItems(data)
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
  }, [])

  if (status === 'loading') {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <p className="text-gray-600">Cargando movimientos...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="font-medium text-red-700">Error</p>
        <p className="mt-1 text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Movimientos</h2>
        <p className="text-gray-600">Historial (últimos 50)</p>
      </header>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {items.length === 0 ? (
          <p className="text-gray-600">Aún no hay movimientos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Producto</th>
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Cantidad</th>
                  <th className="py-2 pr-4">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">
                      {new Date(m.created_at).toLocaleString('es-MX')}
                    </td>
                    <td className="py-2 pr-4 font-medium text-gray-800">
                      {m.products?.name ?? '—'}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={m.movement_type === 'entrada' ? 'text-green-700' : 'text-red-700'}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{m.quantity}</td>
                    <td className="py-2 pr-4 text-gray-600">{m.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
