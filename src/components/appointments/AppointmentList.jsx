import { Pencil, Trash2, BellRing } from 'lucide-react'
import { formatDateCR, esProxima24h } from '../../utils/formatters'

const ESTILO_ESTADO = {
  Programada: 'bg-brand-50 text-brand-700',
  Completada: 'bg-emerald-50 text-emerald-700',
  Cancelada: 'bg-slate-100 text-slate-500',
}
const COLOR_TIPO = {
  Consulta: 'bg-brand-100 text-brand-700',
  Audiencia: 'bg-violet-100 text-violet-700',
  Firma: 'bg-emerald-100 text-emerald-700',
  'Notaría': 'bg-amber-100 text-amber-700',
  Seguimiento: 'bg-slate-200 text-slate-600',
}

export default function AppointmentList({ citas, clientes, titulo, onEditar, onEliminar }) {
  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre || 'Cliente'

  if (citas.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No hay citas para mostrar.</p>
  }

  return (
    <div className="card p-0">
      {titulo && (
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{titulo}</h3>
        </div>
      )}
      <ul className="divide-y divide-slate-100">
        {citas.map((a) => {
          const proxima = esProxima24h(a.fecha, a.hora, 24)
          return (
            <li key={a.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 ${proxima ? 'bg-brand-50/50' : ''}`}>
              <div className="w-16 text-center">
                <p className="text-lg font-bold leading-tight text-slate-800">{a.hora}</p>
                <p className="text-[11px] text-slate-400">{a.duracionMin} min</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
                  {nombreCliente(a.clientId)}
                  {proxima && a.estado === 'Programada' && (
                    <span className="badge bg-amber-100 text-amber-700"><BellRing size={11} className="mr-1" /> &lt; 24 h</span>
                  )}
                  {a.recordatorio && a.estado === 'Programada' && (
                    <span className="badge bg-slate-100 text-slate-500"><BellRing size={11} className="mr-1" /> Recordatorio</span>
                  )}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {formatDateCR(a.fecha)} · {a.notas || 'Sin notas'}
                </p>
              </div>
              <span className={`badge ${COLOR_TIPO[a.tipo] || 'bg-slate-100 text-slate-600'}`}>{a.tipo}</span>
              <span className={`badge ${ESTILO_ESTADO[a.estado]}`}>{a.estado}</span>
              <div className="flex gap-1">
                <button onClick={() => onEditar(a)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600" title="Editar">
                  <Pencil size={15} />
                </button>
                <button onClick={() => onEliminar(a.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
