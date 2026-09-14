import { useMemo } from 'react'
import { paymentsApi, expensesApi } from '../Services/api'
import { useEntity } from './useEntity'
import { estaVencido, saldoPendiente } from '../Utils/formatters'

export function usePayments() {
  const entity = useEntity(paymentsApi)
  const gastos = useEntity(expensesApi)

  const vencidos = useMemo(
    () => entity.data.filter((p) => estaVencido(p)),
    [entity.data]
  )

  const resumenPorCliente = useMemo(() => {
    const map = {}
    entity.data.forEach((p) => {
      map[p.clientId] ||= { total: 0, pagado: 0, pendiente: 0 }
      map[p.clientId].total += p.monto
      map[p.clientId].pagado += p.montoPagado || 0
      map[p.clientId].pendiente += saldoPendiente(p)
    })
    return map
  }, [entity.data])

  return { ...entity, gastos: gastos.data, refetchGastos: gastos.refetch, vencidos, resumenPorCliente }
}
