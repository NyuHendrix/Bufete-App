import { query, queryOne, runSql } from '../config/db.js'

export const paymentModel = {
  async list() {
    return query('SELECT * FROM payments ORDER BY fecha_vencimiento DESC')
  },

  async getById(id) {
    return queryOne('SELECT * FROM payments WHERE id = ?', [id])
  },

  async create(payload) {
    const result = await runSql(
      `INSERT INTO payments (client_id, concepto, monto, monto_pagado, estado, fecha_vencimiento, fecha_pago, nota, metodo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        payload.client_id ?? payload.clientId,
        payload.concepto,
        Number(payload.monto || 0),
        Number(payload.montoPagado ?? payload.monto_pagado ?? 0),
        payload.estado || 'Pendiente',
        payload.fechaVencimiento || payload.fecha_vencimiento || null,
        payload.fechaPago || payload.fecha_pago || null,
        payload.notas || payload.nota || null,
        payload.metodo || null,
      ],
    )
    return this.getById(result.lastID)
  },

  async update(id, payload) {
    await runSql(
      `UPDATE payments SET client_id = ?, concepto = ?, monto = ?, monto_pagado = ?, estado = ?, fecha_vencimiento = ?, fecha_pago = ?, nota = ?, metodo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        payload.client_id ?? payload.clientId,
        payload.concepto,
        Number(payload.monto || 0),
        Number(payload.montoPagado ?? payload.monto_pagado ?? 0),
        payload.estado || 'Pendiente',
        payload.fechaVencimiento || payload.fecha_vencimiento || null,
        payload.fechaPago || payload.fecha_pago || null,
        payload.notas || payload.nota || null,
        payload.metodo || null,
        id,
      ],
    )
    return this.getById(id)
  },

  async remove(id) {
    const row = await this.getById(id)
    await runSql('DELETE FROM payments WHERE id = ?', [id])
    return row
  },
}
