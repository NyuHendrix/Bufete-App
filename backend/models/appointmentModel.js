import { query, queryOne, runSql } from '../config/db.js'

export const appointmentModel = {
  async list() {
    return query('SELECT * FROM appointments ORDER BY fecha DESC, hora DESC')
  },

  async getById(id) {
    return queryOne('SELECT * FROM appointments WHERE id = ?', [id])
  },

  async create(payload) {
    const result = await runSql(
      `INSERT INTO appointments (client_id, fecha, hora, duracion_min, tipo, estado, notas, recordatorio, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        payload.client_id ?? payload.clientId,
        payload.fecha,
        payload.hora,
        payload.duracionMin ?? payload.duracion_min ?? 60,
        payload.tipo,
        payload.estado || 'Programada',
        payload.notas || '',
        payload.recordatorio ? 1 : 0,
      ],
    )
    return this.getById(result.lastID)
  },

  async update(id, payload) {
    await runSql(
      `UPDATE appointments SET client_id = ?, fecha = ?, hora = ?, duracion_min = ?, tipo = ?, estado = ?, notas = ?, recordatorio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        payload.client_id ?? payload.clientId,
        payload.fecha,
        payload.hora,
        payload.duracionMin ?? payload.duracion_min ?? 60,
        payload.tipo,
        payload.estado || 'Programada',
        payload.notas || '',
        payload.recordatorio ? 1 : 0,
        id,
      ],
    )
    return this.getById(id)
  },

  async remove(id) {
    const row = await this.getById(id)
    await runSql('DELETE FROM appointments WHERE id = ?', [id])
    return row
  },
}
