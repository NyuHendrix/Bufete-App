export function requireCsrf(request, response, next) {
  const method = (request.method || 'GET').toUpperCase()

  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    next()
    return
  }

  const headerToken = request.headers['x-csrf-token']
  const cookieToken = request.cookies?.csrfToken

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    response.status(403).json({ message: 'CSRF token inválido o faltante' })
    return
  }

  next()
}
