import { useState } from 'react'
import { X, AlertTriangle, UserPlus } from 'lucide-react'
import { citasSeTraslapa } from '../../utils/formatters'

const VACIO = {
  clientId: '', fecha: '', hora: '09:00', duracionMin: 60, tipo: 'Consulta',
  estado: 'Programada', notas: '', recordatorio: true,
}
const TIPOS = ['Consulta', 'Audiencia', 'Firma', 'Notaría', 'Seguimiento']

/** Modal de cita con validación anti-conflictos en tiempo real */
export default function AppointmentForm({ abierto, inicial, clientes, citas, clientePreseleccionado, onClienteSeleccionado, onNuevoCliente, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => (inicial ? { ...VACIO, ...inicial } : VACIO))
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  if (!abierto) return null

  const set = (campo) => (e) => {
    if (campo === 'clientId') onClienteSeleccionado?.()
    setForm((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  const clientId = clientePreseleccionado ? String(clientePreseleccionado) : form.clientId

  // Candidata de prueba para detectar traslapes con la agenda actual
  const conflicto = citas.some(
    (a) => a.id !== (inicial?.id ?? -1) && citasSeTraslapa(a, { ...form, duracionMin: Number(form.duracionMin) })
  )

  const validar = () => {
    const e = {}
    if (!clientId) e.clientId = 'Seleccione un cliente'
    if (!form.fecha) e.fecha = 'Seleccione una fecha'
    if (!form.hora) e.hora = 'Seleccione una hora'
    if (conflicto) e.conflicto = 'El horario se traslapa con otra cita. Ajuste la hora o la duración.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      await onGuardar({ ...form, clientId: Number(clientId), duracionMin: Number(form.duracionMin) })
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  const citasDelDia = form.fecha
    ? citas.filter((a) => a.fecha === form.fecha && a.id !== (inicial?.id ?? -1) && a.estado !== 'Cancelada')
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCerrar} />
      <form onSubmit={guardar} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{inicial ? 'Editar cita' : 'Nueva cita'}</h2>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Cerrar"><X size={18} /></button>
        </div>

        {conflicto && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <p>{errores.conflicto || 'Este horario se traslapa con otra cita del mismo día.'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between gap-3">
              <label className="label !mb-0">Cliente *</label>
              <button
                type="button"
                onClick={onNuevoCliente}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <UserPlus size={14} /> Agregar cliente
              </button>
            </div>
            <select className="input" value={clientId} onChange={set('clientId')}>
              <option value="">— Seleccionar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {errores.clientId && <p className="mt-1 text-xs text-red-500">{errores.clientId}</p>}
          </div>
          <div>
            <label className="label">Fecha *</label>
            <input type="date" className="input" value={form.fecha} onChange={set('fecha')} />
            {errores.fecha && <p className="mt-1 text-xs text-red-500">{errores.fecha}</p>}
          </div>
          <div>
            <label className="label">Hora *</label>
            <input type="time" className="input" value={form.hora} onChange={set('hora')} />
            {errores.hora && <p className="mt-1 text-xs text-red-500">{errores.hora}</p>}
          </div>
          <div>
            <label className="label">Duración</label>
            <select className="input" value={form.duracionMin} onChange={set('duracionMin')}>
              {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutos</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tipo de cita</label>
            <select className="input" value={form.tipo} onChange={set('tipo')}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.estado} onChange={set('estado')}>
              {['Programada', 'Completada', 'Cancelada'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={!!form.recordatorio} onChange={set('recordatorio')} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              Enviar recordatorio
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notas</label>
            <textarea className="input" rows={2} value={form.notas} onChange={set('notas')} placeholder="Documentos a traer, sala de audiencia, etc." />
          </div>
        </div>

        {citasDelDia.length > 0 && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Agenda del día seleccionado</p>
            <ul className="space-y-1 text-xs text-slate-600">
              {citasDelDia.sort((a, b) => a.hora.localeCompare(b.hora)).map((a) => (
                <li key={a.id}>• {a.hora} ({a.duracionMin} min) — {clientes.find((c) => c.id === a.clientId)?.nombre}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" data-sound="success" className="btn-primary" disabled={guardando || conflicto}>
            {guardando ? 'Guardando…' : 'Guardar cita'}
          </button>
        </div>
      </form>
    </div>
  )
}
