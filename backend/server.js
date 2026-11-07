import app from './app.js'
import env from './config/env.js'
import { initializeDatabase } from './config/db.js'

async function startServer() {
  await initializeDatabase(false)
  app.listen(env.PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${env.PORT}`)
  })
}

startServer().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error)
  process.exit(1)
})