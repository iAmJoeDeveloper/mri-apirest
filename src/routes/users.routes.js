import { Router } from 'express'
import {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} from '../controllers/users.controller'
import { validateSchema } from '../middleware/validator.middleware.js'
import { registerSchema } from '../schemas/auth.schema.js'

const router = Router()

router.get('/users', getUsers)
router.get('/users/:id', getUser)
router.post('/users', validateSchema(registerSchema), createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

export default router
