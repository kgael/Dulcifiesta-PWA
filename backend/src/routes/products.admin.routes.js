import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middlewares/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

async function getRole(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data.role
}

// POST /api/products (admin) - FormData
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id
    const role = await getRole(userId)
    if (role !== 'admin') return res.status(403).json({ ok: false, error: 'Forbidden' })

    const { name, description, price, category, stock, active } = req.body

    if (!name || price == null) {
      return res.status(400).json({ ok: false, error: 'name y price son requeridos' })
    }

    const priceNum = Number(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ ok: false, error: 'price inválido' })
    }

    const stockNum = stock == null ? 0 : Number(stock)
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      return res.status(400).json({ ok: false, error: 'stock debe ser entero >= 0' })
    }

    let imageUrl = null

    // Subir imagen a Supabase Storage si viene
    if (req.file) {
      const bucket = 'product-images'
      const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase()
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`

      const { error: upErr } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        })

      if (upErr) return res.status(500).json({ ok: false, error: upErr.message })

      const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)
      imageUrl = pub.publicUrl
    }

    const isActive = active === 'false' ? false : true

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description: description || null,
        price: priceNum,
        category: category || null,
        image_url: imageUrl,
        stock: stockNum,
        active: isActive,
        created_by: userId,
      })
      .select('id')
      .single()

    if (error) return res.status(500).json({ ok: false, error: error.message })

    // Notificación Inbox (opcional, pero útil)
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: 'Producto registrado',
      message: `Se agregó "${name}" al catálogo.`,
      type: 'system',
    })

    return res.status(201).json({ ok: true, data })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
