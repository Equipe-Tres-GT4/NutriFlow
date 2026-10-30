import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { currentUser, login, logout, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
})

router.post('/register', loginLimit, register)
router.post('/login', loginLimit, login)
router.get('/me', requireAuth, currentUser)
router.post('/logout', logout)

export default router