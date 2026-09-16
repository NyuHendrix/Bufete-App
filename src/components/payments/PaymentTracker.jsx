import { useMemo, useState } from 'react'
import { Plus, AlertTriangle, Scale, Wallet, Clock4 } from 'lucide-react'
import PaymentForm from './PaymentForm'
import PaymentHistory from './PaymentHistory'
import { formatCRC } from '../../utils/formatters'

/** Página de pagos: resumen, filtros por período/estado/cliente y registro de cobros */
export default function PaymentTracker({ hook, clientes }) {
  const { data: pagos, loading, error, vencidos, create, update, remove } = hook
  const [filtros, setFiltros] = useState({ mes: '', estado: '', cliente: '' })
  const [modal, setModal] = useState({ abierto: false, inicial: null })

  const filtrados = useMemo(() => {
    return [...pagos]
      .filter((p) => !filtros.mes || (p.fecha || '').startsWith(filtros.mes))
      .filter((p) => !filtros.estado || p.estado === filtros.estado)
      .filter((p) => !filtros.cliente || p.clientId === Number(filtros.cliente))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [pagos, filtros])

  const cobradoMes = useMemo(() => {
    const clave = new Date().toISOString().slice(0, 7)
    return pagos.filter((p) => (p.fecha || '').startsWith(clave)).reduce((s, p) => s + (p.montoPagado || 0), 0)
  }, [pagos])

  const totalPendiente = pagos.reduce((s, p) => s + (p.monto - (p.montoPagado || 0)), 0)
  const setF = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }))
  const guardar = (form) => (modal.inicial ? update(modal.inicial.id, form) : create(form))

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet size={22} /></span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Cobrado este mes</p>
            <p className="text-xl font-bold text-slate-800">{formatCRC(cobradoMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Clock4 size={22} /></span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Saldo total por cobrar</p>
            <p className="text-xl font-bold text-slate-800">{formatCRC(totalPendiente)}</p>
          </div>
        </div>
        <div className={`card flex items-center gap-4 ${vencidos.length ? 'ring-2 ring-red-200' : ''}`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={22} /></span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Vencidos +30 días</p>
            <p className="text-xl font-bold text-slate-800">{vencidos.length}</p>
            {vencidos.length > 0 && <p className="text-xs text-red-500">Se resaltan en rojo en el historial</p>}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Scale size={16} className="text-slate-400" />
        <label className="text-xs font-semibold uppercase text-slate-500">Período</label>
        <input type="month" className="input !w-40" value={filtros.mes} onChange={setF('mes')} />
        <select className="input !w-44" value={filtros.estado} onChange={setF('estado')}>
          <option value="">Todos los estados</option>
          {['Pagado', 'Parcial', 'Pendiente'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input !w-56" value={filtros.cliente} onChange={setF('cliente')}>
          <option value="">Todos los clientes</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button className="btn-secondary !py-1.5 text-xs" onClick={() => setFiltros({ mes: '', estado: '', cliente: '' })}>Limpiar</button>
        <button className="btn-success ml-auto" onClick={() => setModal({ abierto: true, inicial: null })}>
          <Plus size={16} /> Registrar cobro
        </button>
      </div>

      {error && <div className="card border-l-4 border-red-400 text-sm text-red-600">{error}</div>}
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Cargando pagos…</p>
      ) : (
        <PaymentHistory
          pagos={filtrados}
          clientes={clientes}
          onEditar={(p) => setModal({ abierto: true, inicial: p })}
          onEliminar={(id) => remove(id)}
        />
      )}

      <PaymentForm
        key={`${modal.abierto}-${modal.inicial?.id ?? 'nuevo'}`}
        abierto={modal.abierto}
        inicial={modal.inicial}
        clientes={clientes}
        onGuardar={guardar}
        onCerrar={() => setModal({ abierto: false, inicial: null })}
      />
    </div>
  )
}
