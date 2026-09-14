import { useMemo, useState } from 'react'
import { clientsApi } from '../Services/api'
import { useEntity } from './useEntity'

export function useClients() {
  const entity = useEntity(clientsApi)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return entity.data
    return entity.data.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.cedula.replace(/-/g, '').includes(q.replace(/-/g, '')) ||
        (c.email || '').toLowerCase().includes(q)
    )
  }, [entity.data, busqueda])

  return { ...entity, busqueda, setBusqueda, filtrados }
}
