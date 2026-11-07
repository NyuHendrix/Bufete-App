import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, AlertTriangle, Wallet, Clock4, Search, Users } from 'lucide-react'
import PaymentForm from './PaymentForm'
import PaymentHistory from './PaymentHistory'
import { formatCRC, saldoPendiente } from '../../utils/formatters'

const estadoServicio = (pago) => {
  const saldo = saldoPendiente(pago)
  return saldo <= 0 ? 'Pagado' : (pago.montoPagado || 0) > 0 ? 'Parcial' : 'Pendiente'
}

/** Página de pagos: resumen por cliente y acceso al detalle de cada servicio */
export default function PaymentTracker({ hook, clientes }) {
  const { data: pagos, loading, error, vencidos, create, update, remove } = hook
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState({ abierto: false, inicial: null })
  const [searchParams, setSearchParams] = useSearchParams()
  const clienteObjetivo = searchParams.get('clienteId')
  const pagoObjetivo = searchParams.get('pago')
  const estadoParam = searchParams.get('estado')
  const estadoActivo = ['Todos', 'Pendiente', 'Parcial', 'Pagado'].includes(estadoParam) ? estadoParam : 'Todos'

  const cuentas = useMemo(() => {
    const agrupadas = new Map()
    pagos.forEach((pago) => {
      const cuenta = agrupadas.get(pago.clientId) || { pagos: [], total: 0, abonado: 0, saldo: 0 }
      cuenta.pagos.push(pago)
      cuenta.total += Number(pago.monto) || 0
      cuenta.abonado += Number(pago.montoPagado) || 0
      cuenta.saldo += saldoPendiente(pago)
      agrupadas.set(pago.clientId, cuenta)
    })

    return [...agrupadas.entries()].map(([clientId, cuenta]) => {
      const cliente = clientes.find((c) => String(c.id) === String(clientId))
      const estado = cuenta.saldo <= 0 ? 'Pagado' : cuenta.abonado > 0 ? 'Parcial' : 'Pendiente'
      return { clientId, cliente, estado, ...cuenta }
    })
  }, [pagos, clientes])

  const clientesPorEstado = useMemo(() => ({
    Todos: cuentas.length,
    Pendiente: cuentas.filter((cuenta) => cuenta.pagos.some((pago) => estadoServicio(pago) === 'Pendiente')).length,
    Parcial: cuentas.filter((cuenta) => cuenta.pagos.some((pago) => estadoServicio(pago) === 'Parcial')).length,
    Pagado: cuentas.filter((cuenta) => cuenta.pagos.some((pago) => estadoServicio(pago) === 'Pagado')).length,
  }), [cuentas])

  const cuentasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-CR')
    return cuentas
      .filter((cuenta) => estadoActivo === 'Todos' || cuenta.pagos.some((pago) => estadoServicio(pago) === estadoActivo))
      .filter((cuenta) => !clienteObjetivo || String(cuenta.clientId) === clienteObjetivo)
      .filter((cuenta) => !texto || (cuenta.cliente?.nombre || 'Cliente').toLocaleLowerCase('es-CR').includes(texto))
      .sort((a, b) => (a.cliente?.nombre || '').localeCompare(b.cliente?.nombre || '', 'es'))
  }, [cuentas, busqueda, estadoActivo, clienteObjetivo])

  const cobradoMes = useMemo(() => {
    const hoy = new Date()
    const clave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
    return pagos.filter((p) => (p.fecha || '').startsWith(clave)).reduce((s, p) => s + (p.montoPagado || 0), 0)
  }, [pagos])

  const totalPendiente = pagos.reduce((total, pago) => total + saldoPendiente(pago), 0)
  const clientesConSaldo = cuentas.filter((cuenta) => cuenta.saldo > 0).length
  const guardar = (form) => (modal.inicial ? update(modal.inicial.id, form) : create(form))

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Wallet size={22} /></span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Cobrado este mes</p>
            <p className="text-xl font-bold text-slate-800">{formatCRC(cobradoMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock4 size={22} /></span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Saldo total por cobrar</p>
            <p className="text-xl font-bold text-slate-800">{formatCRC(totalPendiente)}</p>
          </div>
        </div>
        <div className={`card flex items-center gap-4 ${vencidos.length ? 'ring-2 ring-red-200' : ''}`}>
          <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${vencidos.length ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-700'}`}>
            {vencidos.length ? <AlertTriangle size={22} /> : <Users size={22} />}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">{vencidos.length ? 'Cobros vencidos +30 días' : 'Clientes con saldo pendiente'}</p>
            <p className="text-xl font-bold text-slate-800">{vencidos.length || clientesConSaldo}</p>
            {vencidos.length > 0 && <p className="text-xs text-red-500">Requieren seguimiento</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar cliente..." aria-label="Buscar cliente" />
        </label>
        <button className="btn-success sm:ml-auto" onClick={() => setModal({ abierto: true, inicial: null })}>
          <Plus size={16} /> Registrar cobro
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar clientes por estado de pago">
        {['Todos', 'Pendiente', 'Parcial', 'Pagado'].map((estado) => (
          <button
            key={estado}
            type="button"
            onClick={() => setSearchParams((actuales) => {
              const nuevos = new URLSearchParams(actuales)
              if (estado === 'Todos') nuevos.delete('estado')
              else nuevos.set('estado', estado)
              return nuevos
            })}
            aria-pressed={estadoActivo === estado}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${estadoActivo === estado ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-50'}`}
          >
            {estado} <span className={`ml-1 ${estadoActivo === estado ? 'text-slate-300' : 'text-slate-400'}`}>{clientesPorEstado[estado]}</span>
          </button>
        ))}
      </div>

      {error && <div className="card border-l-4 border-red-400 text-sm text-red-600">{error}</div>}
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Cargando pagos…</p>
      ) : (
        <PaymentHistory
          key={pagoObjetivo || 'todos'}
          cuentas={cuentasFiltradas}
          clientes={clientes}
          onEditar={(p) => setModal({ abierto: true, inicial: p })}
          onEliminar={(id) => remove(id)}
          pagoObjetivo={pagoObjetivo}
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
