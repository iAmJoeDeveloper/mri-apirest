import { Router } from 'express'
import { register, login, logout, profile, verifyToken } from '../controllers/AuthController'
import { authRequire } from '../middleware/validateToken'
import { validateSchema } from '../middleware/validator.middleware.js'
import { loginSchema, registerSchema } from '../schemas/auth.schema.js'

const router = Router()

router.get('/users', (req, res) => {
	res.send('Raíz de usuarios')
})

router.post('/login', validateSchema(loginSchema), login)
router.post('/register', validateSchema(registerSchema), register)
router.post('/logout', logout)

router.get('/profile', authRequire, profile)

router.get('/verify-token', verifyToken)

export default router
