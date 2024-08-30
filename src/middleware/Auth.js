import { Router } from 'express'
import Jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'

export const verifyUser = Router()

verifyUser.use((req, res, next) => {
	let token = req.headers['x-access-token'] || req.headers['authorization']

	if (!token) {
		return res.status(401).json({ status: false, errors: ['Unauthrorized'] })
	}

	if (token.startsWith('Bearer')) {
		token = token.slice(7, token.length)
		Jwt.verify(token, JWT_SECRET, (error, decoded) => {
			if (error) {
				return res.status(401).json({ status: false, errors: ['Token Invalid'] })
			} else {
				req.decoded = decoded
				next()
			}
		})
	}
})
