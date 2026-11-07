import crypto from 'node:crypto'
import env from '../config/env.js'
import { userModel } from '../models/userModel.js'
import { issueTokenPair, rotateRefreshToken, revokeRefreshToken } from '../services/authService.js'

function setRefreshCookie(response, token) {
  response.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  const csrfToken = crypto.randomUUID()
  response.cookie('csrfToken', csrfToken, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return csrfToken
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body
    const user = await userModel.findByEmail(email)

    if (!user || !(await userModel.verifyPassword(password, user.password_hash))) {
      response.status(401).json({ message: 'Credenciales inválidas' })
      return
    }

    const { accessToken, refreshToken } = await issueTokenPair(user)
    const csrfToken = setRefreshCookie(response, refreshToken)

    response.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
      },
      accessToken,
      csrfToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function refreshToken(request, response, next) {
  try {
    const token = request.cookies?.refreshToken
    if (!token) {
      response.status(401).json({ message: 'No existe refresh token' })
      return
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(token)
    const csrfToken = setRefreshCookie(response, refreshToken)

    response.status(200).json({ accessToken, csrfToken })
  } catch (error) {
    response.clearCookie('refreshToken')
    response.clearCookie('csrfToken')
    response.status(401).json({ message: 'Refresh token inválido o expirado' })
  }
}

export async function logout(request, response, next) {
  try {
    const token = request.cookies?.refreshToken
    if (token) {
      await revokeRefreshToken(token)
    }
    response.clearCookie('refreshToken')
    response.clearCookie('csrfToken')
    response.status(200).json({ message: 'Sesión cerrada' })
  } catch (error) {
    next(error)
  }
}

export async function me(request, response, next) {
  try {
    const user = await userModel.findById(request.user.sub)
    if (!user) {
      response.status(404).json({ message: 'Usuario no encontrado' })
      return
    }

    response.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
    })
  } catch (error) {
    next(error)
  }
}
