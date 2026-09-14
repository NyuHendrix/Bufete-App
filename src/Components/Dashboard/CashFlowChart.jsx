import { useMemo } from 'react'
import { formatCRC } from '../../Utils/formatters'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']

/** Gráfico SVG de barras: ingresos vs gastos de los últimos 6 meses */
export default function CashFlowChart({ pagos, gastos }) {
  const { barras, max } = useMemo(() => {
    const hoy = new Date()
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      meses.push({ clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, etiqueta: MESES[d.getMonth()] })
    }
    const ingresoPorMes = Object.fromEntries(meses.map((m) => [m.clave, 0]))
    const gastoPorMes = Object.fromEntries(meses.map((m) => [m.clave, 0]))

    pagos.forEach((p) => {
      const clave = (p.fecha || '').slice(0, 7)
      if (clave in ingresoPorMes) ingresoPorMes[clave] += p.montoPagado || 0
    })
    gastos.forEach((g) => {
      const clave = (g.fecha || '').slice(0, 7)
      if (clave in gastoPorMes) gastoPorMes[clave] += g.monto || 0
    })

    const barras = meses.map((m) => ({ ...m, ingreso: ingresoPorMes[m.clave], gasto: gastoPorMes[m.clave] }))
    return { barras, max: Math.max(1, ...barras.flatMap((b) => [b.ingreso, b.gasto])) }
  }, [pagos, gastos])

  const W = 560, H = 220, BASE = H - 30, TOP = 15

  return (
    <section className="card">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Flujo de caja — últimos 6 meses</h2>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Ingresos</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> Gastos</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de flujo de caja">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1="0" x2={W} y1={BASE - (BASE - TOP) * f} y2={BASE - (BASE - TOP) * f} stroke="#e2e8f0" strokeDasharray="4" />
            <text x="4" y={BASE - (BASE - TOP) * f - 4} fontSize="9" fill="#94a3b8">
              {formatCRC(max * f).replace(',00', '')}
            </text>
          </g>
        ))}
        {barras.map((b, i) => {
          const grupoW = W / barras.length
          const bw = Math.min(26, grupoW / 3)
          const x = grupoW * i + grupoW / 2
          const hIng = ((BASE - TOP) * b.ingreso) / max
          const hGas = ((BASE - TOP) * b.gasto) / max
          return (
            <g key={b.clave}>
              <rect x={x - bw - 2} y={BASE - hIng} width={bw} height={Math.max(hIng, b.ingreso ? 2 : 0)} rx="2" fill="#3d6af0">
                <title>{`${b.etiqueta} ingresos: ${formatCRC(b.ingreso)}`}</title>
              </rect>
              <rect x={x + 2} y={BASE - hGas} width={bw} height={Math.max(hGas, b.gasto ? 2 : 0)} rx="2" fill="#fb7185">
                <title>{`${b.etiqueta} gastos: ${formatCRC(b.gasto)}`}</title>
              </rect>
              <text x={x} y={BASE + 16} fontSize="10" fill="#64748b" textAnchor="middle">{b.etiqueta}</text>
            </g>
          )
        })}
        <line x1="0" x2={W} y1={BASE} y2={BASE} stroke="#cbd5e1" />
      </svg>
    </section>
  )
}
