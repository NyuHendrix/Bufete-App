import { body, validationResult } from 'express-validator'

export const validateRequest = (validators) => [
  ...validators,
  (request, response, next) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      response.status(400).json({ message: 'Validación fallida', errors: errors.array() })
      return
    }
    next()
  },
]

export const clientValidator = validateRequest([
  body('nombre').trim().isLength({ min: 2 }).withMessage('El nombre es obligatorio'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('El email es inválido'),
])

export const appointmentValidator = validateRequest([
  body('client_id').isInt({ min: 1 }).withMessage('El cliente es obligatorio'),
  body('fecha').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('La fecha debe tener formato YYYY-MM-DD'),
  body('hora').matches(/^\d{2}:\d{2}$/).withMessage('La hora debe tener formato HH:MM'),
  body('tipo').trim().isLength({ min: 2 }),
])

export const paymentValidator = validateRequest([
  body('client_id').isInt({ min: 1 }).withMessage('El cliente es obligatorio'),
  body('concepto').trim().isLength({ min: 2 }).withMessage('El concepto es obligatorio'),
  body('monto').isFloat({ min: 0 }).withMessage('Monto inválido'),
])
