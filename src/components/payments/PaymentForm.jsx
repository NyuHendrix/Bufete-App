import { useState } from 'react'
import { X } from 'lucide-react'

const VACIO = {
  clientId: '', concepto: '', monto: '', fecha: '', fechaVencimiento: '',
  metodo: 'Transferencia SINPE', estado: 'Pendiente', montoPagado: '', notas: '',
}
const METODOS = ['Efectivo', 'Transferencia SINPE', 'SINPE Móvil', 'Tarjeta']

/** Modal de registro/edición de cobro (moneda CRC) */
export default function PaymentForm({ abierto, inicial, clientes, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => (inicial ? { ...VACIO, ...inicial, monto: inicial.monto ?? '', montoPagado: inicial.montoPagado ?? '' } : VACIO))
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  if (!abierto) return null

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const estado = form.estado

  const validar = () => {
    const e = {}
    if (!form.clientId) e.clientId = 'Seleccione un cliente'
    if (!form.concepto.trim()) e.concepto = 'Ingrese el concepto'
    if (!(Number(form.monto) > 0)) e.monto = 'Monto inválido'
    if (!form.fecha) e.fecha = 'Seleccione la fecha'
    if (estado === 'Parcial') {
      const mp = Number(form.montoPagado)
      if (!(mp > 0) || mp >= Number(form.monto)) e.montoPagado = 'Abono debe ser mayor que 0 y menor que el monto'
    }
    if (estado !== 'Pagado' && !form.fechaVencimiento) e.fechaVencimiento = 'Indique la fecha de vencimiento'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      const monto = Number(form.monto)
      await onGuardar({
        ...form,
        clientId: Number(form.clientId),
        monto,
        montoPagado: estado === 'Pagado' ? monto : estado === 'Parcial' ? Number(form.montoPagado) : 0,
        metodo: estado === 'Pagado' ? form.metodo : null,
      })
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCerrar} />
      <form onSubmit={guardar} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{inicial ? 'Editar cobro' : 'Registrar cobro'}</h2>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Cliente *</label>
            <select className="input" value={form.clientId} onChange={set('clientId')}>
              <option value="">— Seleccionar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {errores.clientId && <p className="mt-1 text-xs text-red-500">{errores.clientId}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Concepto *</label>
            <input className="input" value={form.concepto} onChange={set('concepto')} placeholder="Honorarios profesionales" />
            {errores.concepto && <p className="mt-1 text-xs text-red-500">{errores.concepto}</p>}
          </div>
          <div>
            <label className="label">Monto (₡) *</label>
            <input className="input" type="number" min="0" step="500" value={form.monto} onChange={set('monto')} placeholder="250000" />
            {errores.monto && <p className="mt-1 text-xs text-red-500">{errores.monto}</p>}
          </div>
          <div>
            <label className="label">Fecha *</label>
            <input className="input" type="date" value={form.fecha} onChange={set('fecha')} />
            {errores.fecha && <p className="mt-1 text-xs text-red-500">{errores.fecha}</p>}
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.estado} onChange={set('estado')}>
              {['Pagado', 'Parcial', 'Pendiente'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {estado === 'Pagado' && (
            <div>
              <label className="label">Método de pago</label>
              <select className="input" value={form.metodo} onChange={set('metodo')}>
                {METODOS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          )}
          {estado === 'Parcial' && (
            <div>
              <label className="label">Monto abonado (₡)</label>
              <input className="input" type="number" min="0" step="500" value={form.montoPagado} onChange={set('montoPagado')} placeholder="100000" />
              {errores.montoPagado && <p className="mt-1 text-xs text-red-500">{errores.montoPagado}</p>}
            </div>
          )}
          {estado !== 'Pagado' && (
            <div>
              <label className="label">Fecha de vencimiento *</label>
              <input className="input" type="date" value={form.fechaVencimiento} onChange={set('fechaVencimiento')} />
              {errores.fechaVencimiento && <p className="mt-1 text-xs text-red-500">{errores.fechaVencimiento}</p>}
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label">Notas</label>
            <input className="input" value={form.notas} onChange={set('notas')} placeholder="Observaciones del cobro" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" data-sound="success" className="btn-success" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cobro'}
          </button>
        </div>
      </form>
    </div>
  )
}
