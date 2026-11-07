import { query, queryOne, runSql } from '../config/db.js'

export const expenseModel = {
  async list() {
    return query('SELECT * FROM expenses ORDER BY fecha DESC')
  },

  async getById(id) {
    return queryOne('SELECT * FROM expenses WHERE id = ?', [id])
  },

  async create(payload) {
    const result = await runSql(
      `INSERT INTO expenses (concepto, monto, categoria, fecha, proveedor, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [payload.concepto, Number(payload.monto || 0), payload.categoria || null, payload.fecha, payload.proveedor || null],
    )
    return this.getById(result.lastID)
  },

  async update(id, payload) {
    await runSql(
      `UPDATE expenses SET concepto = ?, monto = ?, categoria = ?, fecha = ?, proveedor = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payload.concepto, Number(payload.monto || 0), payload.categoria || null, payload.fecha, payload.proveedor || null, id],
    )
    return this.getById(id)
  },

  async remove(id) {
    const row = await this.getById(id)
    await runSql('DELETE FROM expenses WHERE id = ?', [id])
    return row
  },
}
