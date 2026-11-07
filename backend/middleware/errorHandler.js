export function notFoundHandler(request, response) {
  response.status(404).json({ message: 'Ruta no encontrada' })
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error)
    return
  }

  const status = error.status || 500
  const message = status >= 500 ? 'Error interno del servidor' : (error.message || 'Solicitud inválida')

  response.status(status).json({ message })
}
