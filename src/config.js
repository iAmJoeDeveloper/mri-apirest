import { config } from 'dotenv'
config()

export default {
	port: process.env.PORT || 3000,
}

// JWT
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES = process.env.JWT_EXPIRES
