import { useEffect, useMemo, useState } from "react";
import {
  createMovement,
  getMe,
  getMovements,
  getProducts,
} from "../services/api";

export default function InventoryPage() {
  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [status, setStatus] = useState("loading"); 
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] = useState("entrada");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = me?.role === "admin";

  const productOptions = useMemo(() => {
    return (Array.isArray(products) ? products : []).map((p) => ({
      id: p.id,
      label: `${p.name} (stock: ${p.stock})`,
    }));
  }, [products]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setStatus("loading");
        const [profile, prodsResp] = await Promise.all([
          getMe(),
          getProducts({ page: 1, limit: 100 }),
        ]);
        
        setMe(profile);
        setProducts(prodsResp.items || []);
        if (prodsResp.items?.[0]?.id) setProductId(prodsResp.items[0].id);

        
        if (profile.role === "admin") {
          const moves = await getMovements();
          if (!active) return;
          setMovements(moves);
        }

        setStatus("ready");
      } catch (e) {
        if (!active) return;
        setError(e.message);
        setStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function refreshAdminData() {
    const [prodsResp, moves] = await Promise.all([
      getProducts({ page: 1, limit: 100 }),
      getMovements(),
    ]);
    setProducts(prodsResp.items || []);
    setMovements(moves);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createMovement({
        productId,
        movementType,
        quantity: Number(quantity),
        reason,
      });
      setReason("");
      setQuantity(1);
      await refreshAdminData();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <p className="text-gray-600">Cargando Registros...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="font-medium text-red-700">Error</p>
        <p className="mt-1 text-red-600">{error}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm">
        <p className="font-medium text-yellow-800">No autorizado</p>
        <p className="mt-1 text-yellow-700">
          Tu rol es <span className="font-semibold">{me?.role}</span>. Solo
          admin puede gestionar inventario.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">
          Registro de entradas/salidas
        </h2>
      </header>

      <form
  onSubmit={handleCreate}
  className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"
>
  <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white px-6 py-4">
    <h3 className="text-lg font-semibold text-gray-800">Nuevo movimiento</h3>
    <p className="mt-1 text-sm text-gray-600">
      Registra una entrada o salida para actualizar el stock del producto.
    </p>
  </div>

  <div className="space-y-4 p-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm font-medium text-gray-700">Producto</span>
        <select
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none
           focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          {productOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-gray-700">Tipo de movimiento</span>
        <select
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none
           focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
        >
          <option value="entrada">Entrada 📥</option>
          <option value="salida">Salida 📤</option>
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-gray-700">Cantidad</span>
        <input
          type="number"
          min="1"
          step="1"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none
           focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-gray-700">Motivo (opcional)</span>
        <input
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: compra proveedor / merma / venta mostrador"
        />
      </label>
    </div>

    <div className="flex items-center justify-end">
      <button
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-pink-600 disabled:opacity-60"
      >
        <span>{saving ? 'Guardando...' : 'Registrar movimiento'}</span>
      </button>
    </div>
  </div>
</form>
    </section>
  );
}
