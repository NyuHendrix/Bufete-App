// Utilidades de formato — zona horaria America/Costa_Rica
import { differenceInCalendarDays, differenceInMinutes } from 'date-fns'

export const CR_TIMEZONE = 'America/Costa_Rica'

/** Convierte 'YYYY-MM-DD' en un Date LOCAL a medianoche (evita desfases de UTC) */
export const parseLocal = (dateStr) => {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Fecha legible en formato costarricense: 10 set 2026 */
export const formatDateCR = (dateStr, opts = {}) => {
  const d = parseLocal(dateStr)
  if (!d) return '—'
  // Intl no permite combinar `dateStyle` con day/month/year.
  const defaultOptions = Object.hasOwn(opts, 'dateStyle')
    ? {}
    : { day: 'numeric', month: 'short', year: 'numeric' }

  return new Intl.DateTimeFormat('es-CR', {
    timeZone: CR_TIMEZONE,
    ...defaultOptions,
    ...opts,
  }).format(d)
}

/** Formato de moneda costarricense: ₡1,250,000.00 */
export const formatCRC = (value) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)

export const toMinutes = (hora) => {
  const [h, m] = (hora || '00:00').split(':').map(Number)
  return h * 60 + m
}

/** Detecta si dos citas del mismo día se traslapan en horario */
export const citasSeTraslapa = (a, b) => {
  if (a.fecha !== b.fecha) return false
  if ((a.estado || '') === 'Cancelada' || (b.estado || '') === 'Cancelada') return false
  const iniA = toMinutes(a.hora)
  const finA = iniA + (a.duracionMin || 60)
  const iniB = toMinutes(b.hora)
  const finB = iniB + (b.duracionMin || 60)
  return iniA < finB && iniB < finA
}

/** ¿Está una cita dentro de las próximas N horas? */
export const esProxima24h = (fecha, hora, horas = 24) => {
  if (!fecha) return false
  const ahora = new Date()
  const inicio = parseLocal(fecha)
  inicio.setHours(...hora.split(':').map(Number), 0, 0)
  const diffMin = differenceInMinutes(inicio, ahora)
  return diffMin >= 0 && diffMin <= horas * 60
}

/** ¿Un pago está vencido más de N días y sigue con saldo pendiente? */
export const estaVencido = (pago, hoy = new Date(), dias = 30) => {
  if (pago.estado === 'Pagado' || !pago.fechaVencimiento) return false
  const venc = parseLocal(pago.fechaVencimiento)
  return differenceInCalendarDays(hoy, venc) > dias
}

export const saldoPendiente = (pago) => (pago.monto || 0) - (pago.montoPagado || 0)
