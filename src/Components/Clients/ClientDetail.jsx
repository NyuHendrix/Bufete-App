import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, FileText, CalendarDays } from 'lucide-react'
import { formatCRC, formatDateCR } from '../../Utils/formatters'

const ESTILO_PAGO = {
  Pagado: 'bg-emerald-50 text-emerald-700',
  Parcial: 'bg-amber-50 text-amber-700',
  Pendiente: 'bg-red-50 text-red-700',
}

/** Ficha completa: datos del cliente + historial de citas y pagos */
export default function ClientDetail({ clientes, citas, pagos }) {
  const { id } = useParams()
  const cliente = clientes.find((c) => c.id === Number(id))

  if (!cliente) {
    return (
      <div className="card text-center">
        <p className="text-sm text-slate-500">Cliente no encontrado.</p>
        <Link to="/clientes" className="btn-secondary mt-4">Volver al listado</Link>
      </div>
    )
  }

  const citasCliente = citas.filter((a) => a.clientId === cliente.id)
  const pagosCliente = pagos.filter((p) => p.clientId === cliente.id)
  const totalPagado = pagosCliente.reduce((s, p) => s + (p.montoPagado || 0), 0)
  const totalPendiente = pagosCliente.reduce((s, p) => s + (p.monto - (p.montoPagado || 0)), 0)

  return (
    <div className="space-y-4">
      <Link to="/clientes" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{cliente.nombre}</h2>
            <p className="text-sm text-slate-500">Cédula {cliente.cedula} · Caso {cliente.tipoCaso} ({cliente.estadoCaso})</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs uppercase text-slate-400">Total pagado</p>
              <p className="text-lg font-bold text-emerald-600">{formatCRC(totalPagado)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Pendiente</p>
              <p className={`text-lg font-bold ${totalPendiente > 0 ? 'text-red-600' : 'text-slate-400'}`}>{formatCRC(totalPendiente)}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <p className="flex items-center gap-2"><Phone size={15} className="text-slate-400" /> {cliente.telefono}</p>
          <p className="flex items-center gap-2"><Mail size={15} className="text-slate-400" /> {cliente.email || '—'}</p>
          <p className="flex items-center gap-2"><MapPin size={15} className="text-slate-400" /> {cliente.direccion || '—'}</p>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-slate-700"><FileText size={15} /> {cliente.casoDescripcion}</p>
          <p className="mt-1 text-xs text-slate-400">Cliente desde {formatDateCR(cliente.fechaRegistro)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <CalendarDays size={16} className="text-brand-500" /> Historial de citas ({citasCliente.length})
          </h3>
          <ul className="space-y-2">
            {citasCliente.sort((a, b) => b.fecha.localeCompare(a.fecha)).map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{a.tipo} · {a.hora}</p>
                  <p className="text-xs text-slate-400">{formatDateCR(a.fecha)}{a.notas ? ` — ${a.notas}` : ''}</p>
                </div>
                <span className={`badge ${a.estado === 'Programada' ? 'bg-brand-50 text-brand-700' : a.estado === 'Completada' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {a.estado}
                </span>
              </li>
            ))}
            {citasCliente.length === 0 && <p className="py-4 text-center text-xs text-slate-400">Sin citas registradas.</p>}
          </ul>
        </section>

        <section className="card">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <FileText size={16} className="text-emerald-500" /> Historial de pagos ({pagosCliente.length})
          </h3>
          <ul className="space-y-2">
            {pagosCliente.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{p.concepto}</p>
                  <p className="text-xs text-slate-400">
                    {formatCRC(p.montoPagado || 0)} de {formatCRC(p.monto)}
                    {p.fechaVencimiento ? ` · vence ${formatDateCR(p.fechaVencimiento)}` : ''}
                  </p>
                </div>
                <span className={`badge ${ESTILO_PAGO[p.estado]}`}>{p.estado}</span>
              </li>
            ))}
            {pagosCliente.length === 0 && <p className="py-4 text-center text-xs text-slate-400">Sin pagos registrados.</p>}
          </ul>
        </section>
      </div>
    </div>
  )
}
