import crypto from 'node:crypto'
import { refreshTokenModel } from '../models/refreshTokenModel.js'
import { userModel } from '../models/userModel.js'
import { buildAccessToken, buildRefreshToken, generateFamilyId, generateJti, hashToken, verifyToken } from './tokenService.js'

export async function issueTokenPair(user) {
  const familyId = generateFamilyId()
  const accessToken = buildAccessToken(user)
  const refreshJti = generateJti()
  const refreshToken = buildRefreshToken(user, familyId, refreshJti)
  const refreshHash = hashToken(refreshToken)

  await refreshTokenModel.create({
    userId: user.id,
    jti: refreshJti,
    familyId,
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return { accessToken, refreshToken, familyId }
}

export async function rotateRefreshToken(oldRefreshToken) {
  const payload = verifyToken(oldRefreshToken)

  if (payload.type !== 'refresh') {
    throw new Error('Token de refresco inválido')
  }

  const storedToken = await refreshTokenModel.findByJti(payload.jti)
  if (!storedToken || storedToken.revoked_at || storedToken.expires_at < new Date().toISOString()) {
    throw new Error('Refresh token inválido o revocado')
  }

  const oldHash = hashToken(oldRefreshToken)
  const currentMatch = storedToken.token_hash === oldHash
  if (!currentMatch) {
    await refreshTokenModel.revokeFamily(storedToken.user_id, storedToken.family_id)
    throw new Error('Refresh token no coincide con la familia actual')
  }

  const user = await userModel.findById(storedToken.user_id)
  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  const newFamilyId = storedToken.family_id
  const newJti = generateJti()
  const replacementRefreshToken = buildRefreshToken(user, newFamilyId, newJti)
  const replacementHash = hashToken(replacementRefreshToken)

  await refreshTokenModel.revokeByJti(payload.jti)
  await refreshTokenModel.create({
    userId: user.id,
    jti: newJti,
    familyId: newFamilyId,
    tokenHash: replacementHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  const accessToken = buildAccessToken(user)
  return { accessToken, refreshToken: replacementRefreshToken }
}

export async function revokeUserFamily(userId, familyId) {
  await refreshTokenModel.revokeFamily(userId, familyId)
}

export async function revokeRefreshToken(token) {
  const payload = verifyToken(token)
  if (payload.type !== 'refresh') {
    return
  }

  await refreshTokenModel.revokeByJti(payload.jti)
}
