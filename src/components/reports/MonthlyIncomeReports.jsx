import { useMemo, useState } from 'react'
import { FileDown, FileSpreadsheet, Printer, TrendingUp } from 'lucide-react'
import { exportToExcel, exportToPDF, printReport } from '../../utils/exportUtils'
import { formatCRC } from '../../utils/formatters'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre']
const MUESTRAS = [
  { ingresos: [720000, 540000, 390000], gastos: [850000, 265000] },
  { ingresos: [950000, 640000, 420000], gastos: [850000, 310000] },
  { ingresos: [680000, 580000, 440000], gastos: [850000, 298000] },
  { ingresos: [1050000, 710000, 520000], gastos: [850000, 355000] },
  { ingresos: [880000, 760000, 490000], gastos: [850000, 325000] },
  { ingresos: [930000, 620000, 510000], gastos: [850000, 342000] },
  { ingresos: [1120000, 740000, 460000], gastos: [850000, 372000] },
  { ingresos: [860000, 690000, 530000], gastos: [850000, 318000] },
  { ingresos: [1250000, 820000, 610000], gastos: [850000, 387000] },
]

const claveMes = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`
const nombreArchivo = (nombre) => nombre.toLocaleLowerCase('es-CR').replace(/\s+/g, '_')

export default function MonthlyIncomeReports({ pagos, gastos, clientes }) {
  const year = new Date().getFullYear()
  const [mesSeleccionado, setMesSeleccionado] = useState(Math.min(new Date().getMonth(), 8))

  const reportes = useMemo(() => MESES.map((mes, indice) => {
    const clave = claveMes(year, indice)
    const pagosDelMes = pagos.filter((pago) => (pago.fecha || '').startsWith(clave))
    const pagosCobrados = pagosDelMes.filter((pago) => Number(pago.montoPagado) > 0)
    const gastosDelMes = gastos.filter((gasto) => (gasto.fecha || '').startsWith(clave))
    const demostrativo = pagosDelMes.length === 0 && gastosDelMes.length === 0

    if (demostrativo) {
      const muestra = MUESTRAS[indice]
      const movimientos = [
        ...muestra.ingresos.map((monto, i) => ({
          fecha: `${year}-${String(indice + 1).padStart(2, '0')}-${String(8 + i * 7).padStart(2, '0')}`,
          tipo: 'Ingreso de muestra', tercero: `Cliente demostrativo ${i + 1}`,
          concepto: 'Honorarios profesionales (ejemplo)', metodo: 'Demostrativo', monto,
        })),
        ...muestra.gastos.map((monto, i) => ({
          fecha: `${year}-${String(indice + 1).padStart(2, '0')}-${String(3 + i * 12).padStart(2, '0')}`,
          tipo: 'Gasto de muestra', tercero: 'Bufete (ejemplo)',
          concepto: i === 0 ? 'Alquiler de oficina (ejemplo)' : 'Gastos operativos (ejemplo)',
          metodo: 'Demostrativo', monto,
        })),
      ]
      return {
        indice, mes, clave, demostrativo, movimientos,
        cobros: movimientos.filter((movimiento) => movimiento.tipo.startsWith('Ingreso')),
        ingresos: muestra.ingresos.reduce((total, monto) => total + monto, 0),
        egresos: muestra.gastos.reduce((total, monto) => total + monto, 0),
      }
    }

    const movimientos = [
      ...pagosCobrados.map((pago) => ({
        fecha: pago.fecha, tipo: 'Ingreso',
        tercero: clientes.find((cliente) => String(cliente.id) === String(pago.clientId))?.nombre || 'Cliente',
        concepto: pago.concepto || 'Servicio profesional', metodo: pago.metodo || 'No registrado',
        monto: Number(pago.montoPagado) || 0,
      })),
      ...gastosDelMes.map((gasto) => ({
        fecha: gasto.fecha, tipo: 'Gasto', tercero: gasto.categoria || 'Bufete',
        concepto: gasto.descripcion || 'Gasto registrado', metodo: gasto.metodo || 'No registrado',
        monto: Number(gasto.monto) || 0,
      })),
    ].sort((a, b) => a.fecha.localeCompare(b.fecha))

    return {
      indice, mes, clave, demostrativo, movimientos,
      cobros: pagosCobrados,
      ingresos: pagosCobrados.reduce((total, pago) => total + (Number(pago.montoPagado) || 0), 0),
      egresos: gastosDelMes.reduce((total, gasto) => total + (Number(gasto.monto) || 0), 0),
    }
  }), [year, pagos, gastos, clientes])

  const reporteSeleccionado = reportes[mesSeleccionado]
  const ingresoReal = reportes.filter((reporte) => !reporte.demostrativo).reduce((total, reporte) => total + reporte.ingresos, 0)
  const ingresoMuestra = reportes.filter((reporte) => reporte.demostrativo).reduce((total, reporte) => total + reporte.ingresos, 0)
  const columnasDetalle = [
    { header: 'Fecha', key: 'fecha' }, { header: 'Movimiento', key: 'tipo' },
    { header: 'Cliente / categoría', key: 'tercero' }, { header: 'Concepto', key: 'concepto' },
    { header: 'Método', key: 'metodo' }, { header: 'Importe', key: 'importe' },
  ]

  const detalleReporte = (reporte) => {
    const filas = reporte.movimientos.map((movimiento) => ({ ...movimiento, importe: formatCRC(movimiento.monto) }))
    return {
      titulo: `Ingresos mensuales - ${reporte.mes} ${year}`,
      subtitulo: reporte.demostrativo ? 'MUESTRA FICTICIA - NO CONTABLE' : 'Movimientos registrados en el sistema',
      columnas: columnasDetalle,
      filas,
      filasExcel: [
        ...filas,
        { fecha: '', tipo: 'TOTAL INGRESOS', tercero: '', concepto: '', metodo: '', importe: formatCRC(reporte.ingresos) },
        { fecha: '', tipo: 'TOTAL GASTOS', tercero: '', concepto: '', metodo: '', importe: formatCRC(reporte.egresos) },
        { fecha: '', tipo: 'NETO', tercero: '', concepto: '', metodo: '', importe: formatCRC(reporte.ingresos - reporte.egresos) },
      ],
      totales: `Ingresos: ${formatCRC(reporte.ingresos)} · Gastos: ${formatCRC(reporte.egresos)} · Neto: ${formatCRC(reporte.ingresos - reporte.egresos)}`,
    }
  }

  const reporteAnual = () => {
    const columnas = [
      { header: 'Mes', key: 'mes' }, { header: 'Origen', key: 'origen' },
      { header: 'Cobros', key: 'cobros' }, { header: 'Ingresos', key: 'ingresos' },
      { header: 'Gastos', key: 'egresos' }, { header: 'Neto', key: 'neto' },
    ]
    const filas = reportes.map((reporte) => ({
      mes: reporte.mes, origen: reporte.demostrativo ? 'Muestra ficticia' : 'Registrado',
      cobros: reporte.cobros.length, ingresos: formatCRC(reporte.ingresos),
      egresos: formatCRC(reporte.egresos), neto: formatCRC(reporte.ingresos - reporte.egresos),
    }))
    const reportesReales = reportes.filter((reporte) => !reporte.demostrativo)
    const reportesMuestra = reportes.filter((reporte) => reporte.demostrativo)
    filas.push({
      mes: 'TOTAL REAL', origen: 'Solo movimientos registrados',
      cobros: reportesReales.reduce((total, reporte) => total + reporte.cobros.length, 0),
      ingresos: formatCRC(ingresoReal),
      egresos: formatCRC(reportesReales.reduce((total, reporte) => total + reporte.egresos, 0)),
      neto: formatCRC(reportesReales.reduce((total, reporte) => total + reporte.ingresos - reporte.egresos, 0)),
    })
    filas.push({
      mes: 'TOTAL DE MUESTRAS', origen: 'No contable',
      cobros: reportesMuestra.reduce((total, reporte) => total + reporte.cobros.length, 0),
      ingresos: formatCRC(ingresoMuestra),
      egresos: formatCRC(reportesMuestra.reduce((total, reporte) => total + reporte.egresos, 0)),
      neto: formatCRC(reportesMuestra.reduce((total, reporte) => total + reporte.ingresos - reporte.egresos, 0)),
    })
    return {
      titulo: `Reporte de ingresos enero-septiembre ${year}`,
      subtitulo: 'Los importes ficticios están separados de los movimientos reales',
      columnas, filas,
      totales: `Ingresos reales registrados: ${formatCRC(ingresoReal)} · Ingresos de muestra, no contables: ${formatCRC(ingresoMuestra)}`,
    }
  }

  const descargarPDF = (reporte, nombre) => exportToPDF({ ...reporte, nombre: nombreArchivo(nombre) })
  const descargarExcel = (reporte, nombre) => exportToExcel({
    tituloHoja: reporte.titulo, columnas: reporte.columnas, filas: reporte.filasExcel || reporte.filas, nombre: nombreArchivo(nombre),
  })

  return (
    <section className="card min-w-0 max-w-full space-y-4" aria-labelledby="ingresos-mensuales-titulo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="ingresos-mensuales-titulo" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <TrendingUp size={17} className="text-emerald-600" /> Ingresos mensuales · enero a septiembre {year}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Los cobros reales se calculan a partir del monto recibido en cada pago.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <p><span className="block text-[10px] font-semibold uppercase text-slate-400">Ingresos reales</span><strong className="text-emerald-700">{formatCRC(ingresoReal)}</strong></p>
          <p><span className="block text-[10px] font-semibold uppercase text-slate-400">Muestras ficticias</span><strong className="text-slate-500">{formatCRC(ingresoMuestra)}</strong></p>
        </div>
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Los meses sin movimientos registrados usan cifras ficticias de demostración. No se guardan ni se incluyen en los ingresos reales.
      </p>

      <div className="w-full min-w-0 max-w-full overflow-x-auto">
        <table className="min-w-[640px] divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>
            {['Mes', 'Origen', 'Cobros', 'Ingresos', 'Gastos', 'Neto'].map((titulo) => <th key={titulo} className="th">{titulo}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {reportes.map((reporte) => (
              <tr key={reporte.clave} className="hover:bg-slate-50">
                <td className="td font-semibold">{reporte.mes}</td>
                <td className="td"><span className={`badge ${reporte.demostrativo ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{reporte.demostrativo ? 'Muestra ficticia' : 'Registrado'}</span></td>
                <td className="td">{reporte.cobros.length}</td>
                <td className="td font-semibold">{formatCRC(reporte.ingresos)}</td>
                <td className="td">{formatCRC(reporte.egresos)}</td>
                <td className={`td font-semibold ${reporte.ingresos - reporte.egresos >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCRC(reporte.ingresos - reporte.egresos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-40">
            <span className="label">Reporte individual</span>
            <select className="input" value={mesSeleccionado} onChange={(event) => setMesSeleccionado(Number(event.target.value))}>
              {reportes.map((reporte) => <option key={reporte.clave} value={reporte.indice}>{reporte.mes}</option>)}
            </select>
          </label>
          <button type="button" className="btn-secondary" onClick={() => printReport(detalleReporte(reporteSeleccionado))} title="Imprimir reporte mensual"><Printer size={16} /> Imprimir mes</button>
          <button type="button" className="btn-danger" onClick={() => descargarPDF(detalleReporte(reporteSeleccionado), `ingresos_${reporteSeleccionado.mes}_${year}`)} title="Descargar reporte mensual en PDF"><FileDown size={16} /> PDF</button>
          <button type="button" className="btn-success" onClick={() => descargarExcel(detalleReporte(reporteSeleccionado), `ingresos_${reporteSeleccionado.mes}_${year}`)} title="Descargar reporte mensual en Excel"><FileSpreadsheet size={16} /> Excel</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => printReport(reporteAnual())}><Printer size={16} /> Imprimir total</button>
          <button type="button" className="btn-danger" onClick={() => descargarPDF(reporteAnual(), `ingresos_enero_septiembre_${year}`)}><FileDown size={16} /> PDF total</button>
          <button type="button" className="btn-success" onClick={() => descargarExcel(reporteAnual(), `ingresos_enero_septiembre_${year}`)}><FileSpreadsheet size={16} /> Excel total</button>
        </div>
      </div>
    </section>
  )
}
