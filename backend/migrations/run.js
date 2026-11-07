import { initializeDatabase } from '../config/db.js'

try {
  await initializeDatabase(true)
  console.log('Database initialized successfully')
  process.exit(0)
} catch (error) {
  console.error('Database migration failed:', error)
  process.exit(1)
}
