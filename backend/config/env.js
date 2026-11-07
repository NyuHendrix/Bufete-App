import dotenv from 'dotenv'

dotenv.config()

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3001),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  JWT_ISSUER: process.env.JWT_ISSUER || 'bufete-app',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'bufete-app-web',
  DB_PATH: process.env.DB_PATH || 'backend/data/app.db',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
}

export default env
