import { query, queryOne, runSql } from '../config/db.js'

export const clientModel = {
  async list() {
    return query('SELECT * FROM clients ORDER BY id DESC')
  },

  async getById(id) {
    return queryOne('SELECT * FROM clients WHERE id = ?', [id])
  },

  async create(payload) {
    const result = await runSql(
      `INSERT INTO clients (nombre, cedula, telefono, email, direccion, tipo_caso, caso_descripcion, estado_caso, fecha_registro, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        payload.nombre,
        payload.cedula || null,
        payload.telefono || null,
        payload.email || null,
        payload.direccion || null,
        payload.tipoCaso || payload.tipo_caso || null,
        payload.casoDescripcion || payload.caso_descripcion || null,
        payload.estadoCaso || payload.estado_caso || 'Activo',
        payload.fechaRegistro || payload.fecha_registro || new Date().toISOString().slice(0, 10),
      ],
    )
    return this.getById(result.lastID)
  },

  async update(id, payload) {
    await runSql(
      `UPDATE clients SET
        nombre = ?, cedula = ?, telefono = ?, email = ?, direccion = ?, tipo_caso = ?, caso_descripcion = ?, estado_caso = ?, fecha_registro = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        payload.nombre,
        payload.cedula || null,
        payload.telefono || null,
        payload.email || null,
        payload.direccion || null,
        payload.tipoCaso || payload.tipo_caso || null,
        payload.casoDescripcion || payload.caso_descripcion || null,
        payload.estadoCaso || payload.estado_caso || 'Activo',
        payload.fechaRegistro || payload.fecha_registro || new Date().toISOString().slice(0, 10),
        id,
      ],
    )
    return this.getById(id)
  },

  async remove(id) {
    const row = await this.getById(id)
    await runSql('DELETE FROM clients WHERE id = ?', [id])
    return row
  },
}
