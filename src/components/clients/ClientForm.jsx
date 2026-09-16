import { useState } from 'react'
import { X } from 'lucide-react'

const VACIO = {
  nombre: '', cedula: '', telefono: '', email: '',
  direccion: '', tipoCaso: 'Familiar', casoDescripcion: '', estadoCaso: 'Activo',
}
const TIPOS = ['Familiar', 'Penal', 'Mercantil', 'Inmobiliario', 'Notarial', 'Laboral']

/** Modal de creación / edición de cliente con validaciones */
export default function ClientForm({ abierto, inicial, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => (inicial ? { ...VACIO, ...inicial } : VACIO))
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  if (!abierto) return null

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const validar = () => {
    const e = {}
    if (!form.nombre.trim() || form.nombre.trim().length < 5) e.nombre = 'Ingrese el nombre completo'
    if (!/^\d{1}-\d{4}-\d{4}$/.test(form.cedula)) e.cedula = 'Formato esperado: 1-2345-6789'
    if (!/^\d{4}-\d{4}$/.test(form.telefono)) e.telefono = 'Formato esperado: 8888-1234'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Correo inválido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      await onGuardar(form)
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCerrar} />
      <form onSubmit={guardar} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            {inicial ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nombre completo *</label>
            <input className="input" value={form.nombre} onChange={set('nombre')} placeholder="María Fernanda Jiménez Solano" />
            {errores.nombre && <p className="mt-1 text-xs text-red-500">{errores.nombre}</p>}
          </div>
          <div>
            <label className="label">Cédula * (1-2345-6789)</label>
            <input className="input" value={form.cedula} onChange={set('cedula')} placeholder="1-0832-0456" />
            {errores.cedula && <p className="mt-1 text-xs text-red-500">{errores.cedula}</p>}
          </div>
          <div>
            <label className="label">Teléfono * (8888-1234)</label>
            <input className="input" value={form.telefono} onChange={set('telefono')} placeholder="8888-1234" />
            {errores.telefono && <p className="mt-1 text-xs text-red-500">{errores.telefono}</p>}
          </div>
          <div>
            <label className="label">Correo electrónico</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="cliente@gmail.com" />
            {errores.email && <p className="mt-1 text-xs text-red-500">{errores.email}</p>}
          </div>
          <div>
            <label className="label">Tipo de caso</label>
            <select className="input" value={form.tipoCaso} onChange={set('tipoCaso')}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Dirección</label>
            <input className="input" value={form.direccion} onChange={set('direccion')} placeholder="Barrio, cantón, provincia" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descripción del caso</label>
            <input className="input" value={form.casoDescripcion} onChange={set('casoDescripcion')} placeholder="Ej: Divorcio contencioso" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" data-sound="success" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cliente'}
            
          </button>
        </div>
      </form>
    </div>
  )
}
