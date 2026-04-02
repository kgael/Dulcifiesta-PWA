import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = Router()

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit || '32', 10), 1), 50)
    const from = (page - 1) * limit
    const to = from + limit - 1

    const q = (req.query.q || '').toString().trim()

    let query = supabaseAdmin
      .from('products')
      .select('id, name, description, price, category, image_url, stock, active, created_at', { count: 'exact' })
      .eq('active', true)

    if (q) {
      const pattern = `%${q}%`
      query = query.or(`name.ilike.${pattern},category.ilike.${pattern},description.ilike.${pattern}`)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: true }) // viejos primero
      .range(from, to)

    if (error) return res.status(500).json({ ok: false, error: error.message })

    const total = count ?? 0
    const totalPages = Math.max(Math.ceil(total / limit), 1)

    return res.status(200).json({
      ok: true,
      data,
      meta: { page, limit, total, totalPages },
    })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})



export default router
