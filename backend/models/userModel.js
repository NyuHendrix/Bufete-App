import bcrypt from 'bcryptjs'
import { query, queryOne, runSql } from '../config/db.js'

export const userModel = {
  async findById(id) {
    return queryOne('SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?', [id])
  },

  async findByEmail(email) {
    return queryOne('SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?', [email])
  },

  async create({ name, email, password, roleName = 'admin' }) {
    const role = await queryOne('SELECT id FROM roles WHERE name = ?', [roleName])
    if (!role) {
      throw new Error(`Role not found: ${roleName}`)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const result = await runSql(
      'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role.id],
    )

    return this.findById(result.lastID)
  },

  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash)
  },

  async list() {
    return query('SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.id DESC')
  },
}
