import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import env from './config/env.js'
import { requireAuth } from './middleware/auth.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import apiRoutes from './routes/apiRoutes.js'

const app = express()

app.disable('x-powered-by')
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
)
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/api', apiRoutes)

app.get('/', (request, response) => {
  response.json({ name: 'Bufete App API', status: 'online' })
})

app.use(notFoundHandler)
app.use(errorHandler)

export default app
