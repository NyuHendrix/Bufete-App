import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, X } from 'lucide-react'
import { estaVencido, formatCRC, formatDateCR, saldoPendiente } from '../../utils/formatters'

const ESTILO_PAGO = {
  Pagado: 'bg-emerald-50 text-emerald-700',
  Parcial: 'bg-amber-50 text-amber-700',
  Pendiente: 'bg-red-50 text-red-700',
}

const estadoDelPago = (pago) => {
  const saldo = saldoPendiente(pago)
  return saldo <= 0 ? 'Pagado' : (pago.montoPagado || 0) > 0 ? 'Parcial' : 'Pendiente'
}

export default function PaymentHistory({ cuentas, onEditar, onEliminar }) {
  const [cuentaAbierta, setCuentaAbierta] = useState(null)
  const [detalle, setDetalle] = useState(null)

  return (
    <div className="space-y-2">
      {cuentas.map((cuenta) => {
        const abierta = cuentaAbierta === cuenta.clientId
        const nombre = cuenta.cliente?.nombre || 'Cliente'

        return (
          <section key={cuenta.clientId} className="overflow-hidden rounded-xl border border-slate-200 bg-white/85 shadow-sm">
            <button
              type="button"
              onClick={() => setCuentaAbierta(abierta ? null : cuenta.clientId)}
              aria-expanded={abierta}
              className="grid w-full grid-cols-1 items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(180px,1.4fr)_repeat(3,minmax(110px,1fr))_auto] sm:px-5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
                  {nombre.trim().charAt(0).toLocaleUpperCase('es-CR')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-800">{nombre}</span>
                  <span className="block text-xs text-slate-500">{cuenta.pagos.length} {cuenta.pagos.length === 1 ? 'servicio' : 'servicios'}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                    {['Pendiente', 'Parcial', 'Pagado']
                      .map((estado) => [estado, cuenta.pagos.filter((pago) => estadoDelPago(pago) === estado).length])
                      .filter(([, cantidad]) => cantidad > 0)
                      .map(([estado, cantidad]) => `${estado}: ${cantidad}`)
                      .join(' · ')}
                  </span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-2 sm:block">
                <span className="text-xs text-slate-500 sm:block">Estado</span>
                <span className={`badge ${ESTILO_PAGO[cuenta.estado]}`}>{cuenta.estado}</span>
              </span>
              <span className="flex items-center justify-between gap-2 sm:block">
                <span className="text-xs text-slate-500 sm:block">Total de servicios</span>
                <span className="font-medium text-slate-700">{formatCRC(cuenta.total)}</span>
              </span>
              <span className="flex items-center justify-between gap-2 sm:block">
                <span className="text-xs text-slate-500 sm:block">Saldo por cobrar</span>
                <span className={`font-bold ${cuenta.saldo > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatCRC(cuenta.saldo)}</span>
              </span>
              <span className="hidden justify-self-end text-slate-400 sm:flex" aria-hidden="true">
                {abierta ? <ChevronDown size={19} /> : <ChevronRight size={19} />}
              </span>
            </button>

            {abierta && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-3 sm:px-5">
                <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_130px_150px_150px] gap-3 px-3 text-[11px] font-semibold uppercase text-slate-500 sm:grid">
                  <span>Servicio</span><span>Fecha</span><span>Estado</span><span className="text-right">Saldo</span>
                </div>
                <div className="space-y-2">
                  {[...cuenta.pagos].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).map((pago) => {
                    const vencido = estaVencido(pago)
                    const estado = estadoDelPago(pago)
                    return (
                      <button
                        type="button"
                        key={pago.id}
                        onClick={() => setDetalle(pago)}
                        className={`grid w-full grid-cols-1 items-center gap-2 rounded-lg border px-3 py-3 text-left transition-colors sm:grid-cols-[minmax(0,1fr)_130px_150px_150px] sm:gap-3 ${vencido ? 'border-red-200 bg-red-50/70 hover:bg-red-50' : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50'}`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {vencido && <AlertTriangle size={15} className="shrink-0 text-red-600" />}
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-800">{pago.concepto || 'Servicio sin nombre'}</span>
                            <span className="block text-xs text-slate-500">Abonado {formatCRC(pago.montoPagado || 0)} de {formatCRC(pago.monto)}</span>
                          </span>
                        </span>
                        <span className="flex justify-between text-sm text-slate-600 sm:block">Fecha <span>{formatDateCR(pago.fecha)}</span></span>
                        <span className="flex justify-between sm:block"><span className="text-xs text-slate-500 sm:hidden">Estado </span><span className={`badge ${ESTILO_PAGO[estado]} ${vencido ? 'ring-1 ring-red-300' : ''}`}>{vencido && <AlertTriangle size={11} className="mr-1" />}{estado}</span></span>
                        <span className="flex justify-between font-bold text-slate-700 sm:justify-end">Saldo <span className={saldoPendiente(pago) > 0 ? 'text-red-700' : 'text-emerald-700'}>{formatCRC(saldoPendiente(pago))}</span></span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )
      })}

      {cuentas.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-12 text-center">
          <p className="font-semibold text-slate-700">No se encontraron clientes</p>
          <p className="mt-1 text-sm text-slate-500">Prueba con otro nombre o estado.</p>
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalle(null) }}>
          <div className="absolute inset-0 bg-slate-950/50" />
          <section role="dialog" aria-modal="true" aria-labelledby="detalle-pago-titulo" className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Detalle del servicio</p>
                <h2 id="detalle-pago-titulo" className="mt-1 text-xl font-bold text-slate-800">{detalle.concepto || 'Servicio sin nombre'}</h2>
                <p className="mt-1 text-sm text-slate-600">{cuentas.find((cuenta) => String(cuenta.clientId) === String(detalle.clientId))?.cliente?.nombre || 'Cliente'}</p>
              </div>
              <button type="button" onClick={() => setDetalle(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar detalle"><X size={19} /></button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <div><p className="text-xs text-slate-500">Estado</p><span className={`badge mt-1 ${ESTILO_PAGO[estadoDelPago(detalle)]}`}>{estadoDelPago(detalle)}</span></div>
              <div><p className="text-xs text-slate-500">Monto del servicio</p><p className="mt-1 font-semibold text-slate-800">{formatCRC(detalle.monto)}</p></div>
              <div><p className="text-xs text-slate-500">Total abonado</p><p className="mt-1 font-semibold text-emerald-700">{formatCRC(detalle.montoPagado || 0)}</p></div>
              <div><p className="text-xs text-slate-500">Saldo pendiente</p><p className={`mt-1 font-bold ${saldoPendiente(detalle) > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatCRC(saldoPendiente(detalle))}</p></div>
              <div><p className="text-xs text-slate-500">Fecha del cobro</p><p className="mt-1 font-medium text-slate-800">{formatDateCR(detalle.fecha)}</p></div>
              <div><p className="text-xs text-slate-500">Fecha de vencimiento</p><p className={`mt-1 font-medium ${estaVencido(detalle) ? 'text-red-700' : 'text-slate-800'}`}>{formatDateCR(detalle.fechaVencimiento)}</p></div>
              <div><p className="text-xs text-slate-500">Método de pago</p><p className="mt-1 font-medium text-slate-800">{detalle.metodo || 'Sin registrar'}</p></div>
              <div><p className="text-xs text-slate-500">Vencido</p><p className={`mt-1 font-medium ${estaVencido(detalle) ? 'text-red-700' : 'text-slate-800'}`}>{estaVencido(detalle) ? 'Sí, más de 30 días' : 'No'}</p></div>
              <div className="sm:col-span-2"><p className="text-xs text-slate-500">Notas</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{detalle.notas || 'Sin notas'}</p></div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => { onEditar(detalle); setDetalle(null) }}>Editar cobro</button>
              <button type="button" className="btn-danger" onClick={() => {
                if (window.confirm('¿Eliminar este cobro? Esta acción no se puede deshacer.')) {
                  onEliminar(detalle.id)
                  setDetalle(null)
                }
              }}>Eliminar</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}