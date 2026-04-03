import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productsRouter from './routes/products.routes.js'
import meRouter from './routes/me.routes.js'
import inventoryRouter from './routes/inventory.routes.js'
import pushRouter from './routes/push.routes.js'
import productsAdminRouter from './routes/products.admin.routes.js'



dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const allowedOrigins = [
  process.env.FRONTEND_URL,          // Netlify prod
  process.env.FRONTEND_PREVIEW_URL,  // Netlify preview (opcional)
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
  }),
)

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API Dulcifiesta funcionando',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/products', productsRouter)
app.use('/api/products', productsAdminRouter)
app.use('/api/me', meRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/push', pushRouter)


app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`)
})
