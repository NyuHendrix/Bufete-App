// Normaliza el contrato SQL (snake_case) al formato camelCase que consume React.
import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

const API_FIELDS = {
  clientId: 'client_id',
  tipoCaso: 'tipo_caso',
  casoDescripcion: 'caso_descripcion',
  estadoCaso: 'estado_caso',
  fechaRegistro: 'fecha_registro',
  duracionMin: 'duracion_min',
  montoPagado: 'monto_pagado',
  fechaVencimiento: 'fecha_vencimiento',
  legalBranch: 'legal_branch',
  contactInfo: 'contact_info',
}

function fromApi(value, resource) {
  if (Array.isArray(value)) return value.map((item) => fromApi(item, resource))
  if (!value || typeof value !== 'object') return value

  const result = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      fromApi(item, resource),
    ]),
  )

  if (resource === 'payments') {
    if (result.fechaPago !== undefined) {
      result.fecha = result.fechaPago
      delete result.fechaPago
    }
    if (result.nota !== undefined) {
      result.notas = result.nota
      delete result.nota
    }
  }
  if (resource === 'appointments' && result.recordatorio !== undefined) {
    result.recordatorio = Boolean(result.recordatorio)
  }
  return result
}

function toApi(value, resource) {
  if (Array.isArray(value)) return value.map((item) => toApi(item, resource))
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const field = resource === 'payments' && key === 'fecha'
        ? 'fecha_pago'
        : resource === 'payments' && key === 'notas'
          ? 'nota'
          : API_FIELDS[key] || key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      return [field, toApi(item, resource)]
    }),
  )
}

const makeApi = (resource) => ({
  getAll: (params) => http.get(`/${resource}`, { params }).then((r) => fromApi(r.data, resource)),
  getById: (id) => http.get(`/${resource}/${id}`).then((r) => fromApi(r.data, resource)),
  create: (data) => http.post(`/${resource}`, toApi(data, resource)).then((r) => fromApi(r.data, resource)),
  update: (id, data) => http.put(`/${resource}/${id}`, toApi(data, resource)).then((r) => fromApi(r.data, resource)),
  remove: (id) => http.delete(`/${resource}/${id}`).then((r) => fromApi(r.data, resource)),
})

export const clientsApi = makeApi('clients')
export const casesApi = makeApi('cases')
export const appointmentsApi = makeApi('appointments')
export const paymentsApi = makeApi('payments')
export const expensesApi = makeApi('expenses')
