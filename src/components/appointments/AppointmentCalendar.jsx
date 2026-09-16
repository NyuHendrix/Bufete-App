import { useMemo, useState } from 'react'
import {
  addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth,
  startOfMonth, startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, LayoutList } from 'lucide-react'
import AppointmentForm from './AppointmentForm'
import AppointmentList from './AppointmentList'

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

/**
 * Página de citas: calendario mensual + agenda diaria + formulario con
 * detección de conflictos. La vista semanal/diaria se cubre con la agenda
 * del día seleccionado.
 */
export default function AppointmentCalendar({ hook, clientes }) {
  const { data: citas, loading, error, create, update, remove, porFecha } = hook
  const [mesActual, setMesActual] = useState(new Date())
  const [diaSel, setDiaSel] = useState(new Date())
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [modal, setModal] = useState({ abierto: false, inicial: null })

  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre || 'Cliente'

  /* ---------- Semanas del mes (lunes a domingo) ---------- */
  const semanas = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 })
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 })
    const dias = []
    let d = inicio
    while (d <= fin) { dias.push(d); d = addDays(d, 1) }
    const sems = []
    for (let i = 0; i < dias.length; i += 7) sems.push(dias.slice(i, i + 7))
    return sems
  }, [mesActual])

  /* ---------- Citas del día seleccionado (con filtros) ---------- */
  const claveDiaSel = format(diaSel, 'yyyy-MM-dd')
  const citasDia = useMemo(() => {
    let lista = porFecha[claveDiaSel] || []
    if (filtroEstado) lista = lista.filter((a) => a.estado === filtroEstado)
    if (filtroTexto) {
      const q = filtroTexto.toLowerCase()
      lista = lista.filter((a) => nombreCliente(a.clientId).toLowerCase().includes(q) || a.tipo.toLowerCase().includes(q))
    }
    return lista
  }, [porFecha, claveDiaSel, filtroEstado, filtroTexto]) // eslint-disable-line

  const guardar = (form) => (modal.inicial ? update(modal.inicial.id, form) : create(form))

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="btn-secondary !px-2.5" onClick={() => { setMesActual(addMonths(mesActual, -1)); setDiaSel(startOfMonth(addMonths(mesActual, -1))) }} aria-label="Mes anterior">
            <ChevronLeft size={16} />
          </button>
          <button className="btn-secondary" onClick={() => { const h = new Date(); setMesActual(h); setDiaSel(h) }}>Hoy</button>
          <button className="btn-secondary !px-2.5" onClick={() => { setMesActual(addMonths(mesActual, 1)); setDiaSel(startOfMonth(addMonths(mesActual, 1))) }} aria-label="Mes siguiente">
            <ChevronRight size={16} />
          </button>
        </div>
        <h2 className="text-base font-bold capitalize text-slate-800">
          {format(mesActual, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="ml-auto flex gap-2">
          <input className="input !w-48" placeholder="Filtrar por cliente/tipo…" value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} />
          <select className="input !w-36" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {['Programada', 'Completada', 'Cancelada'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setModal({ abierto: true, inicial: null })}>
            <Plus size={16} /> Nueva cita
          </button>
        </div>
      </div>

      {error && <div className="card border-l-4 border-red-400 text-sm text-red-600">{error}</div>}
      {loading && <p className="py-6 text-center text-sm text-slate-400">Cargando agenda…</p>}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {/* ---------- Calendario mensual ---------- */}
          <div className="card xl:col-span-3">
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DIAS.map((d) => (
                <p key={d} className="py-1 text-center text-xs font-bold uppercase text-slate-400">{d}</p>
              ))}
            </div>
            <div className="space-y-1">
              {semanas.map((semana, i) => (
                <div key={i} className="grid grid-cols-7 gap-1">
                  {semana.map((dia) => {
                    const clave = format(dia, 'yyyy-MM-dd')
                    const delDia = porFecha[clave] || []
                    const activas = delDia.filter((a) => a.estado !== 'Cancelada')
                    const hoy = isSameDay(dia, new Date())
                    const seleccionado = isSameDay(dia, diaSel)
                    const fuera = !isSameMonth(dia, mesActual)
                    return (
                      <button
                        key={clave}
                        onClick={() => setDiaSel(dia)}
                        className={`flex min-h-[64px] flex-col items-center rounded-lg border p-1 text-sm transition-colors ${
                          seleccionado
                            ? 'border-brand-500 bg-brand-50 font-bold text-brand-700'
                            : hoy
                              ? 'border-brand-300 bg-white font-bold text-brand-700'
                              : fuera
                                ? 'border-transparent text-slate-300 hover:bg-slate-50'
                                : 'border-transparent text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${hoy && !seleccionado ? 'bg-brand-600 text-white' : ''}`}>
                          {format(dia, 'd')}
                        </span>
                        <span className="mt-1 flex max-w-full flex-wrap justify-center gap-0.5">
                          {activas.slice(0, 3).map((a) => (
                            <i
                              key={a.id}
                              title={`${a.hora} ${nombreCliente(a.clientId)}`}
                              className={`h-1.5 w-1.5 rounded-full ${a.estado === 'Completada' ? 'bg-emerald-400' : 'bg-brand-500'}`}
                            />
                          ))}
                          {activas.length > 3 && <span className="text-[9px] text-slate-400">+{activas.length - 3}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-brand-500" /> Programada</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-400" /> Completada</span>
            </div>
          </div>

          {/* ---------- Agenda del día ---------- */}
          <div className="xl:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-500" />
              <h3 className="text-sm font-bold capitalize text-slate-700">
                {format(diaSel, "EEEE d 'de' MMMM", { locale: es })}
              </h3>
              <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                <LayoutList size={12} /> {citasDia.length} cita(s)
              </span>
            </div>
            <AppointmentList
              citas={citasDia}
              clientes={clientes}
              onEditar={(a) => setModal({ abierto: true, inicial: a })}
              onEliminar={(id) => remove(id)}
            />
          </div>
        </div>
      )}

      <AppointmentForm
        key={`${modal.abierto}-${modal.inicial?.id ?? 'nuevo'}`}
        abierto={modal.abierto}
        inicial={modal.inicial}
        clientes={clientes}
        citas={citas}
        onGuardar={guardar}
        onCerrar={() => setModal({ abierto: false, inicial: null })}
      />
    </div>
  )
}
