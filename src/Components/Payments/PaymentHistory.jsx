import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { formatCRC, formatDateCR, estaVencido } from '../../Utils/formatters'

const ESTILO_PAGO = {
  Pagado: 'bg-emerald-50 text-emerald-700',
  Parcial: 'bg-amber-50 text-amber-700',
  Pendiente: 'bg-red-50 text-red-700',
}

export default function PaymentHistory({ pagos, clientes, onEditar, onEliminar }) {
  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre || 'Cliente'

  return (
    <div className="card overflow-x-auto p-0">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="th">Fecha</th>
            <th className="th">Cliente</th>
            <th className="th">Concepto</th>
            <th className="th text-right">Monto</th>
            <th className="th text-right">Abonado</th>
            <th className="th text-right">Saldo</th>
            <th className="th">Método</th>
            <th className="th">Estado</th>
            <th className="th text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagos.map((p) => {
            const vencido = estaVencido(p)
            return (
              <tr key={p.id} className={vencido ? 'bg-red-50/40' : 'hover:bg-slate-50'}>
                <td className="td whitespace-nowrap">{formatDateCR(p.fecha)}</td>
                <td className="td max-w-[180px] truncate font-medium">{nombreCliente(p.clientId)}</td>
                <td className="td max-w-[160px] truncate">{p.concepto}</td>
                <td className="td text-right font-semibold">{formatCRC(p.monto)}</td>
                <td className="td text-right">{formatCRC(p.montoPagado || 0)}</td>
                <td className={`td text-right font-semibold ${p.monto - (p.montoPagado || 0) > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                  {formatCRC(p.monto - (p.montoPagado || 0))}
                </td>
                <td className="td whitespace-nowrap">{p.metodo || '—'}</td>
                <td className="td">
                  <span className={`badge ${ESTILO_PAGO[p.estado]} ${vencido ? 'ring-1 ring-red-300' : ''}`}>
                    {vencido && <AlertTriangle size={11} className="mr-1" />}
                    {p.estado}
                  </span>
                </td>
                <td className="td">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEditar(p)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600" title="Editar">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onEliminar(p.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {pagos.length === 0 && (
            <tr><td colSpan={9} className="py-10 text-center text-sm text-slate-400">No hay cobros que coincidan con los filtros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
