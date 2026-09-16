import { CalendarClock, AlertTriangle, Banknote, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCRC } from '../../utils/formatters'

function StatCard({ icon: Icon, titulo, valor, detalle, color, to }) {
  return (
    <Link
      to={to}
      className="card flex items-start gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      aria-label={`Ver ${titulo}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
        <p className="mt-1 truncate text-xl font-bold text-slate-800">{valor}</p>
        {detalle && <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>}
      </div>
    </Link>
  )
}

export default function DashboardStats({ citasProximas, pagosPendientes, vencidos, ingresosMes, nombreMes }) {
  const totalPendiente = pagosPendientes.reduce((s, p) => s + (p.monto - (p.montoPagado || 0)), 0)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={CalendarClock}
        titulo="Citas próximas (24 h)"
        valor={citasProximas.length}
        detalle={citasProximas.length ? `${citasProximas[0].hora} — primera cita` : 'Sin citas en las próximas 24 h'}
        color="bg-brand-50 text-brand-600"
        to="/citas"
      />
      <StatCard
        icon={Banknote}
        titulo="Pagos por cobrar"
        valor={formatCRC(totalPendiente)}
        detalle={`${pagosPendientes.length} movimiento(s) pendiente(s)`}
        color="bg-amber-50 text-amber-600"
        to="/pagos"
      />
      <StatCard
        icon={TrendingUp}
        titulo={`Ingresos ${nombreMes}`}
        valor={formatCRC(ingresosMes)}
        detalle="Cobros registrados del mes"
        color="bg-emerald-50 text-emerald-600"
        to="/pagos"
      />
      <StatCard
        icon={AlertTriangle}
        titulo="Pagos vencidos +30 días"
        valor={vencidos.length}
        detalle={vencidos.length ? 'Requieren gestión de cobro' : 'Al día con los cobros'}
        color={vencidos.length ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}
        to="/pagos"
      />
    </div>
  )
}
