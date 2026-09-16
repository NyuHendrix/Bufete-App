import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import ClientForm from './ClientForm'
import { formatDateCR } from '../../utils/formatters'

const ESTILO_ESTADO = {
  Activo: 'bg-emerald-50 text-emerald-700',
  Archivado: 'bg-slate-100 text-slate-500',
}

export default function ClientList({ hook }) {
  const { filtrados, loading, error, busqueda, setBusqueda, create, update, remove } = hook
  const [modal, setModal] = useState({ abierto: false, inicial: null })
  const [confirmarId, setConfirmarId] = useState(null)

  const guardar = (form) => (modal.inicial ? update(modal.inicial.id, form) : create(form))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre, cédula o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setModal({ abierto: true, inicial: null })}>
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {error && <div className="card border-l-4 border-red-400 text-sm text-red-600">{error}</div>}
      {loading && <p className="py-10 text-center text-sm text-slate-400">Cargando clientes…</p>}

      {!loading && (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Cliente</th>
                <th className="th">Cédula</th>
                <th className="th">Contacto</th>
                <th className="th">Caso</th>
                <th className="th">Registrado</th>
                <th className="th">Estado</th>
                <th className="th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="td font-semibold">{c.nombre}</td>
                  <td className="td whitespace-nowrap">{c.cedula}</td>
                  <td className="td">
                    <p>{c.telefono}</p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </td>
                  <td className="td">
                    <p className="font-medium">{c.tipoCaso}</p>
                    <p className="max-w-[200px] truncate text-xs text-slate-400">{c.casoDescripcion}</p>
                  </td>
                  <td className="td whitespace-nowrap">{formatDateCR(c.fechaRegistro)}</td>
                  <td className="td">
                    <span className={`badge ${ESTILO_ESTADO[c.estadoCaso] || ESTILO_ESTADO.Activo}`}>{c.estadoCaso}</span>
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1">
                      <Link to={`/clientes/${c.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Ver detalle">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => setModal({ abierto: true, inicial: c })} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600" title="Editar">
                        <Pencil size={16} />
                      </button>
                      {confirmarId === c.id ? (
                        <button
                          onClick={() => { remove(c.id); setConfirmarId(null) }}
                          onMouseLeave={() => setConfirmarId(null)}
                          className="rounded-lg bg-red-600 px-2 text-xs font-bold text-white"
                          title="Confirmar eliminación"
                        >
                          ¿Seguro?
                        </button>
                      ) : (
                        <button onClick={() => setConfirmarId(c.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">No se encontraron clientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ClientForm
        key={`${modal.abierto}-${modal.inicial?.id ?? 'nuevo'}`}
        abierto={modal.abierto}
        inicial={modal.inicial}
        onGuardar={guardar}
        onCerrar={() => setModal({ abierto: false, inicial: null })}
      />
    </div>
  )
}
