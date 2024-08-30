import { Router } from 'express'
import { createUser, login } from '../controllers/AuthController'

const router = Router()

router.get('/users', (req, res) => {
	res.send('Raíz de usuarios')
})

router.post('/login', login)
router.post('/register', createUser)
router.post('/logout', (req, res) => {})

router.get('/protected', (req, res) => {})

export default router
