const CASE_STATUSES = ['Recepción', 'En revisión', 'Medidas cautelares', 'Tramitación', 'Finalizado']
const CASE_PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica']
const PARTY_ROLES = ['Cliente', 'Contraparte', 'Socio', 'Notario/Juzgado']
const SORT_FIELDS = new Set(['id', 'title', 'legalBranch', 'status', 'priority', 'createdAt', 'updatedAt', 'clientId'])

export class CaseServiceError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

function validateCase(caseRecord) {
  for (const field of ['id', 'clientId', 'title', 'legalBranch', 'createdAt', 'updatedAt']) {
    if (typeof caseRecord[field] !== 'string' || !caseRecord[field].trim()) {
      throw new CaseServiceError(`El campo ${field} es obligatorio`)
    }
  }
  if (!/^EXP-\d{4}-\d{4,}$/.test(caseRecord.id)) {
    throw new CaseServiceError('El ID debe tener el formato EXP-AAAA-NNNN')
  }
  if (!CASE_STATUSES.includes(caseRecord.status)) {
    throw new CaseServiceError(`Estado inválido. Valores permitidos: ${CASE_STATUSES.join(', ')}`)
  }
  if (!CASE_PRIORITIES.includes(caseRecord.priority)) {
    throw new CaseServiceError(`Prioridad inválida. Valores permitidos: ${CASE_PRIORITIES.join(', ')}`)
  }
  if (!Array.isArray(caseRecord.involvedParties)) {
    throw new CaseServiceError('involvedParties debe ser una lista')
  }

  caseRecord.involvedParties.forEach((party, index) => {
    if (!party || typeof party !== 'object' || Array.isArray(party)) {
      throw new CaseServiceError(`involvedParties[${index}] debe ser un objeto`)
    }
    for (const field of ['name', 'role', 'contactInfo']) {
      if (typeof party[field] !== 'string') {
        throw new CaseServiceError(`involvedParties[${index}].${field} debe ser texto`)
      }
    }
    if (!party.name.trim() || !PARTY_ROLES.includes(party.role)) {
      throw new CaseServiceError(`La parte ${index + 1} requiere un nombre y un rol válido`)
    }
  })
}

export function createCasesService(db) {
  const getCases = () => db.data.cases

  function assertClientExists(clientId) {
    const exists = db.data.clients?.some((client) => String(client.id) === clientId)
    if (!exists) throw new CaseServiceError(`No existe el cliente ${clientId}`)
  }

  function createId() {
    const year = new Date().getFullYear()
    const prefix = `EXP-${year}-`
    const highest = getCases().reduce((sequence, caseRecord) => {
      if (!caseRecord.id?.startsWith(prefix)) return sequence
      return Math.max(sequence, Number(caseRecord.id.slice(prefix.length)) || 0)
    }, 0)
    return `${prefix}${String(highest + 1).padStart(4, '0')}`
  }

  return {
    getAll({ page = '1', perPage = '10', legalBranch, status, priority, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
      let results = getCases()
      if (legalBranch) results = results.filter((caseRecord) => caseRecord.legalBranch === legalBranch)
      if (status) results = results.filter((caseRecord) => caseRecord.status === status)
      if (priority) results = results.filter((caseRecord) => caseRecord.priority === priority)

      const searchTerm = String(search).trim().toLocaleLowerCase('es')
      if (searchTerm) {
        results = results.filter((caseRecord) =>
          caseRecord.id.toLocaleLowerCase('es').includes(searchTerm) ||
          caseRecord.title.toLocaleLowerCase('es').includes(searchTerm)
        )
      }

      const sortField = SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt'
      const direction = sortOrder === 'asc' ? 1 : -1
      results = [...results].sort((first, second) =>
        String(first[sortField] ?? '').localeCompare(String(second[sortField] ?? ''), 'es', { numeric: true }) * direction
      )

      const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
      const pageSize = Math.min(100, Math.max(1, Number.parseInt(perPage, 10) || 10))
      const total = results.length
      const start = (currentPage - 1) * pageSize
      return {
        data: results.slice(start, start + pageSize),
        total,
        page: currentPage,
        perPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    },

    getById(id) {
      const caseRecord = getCases().find((item) => item.id === id)
      if (!caseRecord) throw new CaseServiceError('Expediente no encontrado', 404)
      return caseRecord
    },

    async create(payload) {
      const now = new Date().toISOString()
      const caseRecord = {
        ...payload,
        id: payload.id || createId(),
        clientId: String(payload.clientId ?? '').trim(),
        createdAt: payload.createdAt || now,
        updatedAt: now,
      }
      validateCase(caseRecord)
      assertClientExists(caseRecord.clientId)
      if (getCases().some((item) => item.id === caseRecord.id)) {
        throw new CaseServiceError(`Ya existe el expediente ${caseRecord.id}`, 409)
      }

      getCases().push(caseRecord)
      try {
        await db.write()
      } catch (error) {
        getCases().pop()
        throw error
      }
      return caseRecord
    },

    async update(id, changes) {
      const cases = getCases()
      const index = cases.findIndex((item) => item.id === id)
      if (index < 0) throw new CaseServiceError('Expediente no encontrado', 404)

      const current = cases[index]
      const caseRecord = {
        ...current,
        ...changes,
        id: current.id,
        clientId: String(changes.clientId ?? current.clientId).trim(),
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      }
      validateCase(caseRecord)
      assertClientExists(caseRecord.clientId)

      cases[index] = caseRecord
      try {
        await db.write()
      } catch (error) {
        cases[index] = current
        throw error
      }
      return caseRecord
    },

    async delete(id) {
      const cases = getCases()
      const index = cases.findIndex((item) => item.id === id)
      if (index < 0) throw new CaseServiceError('Expediente no encontrado', 404)

      const [deleted] = cases.splice(index, 1)
      try {
        await db.write()
      } catch (error) {
        cases.splice(index, 0, deleted)
        throw error
      }
      return deleted
    },
  }
}