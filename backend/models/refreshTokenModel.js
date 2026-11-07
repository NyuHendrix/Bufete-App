import { query, queryOne, runSql } from '../config/db.js'

export const refreshTokenModel = {
  async create({ userId, jti, familyId, tokenHash, expiresAt }) {
    return runSql(
      'INSERT INTO refresh_tokens (user_id, jti, family_id, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)',
      [userId, jti, familyId, tokenHash, expiresAt],
    )
  },

  async findByJti(jti) {
    return queryOne('SELECT * FROM refresh_tokens WHERE jti = ?', [jti])
  },

  async findByHash(hash) {
    return queryOne('SELECT * FROM refresh_tokens WHERE token_hash = ?', [hash])
  },

  async revokeFamily(userId, familyId) {
    return runSql('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND family_id = ?', [userId, familyId])
  },

  async revokeByJti(jti) {
    return runSql('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE jti = ?', [jti])
  },

  async replace(oldJti, newJti, newHash, familyId, userId) {
    return runSql(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, replaced_by = ? WHERE jti = ? AND user_id = ?',
      [newJti, oldJti, userId],
    ).then(() => this.create({ userId, jti: newJti, familyId, tokenHash: newHash, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }))
  },
}
