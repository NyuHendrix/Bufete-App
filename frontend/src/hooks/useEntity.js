// Hook genérico de CRUD con manejo de carga y errores
import { useState, useEffect, useCallback } from 'react'

export function useEntity(api, { autoLoad = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAll()
      if (!Array.isArray(res)) throw new Error('La respuesta de la API no es una lista')
      setData(res)
    } catch {
      setData([])
      setError('No se pudieron cargar los datos. ¿Está corriendo json-server? (npm run server)')
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    if (autoLoad) void Promise.resolve().then(fetchAll)
  }, [fetchAll, autoLoad])

  const create = async (payload) => {
    const nuevo = await api.create(payload)
    setData((prev) => [...prev, nuevo])
    return nuevo
  }

  const update = async (id, payload) => {
    const actualizado = await api.update(id, payload)
    setData((prev) => prev.map((x) => (x.id === id ? actualizado : x)))
    return actualizado
  }

  const remove = async (id) => {
    await api.remove(id)
    setData((prev) => prev.filter((x) => x.id !== id))
  }

  return { data, loading, error, refetch: fetchAll, create, update, remove, setData }
}
