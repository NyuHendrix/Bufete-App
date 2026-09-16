import { useState } from 'react'
import { FileDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { exportToPDF, exportToExcel, generarDocumentoWord } from '../../utils/exportUtils'
import { saldoPendiente } from '../../utils/formatters'

const hoy = () => new Date().toISOString().slice(0, 10)

/** Botones de exportación PDF / Excel y plantillas Word */
export default function ExportOptions({ reporte, cliente, pagos }) {
  const [generando, setGenerando] = useState(false)

  const nombreArchivo = () =>
    `${reporte.titulo.toLowerCase().replace(/\s+/g, '_')}_${hoy()}`

  const exportarWord = async (tipo) => {
    if (!cliente) return
    setGenerando(true)
    try {
      const pagosCliente = pagos.filter((p) => p.clientId === cliente.id)
      const montoPendiente = pagosCliente.reduce((s, p) => s + saldoPendiente(p), 0)
      await generarDocumentoWord(tipo, { cliente, pagos: pagosCliente, montoPendiente })
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="card">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Exportar</h2>
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-danger"
          onClick={() => exportToPDF({ ...reporte, columnas: reporte.columnas, filas: reporte.filas, nombre: nombreArchivo() })}
        >
          <FileDown size={16} /> Exportar PDF
        </button>
        <button
          className="btn-success"
          onClick={() => exportToExcel({ tituloHoja: reporte.titulo, columnas: reporte.columnas, filas: reporte.filas, nombre: nombreArchivo() })}
        >
          <FileSpreadsheet size={16} /> Exportar Excel
        </button>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Plantillas Word {cliente ? `— ${cliente.nombre}` : '(seleccione un cliente arriba)'}
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" disabled={!cliente || generando} onClick={() => exportarWord('contrato')}>
            {generando ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Contrato de servicios
          </button>
          <button className="btn-secondary" disabled={!cliente || generando} onClick={() => exportarWord('carta')}>
            <FileText size={16} /> Carta de recordatorio
          </button>
          <button className="btn-secondary" disabled={!cliente || generando} onClick={() => exportarWord('poder')}>
            <FileText size={16} /> Poder especial
          </button>
        </div>
      </div>
    </div>
  )
}
