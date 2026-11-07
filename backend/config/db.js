import fs from 'node:fs'
import path from 'node:path'
import sqlite3 from 'sqlite3'
import env from './env.js'

const databasePath = path.resolve(process.cwd(), env.DB_PATH)
const databaseDirectory = path.dirname(databasePath)

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true })
}

export let db = new sqlite3.Database(databasePath)

const execute = (fn, sql, params = []) => new Promise((resolve, reject) => {
  fn.call(db, sql, params, function onComplete(error, rows) {
    if (error) {
      reject(error)
      return
    }
    if (this && 'lastID' in this) {
      resolve({ lastID: this.lastID, changes: this.changes })
      return
    }
    resolve(rows)
  })
})

export const runSql = (sql, params = []) => execute(db.run.bind(db), sql, params)
export const query = (sql, params = []) => execute(db.all.bind(db), sql, params)

export const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params)
  return rows[0] || null
}

export async function initializeDatabase(reset = false) {
  if (reset) {
    await new Promise((resolve) => {
      db.close(() => resolve())
    }).catch(() => undefined)

    if (fs.existsSync(databasePath)) {
      fs.unlinkSync(databasePath)
    }

    db = new sqlite3.Database(databasePath)
  }

  const migrationSql = fs.readFileSync(new URL('../migrations/001_init.sql', import.meta.url), 'utf8')
  await new Promise((resolve, reject) => {
    db.exec(migrationSql, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

  const paymentColumns = await query('PRAGMA table_info(payments)')
  if (!paymentColumns.some((column) => column.name === 'metodo')) {
    await runSql('ALTER TABLE payments ADD COLUMN metodo TEXT')
  }

  return db
}
