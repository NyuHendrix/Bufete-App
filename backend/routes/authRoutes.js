import { Router } from 'express'
import { login, logout, me, refreshToken } from '../controllers/authController.js'
import { loginValidator } from '../validators/authValidator.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', loginValidator, login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
