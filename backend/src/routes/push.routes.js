import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { webpush, VAPID_PUBLIC_KEY } from '../lib/webPush.js'

const router = Router()

// GET /api/push/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
  res.json({ ok: true, data: { publicKey: VAPID_PUBLIC_KEY } })
})

// POST /api/push/subscribe
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    const { subscription } = req.body

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ ok: false, error: 'Subscription inválida' })
    }

    const payload = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(payload, { onConflict: 'endpoint' })

    if (error) return res.status(500).json({ ok: false, error: error.message })

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})



router.post('/test', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

   
    const { data: prof, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (pErr) return res.status(500).json({ ok: false, error: pErr.message })
    if (prof.role !== 'admin') return res.status(403).json({ ok: false, error: 'Forbidden' })

    
    const { title = 'Dulcifiesta', message = 'Notificación de prueba 🍬' } = req.body || {}

    
    const { error: nErr } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'system',
    })
    if (nErr) return res.status(500).json({ ok: false, error: nErr.message })

    
    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (error) return res.status(500).json({ ok: false, error: error.message })

    const payload = JSON.stringify({ title, message })

    const results = await Promise.allSettled(
      (subs || []).map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        ),
      ),
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - sent

    return res.status(200).json({ ok: true, data: { sent, failed } })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})


export default router
