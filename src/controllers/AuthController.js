import Jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import User from '../models/userModel'

import { JWT_SECRET, JWT_EXPIRES } from '../config'

const validateUserExist = async (username, email) => {
	const user = await User.findOne({ $or: [{ email: email }, { username: username }] })

	let error

	if (user) {
		error = 'User Exist'
	}

	return [user, error]
}

const validate = async (username, email, password) => {
	let errors = []

	if (username === undefined || username.trim() === '') {
		errors.push('Name should not be empty')
	}

	if (email === undefined || email.trim() === '') {
		errors.push('Email should not be empty')
	}

	if (password === undefined || password.trim() === '' || password.length < 8) {
		errors.push('Password should not be empty and should have at least 8 characters')
	}

	return errors
}

export const createUser = async (req, res) => {
	try {
		const { username, email, password } = req.body

		let validation = await validate(username, email, password)
		const [user, error] = await validateUserExist(username, email)

		// console.log(user, error)

		if (validation == '' && !user) {
			let pass = await bcryptjs.hash(password, 8)
			const userNameCleaned = username.trim().replace(/\s+/g, '')

			const newUser = new User({
				username: userNameCleaned,
				email: email,
				password: pass,
			})

			await newUser.save()

			return res.status(200).json({ status: true, message: 'User Created' })
		} else {
			return res.status(400).json({ status: false, message: validation, error })
		}
	} catch (error) {
		return res.status(500).json({ status: false, message: [error.message] })
	}
}

export const login = async (req, res) => {
	try {
		const { username, email, password } = req.body
		let validation = await validate(username, email, password)

		if (validation == '') {
			let info = await User.findOne({ username: username })

			console.log('Usuario encontrado: ' + info)
			if (info.length == 0 || !(await bcryptjs.compare(password, info.password))) {
				return res.status(404).json({ status: false, errors: ['User does not exist'] })
			}

			const token = Jwt.sign(
				{ id: info._id },
				JWT_SECRET,
				{
					expiresIn: JWT_EXPIRES,
				},
				(err, token) => {
					if (err) console.log(err, 'error con token')
					// res.cookie('token', token)
				}
			)

			const user = { id: info._id, name: info.username, email: info.email, token: token }

			// Guardar el token en una cookie HTTP-only
			// res.cookie('mri_token', token, {
			// 	httpOnly: true,
			// 	secure: process.env.NODE_ENV === 'production',
			// 	sameSite: 'strict',
			// 	maxAge: 1000 * 60 * 60,
			// })

			return res.status(200).json({ status: true, data: user, message: 'Access Successful' })
		} else {
			return res.status(400).json({ status: false, message: validation })
		}
	} catch (error) {
		return res.status(500).json({ status: false, message: [error.message] })
	}
}
