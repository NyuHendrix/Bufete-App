import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X, ShieldCheck } from 'lucide-react'
import { useEscapeKey } from '../../hooks/useEscapeKey'

const PERMISOS = ['Panel principal', 'Citas', 'Clientes', 'Pagos', 'Reportes', 'Administración']

export default function AdminProfileModal({ perfil, onGuardar, onCerrar }) {
  const [form, setForm] = useState({ ...perfil })
  const [fotoError, setFotoError] = useState('')
  useEscapeKey(true, onCerrar)
  const iniciales = form.nombre.split(/\s+/).filter(Boolean).slice(-2).map((parte) => parte[0]).join('').toUpperCase()

  const cambiarFoto = (event) => {
    const archivo = event.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setFotoError('Selecciona un archivo de imagen válido.')
      return
    }
    const lector = new FileReader()
    lector.onload = () => {
      const imagen = new Image()
      imagen.onload = () => {
        const canvas = document.createElement('canvas')
        const escala = Math.min(1, 320 / Math.max(imagen.width, imagen.height))
        canvas.width = Math.round(imagen.width * escala)
        canvas.height = Math.round(imagen.height * escala)
        canvas.getContext('2d').drawImage(imagen, 0, 0, canvas.width, canvas.height)
        setForm((actual) => ({ ...actual, foto: canvas.toDataURL('image/jpeg', 0.82) }))
        setFotoError('')
      }
      imagen.src = lector.result
    }
    lector.readAsDataURL(archivo)
  }

  const cambiarPermiso = (permiso) => setForm((actual) => ({
    ...actual,
    permisos: actual.permisos.includes(permiso)
      ? actual.permisos.filter((item) => item !== permiso)
      : [...actual.permisos, permiso],
  }))

  const guardar = (event) => {
    event.preventDefault()
    onGuardar(form)
    onCerrar()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onCerrar} aria-label="Cerrar edición de perfil" />
      <form onSubmit={guardar} className="admin-modal relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Administración</p><h2 className="text-xl font-semibold">Perfil y accesos</h2><p className="mt-1 text-xs text-slate-400">Configura la cuenta del administrador principal.</p></div>
          <button type="button" onClick={onCerrar} className="header-action rounded-lg p-2" aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <label className="relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-amber-300/40 bg-slate-800 text-sm font-bold text-amber-100" title="Cambiar foto de perfil">
            {form.foto ? <img src={form.foto} alt="Foto del administrador" className="h-full w-full object-cover" /> : iniciales}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition-opacity hover:opacity-100"><Camera size={19} /></span>
            <input className="sr-only" type="file" accept="image/*" onChange={cambiarFoto} />
          </label>
          <div><p className="text-sm font-semibold">Fotografía del administrador</p><p className="mt-1 text-xs text-slate-400">La imagen se ajusta y guarda en este navegador.</p>{fotoError && <p className="mt-1 text-xs text-rose-300">{fotoError}</p>}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="admin-field sm:col-span-2"><span>Nombre completo</span><input required value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></label>
          <label className="admin-field"><span>Cargo administrativo</span><select value={form.cargo} onChange={(event) => setForm({ ...form, cargo: event.target.value })}>{['Socio principal', 'Administrador', 'Dirección legal', 'Asistente administrativo'].map((cargo) => <option key={cargo}>{cargo}</option>)}</select></label>
          <label className="admin-field"><span>Correo de trabajo</span><input type="email" value={form.correo} onChange={(event) => setForm({ ...form, correo: event.target.value })} /></label>
          <label className="admin-field"><span>Teléfono directo</span><input value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} /></label>
          <label className="admin-field"><span>Estado de la cuenta</span><select value={form.activa === false ? 'inactiva' : 'activa'} onChange={(event) => setForm({ ...form, activa: event.target.value === 'activa' })}><option value="activa">Activa</option><option value="inactiva">Suspendida</option></select></label>
        </div>

        <fieldset className="mt-6 rounded-lg border border-white/10 p-4">
          <legend className="flex items-center gap-2 px-2 text-xs font-semibold"><ShieldCheck size={15} className="text-amber-300" /> Permisos de acceso</legend>
          <div className="grid gap-2 sm:grid-cols-3">{PERMISOS.map((permiso) => <label key={permiso} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-300 hover:bg-white/5"><input type="checkbox" checked={form.permisos.includes(permiso)} onChange={() => cambiarPermiso(permiso)} className="accent-amber-400" />{permiso}</label>)}</div>
        </fieldset>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-xs text-slate-300"><input type="checkbox" checked={form.avisosCorreo !== false} onChange={(event) => setForm({ ...form, avisosCorreo: event.target.checked })} className="accent-amber-400" /><span><strong className="block text-slate-100">Avisos administrativos por correo</strong><span className="mt-0.5 block text-slate-400">Recibir alertas de vencimientos y actividad del sistema.</span></span></label>

        <div className="mt-7 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onCerrar}>Cancelar</button><button type="submit" className="admin-save">Guardar cambios</button></div>
      </form>
    </div>,
    document.body,
  )
}