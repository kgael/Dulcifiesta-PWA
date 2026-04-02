import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = Router()

async function getRole(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data.role
}

// GET /api/inventory/movements (admin)
router.get('/movements', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    const role = await getRole(userId)

    if (role !== 'admin') return res.status(403).json({ ok: false, error: 'Forbidden' })

    const { data, error } = await supabaseAdmin
      .from('inventory_movements')
      .select('id, movement_type, quantity, reason, created_at, user_id, product_id, products(name)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return res.status(500).json({ ok: false, error: error.message })
    return res.status(200).json({ ok: true, data })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// POST /api/inventory/movements (admin)
router.post('/movements', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    const role = await getRole(userId)
    if (role !== 'admin') return res.status(403).json({ ok: false, error: 'Forbidden' })

    const { productId, movementType, quantity, reason } = req.body

    if (!productId || !movementType || !quantity) {
      return res.status(400).json({ ok: false, error: 'Missing fields' })
    }

    if (!['entrada', 'salida'].includes(movementType)) {
      return res.status(400).json({ ok: false, error: 'Invalid movementType' })
    }

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ ok: false, error: 'quantity must be integer > 0' })
    }

    // 1) Obtener stock actual
    const { data: product, error: pErr } = await supabaseAdmin
      .from('products')
      .select('id, stock')
      .eq('id', productId)
      .single()

    if (pErr) return res.status(500).json({ ok: false, error: pErr.message })

    const newStock = movementType === 'entrada' ? product.stock + qty : product.stock - qty
    if (newStock < 0) {
      return res.status(400).json({ ok: false, error: 'Stock insuficiente' })
    }

    // 2) Registrar movimiento
    const { data: move, error: mErr } = await supabaseAdmin
      .from('inventory_movements')
      .insert({
        product_id: productId,
        movement_type: movementType,
        quantity: qty,
        reason: reason || null,
        user_id: userId,
      })
      .select('id')
      .single()

    if (mErr) return res.status(500).json({ ok: false, error: mErr.message })

    // 3) Actualizar stock
    const { error: uErr } = await supabaseAdmin
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)

    if (uErr) return res.status(500).json({ ok: false, error: uErr.message })
      // Notificación Inbox para quien hizo el movimiento
const { data: prodNameRow } = await supabaseAdmin
  .from('products')
  .select('name')
  .eq('id', productId)
  .single()

const prodName = prodNameRow?.name || 'Producto'

await supabaseAdmin.from('notifications').insert({
  user_id: userId,
  title: 'Movimiento registrado',
  message: `${movementType.toUpperCase()} • ${prodName} • Cantidad: ${qty} • Stock nuevo: ${newStock}`,
  type: 'system',
})


    return res.status(201).json({ ok: true, data: { movementId: move.id, newStock } })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
