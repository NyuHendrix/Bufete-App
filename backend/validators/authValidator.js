import { body, validationResult } from 'express-validator'

export const loginValidator = [
  body('email').isEmail().withMessage('El email es inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  (request, response, next) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      response.status(400).json({ message: 'Datos de entrada inválidos', errors: errors.array() })
      return
    }
    next()
  },
]

export const registerValidator = [
  body('name').trim().isLength({ min: 2 }).withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El email es inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  (request, response, next) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      response.status(400).json({ message: 'Datos de entrada inválidos', errors: errors.array() })
      return
    }
    next()
  },
]
