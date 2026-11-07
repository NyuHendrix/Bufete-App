import { casesApi, clientsApi } from './api'

const CASE_STATUSES = ['Recepción', 'En revisión', 'Medidas cautelares', 'Tramitación', 'Finalizado']
const CASE_PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica']
const PARTY_ROLES = ['Cliente', 'Contraparte', 'Socio', 'Notario/Juzgado']
const SORT_FIELDS = new Set(['id', 'title', 'legalBranch', 'status', 'priority', 'createdAt', 'updatedAt', 'clientId'])

function validateCase(caseRecord) {
  for (const field of ['clientId', 'title', 'legalBranch']) {
    if (typeof caseRecord[field] !== 'string' || !caseRecord[field].trim()) {
      throw new Error(`El campo ${field} es obligatorio`)
    }
  }

  if (!CASE_STATUSES.includes(caseRecord.status)) {
    throw new Error(`Estado inválido. Valores permitidos: ${CASE_STATUSES.join(', ')}`)
  }
  if (!CASE_PRIORITIES.includes(caseRecord.priority)) {
    throw new Error(`Prioridad inválida. Valores permitidos: ${CASE_PRIORITIES.join(', ')}`)
  }
  if (!Array.isArray(caseRecord.involvedParties)) {
    throw new Error('involvedParties debe ser una lista')
  }

  caseRecord.involvedParties.forEach((party, index) => {
    if (!party || typeof party !== 'object' || Array.isArray(party)) {
      throw new Error(`involvedParties[${index}] debe ser un objeto`)
    }
    for (const field of ['name', 'role', 'contactInfo']) {
      if (typeof party[field] !== 'string') {
        throw new Error(`involvedParties[${index}].${field} debe ser texto`)
      }
    }
    if (!party.name.trim() || !PARTY_ROLES.includes(party.role)) {
      throw new Error(`La parte ${index + 1} requiere un nombre y un rol válido`)
    }
  })
}

async function assertClientExists(clientId) {
  try {
    await clientsApi.getById(clientId)
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`No existe el cliente ${clientId}`, { cause: error })
    }
    throw error
  }
}

export async function getAllCases({
  page = 1,
  perPage = 10,
  legalBranch,
  status,
  priority,
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) {
  const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(perPage, 10) || 10))
  return casesApi.getAll({
    page: requestedPage,
    perPage: pageSize,
    legalBranch,
    status,
    priority,
    search: String(search).trim(),
    sortBy: SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
  })
}

export function getCaseById(id) {
  return casesApi.getById(id)
}

export async function createCase(payload) {
  const now = new Date().toISOString()
  const caseRecord = {
    ...payload,
    clientId: String(payload.clientId ?? '').trim(),
    createdAt: payload.createdAt || now,
    updatedAt: now,
  }

  if (caseRecord.id && !/^EXP-\d{4}-\d{4,}$/.test(caseRecord.id)) {
    throw new Error('El ID debe tener el formato EXP-AAAA-NNNN')
  }
  validateCase(caseRecord)
  await assertClientExists(caseRecord.clientId)
  return casesApi.create(caseRecord)
}

export async function updateCase(id, changes) {
  const current = await casesApi.getById(id)
  const caseRecord = {
    ...current,
    ...changes,
    id: current.id,
    clientId: String(changes.clientId ?? current.clientId).trim(),
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }

  validateCase(caseRecord)
  await assertClientExists(caseRecord.clientId)
  return casesApi.update(id, caseRecord)
}

export function deleteCase(id) {
  return casesApi.remove(id)
}

export const casesService = {
  getAll: getAllCases,
  getById: getCaseById,
  create: createCase,
  update: updateCase,
  delete: deleteCase,
}
