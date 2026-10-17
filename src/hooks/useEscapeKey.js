import { useEffect, useRef } from 'react'

const handlers = new Map()
let nextId = 0

const handleKeyDown = (event) => {
  if (event.key !== 'Escape') return
  const latestHandler = [...handlers.values()].at(-1)
  if (!latestHandler) return
  event.preventDefault()
  latestHandler(event)
}

export function useEscapeKey(active, onEscape) {
  const callback = useRef(onEscape)

  useEffect(() => {
    callback.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active) return undefined

    const id = ++nextId
    handlers.set(id, (event) => callback.current(event))
    if (handlers.size === 1) document.addEventListener('keydown', handleKeyDown)

    return () => {
      handlers.delete(id)
      if (handlers.size === 0) document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])
}