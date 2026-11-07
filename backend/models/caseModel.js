import { query, queryOne, runSql } from '../config/db.js'

export const caseModel = {
  async list() {
    const rows = await query('SELECT * FROM cases ORDER BY created_at DESC')
    const mapped = []

    for (const item of rows) {
      const parties = await query('SELECT * FROM case_involved_parties WHERE case_id = ? ORDER BY id', [item.id])
      mapped.push({ ...item, involvedParties: parties })
    }

    return mapped
  },

  async getById(id) {
    const item = await queryOne('SELECT * FROM cases WHERE id = ?', [id])
    if (!item) return null
    const parties = await query('SELECT * FROM case_involved_parties WHERE case_id = ? ORDER BY id', [id])
    return { ...item, involvedParties: parties }
  },

  async create(payload) {
    const caseId = payload.id || `EXP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    const result = await runSql(
      `INSERT INTO cases (id, client_id, title, legal_branch, status, priority, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [caseId, payload.client_id ?? payload.clientId, payload.title, payload.legalBranch || payload.legal_branch, payload.status, payload.priority, payload.description || null],
    )

    if (Array.isArray(payload.involvedParties)) {
      for (const party of payload.involvedParties) {
        await runSql(
          'INSERT INTO case_involved_parties (case_id, name, role, contact_info) VALUES (?, ?, ?, ?)',
          [caseId, party.name, party.role, party.contactInfo || party.contact_info || null],
        )
      }
    }

    return this.getById(caseId)
  },

  async update(id, payload) {
    await runSql(
      `UPDATE cases SET client_id = ?, title = ?, legal_branch = ?, status = ?, priority = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payload.client_id ?? payload.clientId, payload.title, payload.legalBranch || payload.legal_branch, payload.status, payload.priority, payload.description || null, id],
    )

    await runSql('DELETE FROM case_involved_parties WHERE case_id = ?', [id])
    if (Array.isArray(payload.involvedParties)) {
      for (const party of payload.involvedParties) {
        await runSql(
          'INSERT INTO case_involved_parties (case_id, name, role, contact_info) VALUES (?, ?, ?, ?)',
          [id, party.name, party.role, party.contactInfo || party.contact_info || null],
        )
      }
    }

    return this.getById(id)
  },

  async remove(id) {
    const row = await this.getById(id)
    await runSql('DELETE FROM cases WHERE id = ?', [id])
    return row
  },
}
