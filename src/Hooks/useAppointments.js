import { useMemo } from 'react'
import { appointmentsApi } from '../Services/api'
import { useEntity } from './useEntity'
import { citasSeTraslapa, esProxima24h } from '../Utils/formatters'

export function useAppointments() {
  const entity = useEntity(appointmentsApi)

  /** Confirma si una cita candidata choca con la agenda existente */
  const tieneConflicto = (candidata) =>
    entity.data.some((a) => citasSeTraslapa(a, candidata))

  const proximas24h = useMemo(
    () => entity.data.filter((a) => a.estado === 'Programada' && esProxima24h(a.fecha, a.hora, 24)),
    [entity.data]
  )

  const conflictos = useMemo(() => {
    const lista = entity.data.filter((a) => a.estado !== 'Cancelada')
    const pares = []
    for (let i = 0; i < lista.length; i++)
      for (let j = i + 1; j < lista.length; j++)
        if (citasSeTraslapa(lista[i], lista[j])) pares.push([lista[i], lista[j]])
    return pares
  }, [entity.data])

  const porFecha = useMemo(() => {
    const map = {}
    entity.data.forEach((a) => {
      ;(map[a.fecha] ||= []).push(a)
    })
    Object.values(map).forEach((arr) => arr.sort((x, y) => x.hora.localeCompare(y.hora)))
    return map
  }, [entity.data])

  return { ...entity, tieneConflicto, proximas24h, conflictos, porFecha }
}
