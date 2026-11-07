import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export default function AppointmentsTrendChart({ citas }) {
  const datos = useMemo(() => {
    const inicio = new Date()
    inicio.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + index)
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
      return { etiqueta: DIAS[fecha.getDay()], total: citas.filter((cita) => cita.fecha === clave).length }
    })
  }, [citas])

  const W = 560
  const H = 190
  const MAX = Math.max(4, ...datos.map((dato) => dato.total))
  const puntos = datos.map((dato, index) => ({ x: 28 + index * 84, y: 144 - (dato.total / MAX) * 112 }))
  const linea = puntos.map((punto, index) => `${index ? 'L' : 'M'} ${punto.x} ${punto.y}`).join(' ')
  const area = `${linea} L ${puntos.at(-1).x} 148 L ${puntos[0].x} 148 Z`

  return (
    <section className="card chart-card">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-bold">Ritmo de citas</h2><p className="mt-1 text-xs text-slate-400">Agenda para los próximos siete días</p></div>
        <span className="chart-symbol"><CalendarDays size={16} /></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Tendencia de citas durante los próximos siete días">
        <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d5ad5b" stopOpacity="0.55" /><stop offset="100%" stopColor="#d5ad5b" stopOpacity="0.02" /></linearGradient></defs>
        {[0, 1, 2, 3].map((tick) => {
          const y = 148 - tick * 37
          return <g key={tick}><line x1="20" x2="540" y1={y} y2={y} className="chart-gridline" /><text x="4" y={y - 4} className="chart-axis-label">{Math.round(MAX * tick / 3)}</text></g>
        })}
        <path d={area} className="trend-area" />
        <path d={linea} className="trend-line" />
        {puntos.map((punto, index) => <g key={`${datos[index].etiqueta}-${index}`} className="trend-point" style={{ animationDelay: `${index * 70}ms` }}><circle cx={punto.x} cy={punto.y} r="4" className="trend-dot" /><text x={punto.x} y="174" className="chart-day-label" textAnchor="middle">{datos[index].etiqueta}</text><title>{`${datos[index].etiqueta}: ${datos[index].total} cita(s)`}</title></g>)}
      </svg>
    </section>
  )
}