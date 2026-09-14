import { useMemo, useState } from 'react'
import { FileSearch, Eye } from 'lucide-react'
import ExportOptions from './ExportOptions'
import { formatCRC, formatDateCR, saldoPendiente, estaVencido } from '../../Utils/formatters'

const TIPOS = [
  { valor: 'estado', label: 'Estado de cuenta por cliente' },
  { valor: 'citas', label: 'Reporte de citas' },
  { valor: 'financiero', label: 'Resumen financiero' },
]

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']

/** Generador de reportes con vista previa y exportación PDF/Excel/Word */
export default function ReportGenerator({ clientes, citas, pagos, gastos }) {
  const [tipo, setTipo] = useState('estado')
  const [clienteId, setClienteId] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre || 'Cliente'

  const enRango = (fecha) =>
    (!desde || fecha >= desde) && (!hasta || fecha <= hasta)

  /* ---------- Construcción del reporte seleccionado ---------- */
  const reporte = useMemo(() => {
    if (tipo === 'estado') {
      const filas = pagos
        .filter((p) => (!clienteId || p.clientId === Number(clienteId)) && enRango(p.fecha))
        .map((p) => ({
          fecha: formatDateCR(p.fecha), cliente: nombreCliente(p.clientId), concepto: p.concepto,
          monto: formatCRC(p.monto), abonado: formatCRC(p.montoPagado || 0),
          saldo: formatCRC(saldoPendiente(p)),
          estado: estaVencido(p) ? `${p.estado} (vencido)` : p.estado,
        }))
      const total = filas.length
        ? filas.reduce((s, f) => s + Number(f.saldo.replace(/[₡,]/g, '')), 0)
        : 0
      return {
        titulo: 'Estado de cuenta', subtitulo: clienteId ? `Cliente: ${nombreCliente(Number(clienteId))}` : 'Todos los clientes',
        columnas: [
          { header: 'Fecha', key: 'fecha' }, { header: 'Cliente', key: 'cliente' },
          { header: 'Concepto', key: 'concepto' }, { header: 'Monto', key: 'monto' },
          { header: 'Abonado', key: 'abonado' }, { header: 'Saldo', key: 'saldo' }, { header: 'Estado', key: 'estado' },
        ],
        filas, totales: `Saldo pendiente total: ${formatCRC(total)}`,
      }
    }

    if (tipo === 'citas') {
      const filas = citas
        .filter((a) => (!clienteId || a.clientId === Number(clienteId)) && enRango(a.fecha))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map((a) => ({
          fecha: formatDateCR(a.fecha), hora: a.hora, cliente: nombreCliente(a.clientId),
          tipo: a.tipo, duracion: `${a.duracionMin} min`, estado: a.estado,
        }))
      return {
        titulo: 'Reporte de citas', subtitulo: `${filas.length} cita(s) en el período seleccionado`,
        columnas: [
          { header: 'Fecha', key: 'fecha' }, { header: 'Hora', key: 'hora' },
          { header: 'Cliente', key: 'cliente' }, { header: 'Tipo', key: 'tipo' },
          { header: 'Duración', key: 'duracion' }, { header: 'Estado', key: 'estado' },
        ],
        filas,
      }
    }

    // financiero: ingresos vs gastos por mes (últimos 6)
    const hoy = new Date()
    const filas = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const ingresos = pagos.filter((p) => (p.fecha || '').startsWith(clave)).reduce((s, p) => s + (p.montoPagado || 0), 0)
      const egresos = gastos.filter((g) => (g.fecha || '').startsWith(clave)).reduce((s, g) => s + (g.monto || 0), 0)
      filas.push({
        mes: `${MESES[d.getMonth()]} ${d.getFullYear()}`,
        ingresos: formatCRC(ingresos), gastos: formatCRC(egresos),
        neto: formatCRC(ingresos - egresos),
      })
    }
    const tIngresos = filas.reduce((s, f) => s + Number(f.ingresos.replace(/[₡,]/g, '')), 0)
    const tGastos = filas.reduce((s, f) => s + Number(f.gastos.replace(/[₡,]/g, '')), 0)
    return {
      titulo: 'Resumen financiero', subtitulo: 'Últimos 6 meses',
      columnas: [
        { header: 'Mes', key: 'mes' }, { header: 'Ingresos', key: 'ingresos' },
        { header: 'Gastos', key: 'gastos' }, { header: 'Flujo neto', key: 'neto' },
      ],
      filas,
      totales: `Totales — Ingresos: ${formatCRC(tIngresos)} · Gastos: ${formatCRC(tGastos)} · Neto: ${formatCRC(tIngresos - tGastos)}`,
    }
  }, [tipo, clienteId, desde, hasta, pagos, citas, gastos, clientes]) // eslint-disable-line

  const clienteSel = clientes.find((c) => c.id === Number(clienteId))

  return (
    <div className="space-y-4">
      {/* Configuración */}
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <FileSearch size={16} className="text-brand-500" /> Configurar reporte
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label">Tipo de reporte</label>
            <select className="input" value={tipo} onChange={(e) => { setTipo(e.target.value); setClienteId('') }}>
              {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.label}</option>)}
            </select>
          </div>
          {tipo !== 'financiero' && (
            <div>
              <label className="label">Cliente (opcional)</label>
              <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Todos</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Exportación */}
      <ExportOptions reporte={reporte} cliente={clienteSel} pagos={pagos} />

      {/* Vista previa */}
      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Eye size={15} className="text-brand-500" /> Vista previa — {reporte.titulo}
            </h3>
            <p className="text-xs text-slate-400">{reporte.subtitulo} · {reporte.filas.length} fila(s)</p>
          </div>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                {reporte.columnas.map((c) => <th key={c.key} className="th">{c.header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reporte.filas.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {reporte.columnas.map((c) => (
                    <td key={c.key} className="td whitespace-nowrap">{f[c.key]}</td>
                  ))}
                </tr>
              ))}
              {reporte.filas.length === 0 && (
                <tr><td colSpan={reporte.columnas.length} className="py-10 text-center text-sm text-slate-400">Sin datos para el período seleccionado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {reporte.totales && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">
            {reporte.totales}
          </div>
        )}
      </div>
    </div>
  )
}
