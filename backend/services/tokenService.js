import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function signToken(payload, expiresIn) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn,
  })
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    clockTolerance: 5,
  })
}

export function buildAccessToken(user) {
  return signToken(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role_name || user.role || 'user',
      type: 'access',
    },
    env.JWT_ACCESS_EXPIRES_IN,
  )
}

export function buildRefreshToken(user, familyId, jti) {
  return signToken(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role_name || user.role || 'user',
      type: 'refresh',
      familyId,
      jti,
    },
    env.JWT_REFRESH_EXPIRES_IN,
  )
}

export function generateJti() {
  return crypto.randomUUID()
}

export function generateFamilyId() {
  return crypto.randomUUID()
}
