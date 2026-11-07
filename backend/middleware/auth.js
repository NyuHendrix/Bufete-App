import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export function getBearerTokenFromRequest(request) {
  const authorization = request.headers.authorization || ''
  if (!authorization.startsWith('Bearer ')) return null
  return authorization.replace('Bearer ', '').trim()
}

export function verifyToken(token, type = 'access') {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    clockTolerance: 5,
    ignoreExpiration: false,
  })
}

export function requireAuth(request, response, next) {
  try {
    const token = getBearerTokenFromRequest(request)
    if (!token) {
      response.status(401).json({ message: 'No autorizado: faltan credenciales' })
      return
    }

    const payload = verifyToken(token)
    request.user = payload
    next()
  } catch (error) {
    response.status(401).json({ message: 'Token inválido o expirado' })
  }
}

export function requireRole(...allowedRoles) {
  return (request, response, next) => {
    const role = request.user?.role || ''
    if (!allowedRoles.includes(role)) {
      response.status(403).json({ message: 'No tienes permisos para acceder a este recurso' })
      return
    }
    next()
  }
}
