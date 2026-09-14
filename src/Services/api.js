// Capa de servicios sobre json-server (todas las rutas pasan por el proxy /api)
import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

const makeApi = (resource) => ({
  getAll: (params) => http.get(`/${resource}`, { params }).then((r) => r.data),
  getById: (id) => http.get(`/${resource}/${id}`).then((r) => r.data),
  create: (data) => http.post(`/${resource}`, data).then((r) => r.data),
  update: (id, data) => http.put(`/${resource}/${id}`, data).then((r) => r.data),
  remove: (id) => http.delete(`/${resource}/${id}`).then((r) => r.data),
})

export const clientsApi = makeApi('clients')
export const appointmentsApi = makeApi('appointments')
export const paymentsApi = makeApi('payments')
export const expensesApi = makeApi('expenses')
