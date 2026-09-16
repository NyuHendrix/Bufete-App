import { CalendarDays, Banknote, UserPlus } from 'lucide-react'
import { formatDateCR, formatCRC, parseLocal } from '../../utils/formatters'

/** Actividad reciente: últimas citas + pagos + clientes ordenados por fecha */
export default function RecentActivity({ citas, pagos, clientes }) {
  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre || 'Cliente'

  const actividades = [
    ...pagos.map((p) => ({
      id: `p${p.id}`, fecha: p.fecha, icon: Banknote,
      titulo: `Pago ${p.estado.toLowerCase()} — ${p.concepto}`,
      detalle: `${nombreCliente(p.clientId)} · ${formatCRC(p.montoPagado || 0)}${p.estado !== 'Pagado' ? ` de ${formatCRC(p.monto)}` : ''}`,
      color: p.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
    })),
    ...citas.map((a) => ({
      id: `a${a.id}`, fecha: a.fecha, icon: CalendarDays,
      titulo: `Cita ${a.estado.toLowerCase()} — ${a.tipo}`,
      detalle: `${nombreCliente(a.clientId)} · ${formatDateCR(a.fecha)} ${a.hora}`,
      color: 'bg-brand-50 text-brand-600',
    })),
    ...clientes.map((c) => ({
      id: `c${c.id}`, fecha: c.fechaRegistro, icon: UserPlus,
      titulo: 'Cliente registrado',
      detalle: `${c.nombre} · ${c.tipoCaso}`,
      color: 'bg-slate-100 text-slate-600',
    })),
  ]
    .sort((x, y) => parseLocal(y.fecha) - parseLocal(x.fecha))
    .slice(0, 8)

  return (
    <section className="card">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">Actividad reciente</h2>
      <ul className="space-y-3">
        {actividades.map((a) => (
          <li key={a.id} className="flex items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
              <a.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">{a.titulo}</p>
              <p className="truncate text-xs text-slate-500">{a.detalle}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{formatDateCR(a.fecha)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
