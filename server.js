import { resolve } from 'node:path'
import process from 'node:process'
import { App } from '@tinyhttp/app'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { json } from 'milliparsec'
import { createApp } from 'json-server/lib/app.js'
import { CaseServiceError, createCasesService } from './server/cases.service.js'

const database = new Low(new JSONFile(resolve(process.cwd(), 'db.json')), {})
await database.read()
if (!Array.isArray(database.data.cases)) {
  database.data.cases = []
  await database.write()
}

const cases = createCasesService(database)
const app = new App()
const parseJson = json()

function route(action) {
  return async (request, response, next) => {
    try {
      const result = await action(request)
      if (request.method === 'POST') response.status(201)
      response.json(result)
    } catch (error) {
      if (error instanceof CaseServiceError) {
        response.status(error.status).json({ error: error.message })
        return
      }
      next(error)
    }
  }
}

app.get('/cases', route((request) => {
  const params = new URL(request.url, 'http://localhost').searchParams
  return cases.getAll(Object.fromEntries(params))
}))
app.get('/cases/:id', route((request) => cases.getById(request.params.id)))
app.post('/cases', parseJson, route((request) => cases.create(request.body)))
app.put('/cases/:id', parseJson, route((request) => cases.update(request.params.id, request.body)))
app.patch('/cases/:id', parseJson, route((request) => cases.update(request.params.id, request.body)))
app.delete('/cases/:id', route((request) => cases.delete(request.params.id)))

app.use(createApp(database, { logger: false }))
const port = Number(process.env.PORT || 3001)
app.listen(port, () => console.log(`API lista en http://localhost:${port}`))