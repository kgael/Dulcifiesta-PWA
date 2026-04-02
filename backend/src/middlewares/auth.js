import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnon = process.env.SUPABASE_ANON_KEY // usaremos anon para validar token

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Falta SUPABASE_URL o SUPABASE_ANON_KEY en backend .env')
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnon)

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return res.status(401).json({ ok: false, error: 'Missing Bearer token' })

  const { data, error } = await supabaseAuth.auth.getUser(token)
  if (error || !data?.user) return res.status(401).json({ ok: false, error: 'Invalid token' })

  req.user = data.user
  next()
}
