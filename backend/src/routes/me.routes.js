import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single()

  if (error) return res.status(500).json({ ok: false, error: error.message })

  return res.status(200).json({ ok: true, data })
})

export default router
