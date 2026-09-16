import { AlertTriangle, CalendarClock, Handshake } from 'lucide-react'
import { formatDateCR, formatCRC } from '../../utils/formatters'

/**
 * Panel centralizado de alertas:
 * 1) Citas en las próximas 24 h
 * 2) Pagos vencidos más de 30 días
 * 3) Conflictos de agenda detectados
 */
export default function AlertsPanel({ citas24h, pagosVencidos, conflictos, clientes }) {
  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre || 'Cliente'

  return (
    <section className="card">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-amber-500" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Alertas del sistema</h2>
      </div>

      {citas24h.length === 0 && pagosVencidos.length === 0 && conflictos.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-400">Sin alertas activas. Todo bajo control.</p>
      )}

      <ul className="space-y-2.5 text-sm">
        {citas24h.map((a) => (
          <li key={`c${a.id}`} className="flex items-start gap-3 rounded-lg bg-brand-50 p-3">
            <CalendarClock size={16} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="font-semibold text-brand-800">
                Cita en menos de 24 h — {nombreCliente(a.clientId)}
              </p>
              <p className="text-xs text-brand-700">
                {formatDateCR(a.fecha)} a las {a.hora} · {a.tipo}
              </p>
            </div>
          </li>
        ))}

        {pagosVencidos.map((p) => (
          <li key={`p${p.id}`} className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">
                Pago vencido +30 días — {nombreCliente(p.clientId)}
              </p>
              <p className="text-xs text-red-600">
                {p.concepto}: saldo pendiente {formatCRC(p.monto - (p.montoPagado || 0))}
              </p>
            </div>
          </li>
        ))}

        {conflictos.map(([a, b], i) => (
          <li key={`x${i}`} className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
            <Handshake size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Conflicto de agenda detectado</p>
              <p className="text-xs text-amber-700">
                {formatDateCR(a.fecha)}: {a.hora} ({nombreCliente(a.clientId)}) traslapa con {b.hora} ({nombreCliente(b.clientId)})
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
