import { Router } from 'express'
import Jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'

export const authenticateToken = Router()

// verifyUser.use((req, res, next) => {
// 	let token = req.headers['x-access-token'] || req.headers['authorization']

// 	if (!token) {
// 		return res.status(401).json({ status: false, errors: ['Unauthrorized'] })
// 	}

// 	if (token.startsWith('Bearer')) {
// 		token = token.slice(7, token.length)
// 		Jwt.verify(token, JWT_SECRET, (error, decoded) => {
// 			if (error) {
// 				return res.status(401).json({ status: false, errors: ['Token Invalid'] })
// 			} else {
// 				req.decoded = decoded
// 				next()
// 			}
// 		})
// 	}
// })

authenticateToken.use = (req, res, next) => {
	const token = req.cookies.mri_token // Extraer token de la cookie

	if (!token) {
		return res.status(401).json({ status: false, message: 'Access Denied. No token provided.' })
	}

	try {
		const verified = Jwt.verify(token, JWT_SECRET)
		req.user = verified // Agrega la información del usuario a `req`
		next() // Continua con la ruta
	} catch (error) {
		return res.status(400).json({ status: false, message: 'Invalid Token' })
	}
}
