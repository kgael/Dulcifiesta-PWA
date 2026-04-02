import { useMemo, useState } from 'react'
import { createProduct } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function CreateProductPage() {
  const nav = useNavigate()
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('0')
  const [image, setImage] = useState(null)

  const previewUrl = useMemo(() => {
    if (!image) return ''
    return URL.createObjectURL(image)
  }, [image])

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('description', description.trim())
      fd.append('price', price)
      fd.append('category', category.trim())
      fd.append('stock', stock)
      if (image) fd.append('image', image)

      await createProduct(fd)
      alert('✅ Producto creado')
      nav('/catalog')
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Registrar producto</h2>
        <p className="mt-1 text-gray-600">
          Agrega un nuevo producto al catálogo con imagen, precio y stock inicial.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"
      >
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Formulario */}
          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Nombre *</span>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none
                   focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Gomitas enchiladas"
                  required
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Categoría</span>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none
                   focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Gomitas / Paletas / Chocolates"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Precio (MXN) *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none
                   focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Stock inicial</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none
                   focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Descripción</span>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe sabor, presentación, tamaño, etc."
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Imagen (opcional)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-pink-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-pink-700 hover:file:bg-pink-200"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                {image && (
                  <p className="text-xs text-gray-500">
                    Seleccionada: <span className="font-medium">{image.name}</span>
                  </p>
                )}
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => nav('/catalog')}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                disabled={saving}
                className="rounded-xl bg-pink-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-pink-600 disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar producto'}
              </button>
            </div>
          </div>

          {/* Preview lateral */}
          <div className="border-t border-gray-100 bg-gray-50/60 p-6 lg:border-l lg:border-t-0">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Vista previa
            </h3>

            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-pink-50 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">🍬</span>
                )}
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <h4 className="font-semibold text-gray-900">
                  {name.trim() || 'Nombre del producto'}
                </h4>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(Number(price || 0))}
                </span>
              </div>

              <p className="mt-1 text-sm text-pink-700">
                {category.trim() || 'Categoría'}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {description.trim() || 'La descripción aparecerá aquí...'}
              </p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Stock inicial</span>
                <span className="font-medium text-green-700">{Number(stock || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}