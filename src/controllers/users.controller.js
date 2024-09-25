import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'

export const getUsers = async (req, res) => {
	const users = await User.find()

	res.json(users)
}

export const createUser = async (req, res) => {
	const { email, password, username, role } = req.body

	// Check if the email already exists
	const emailUser = await User.findOne({ email: req.body.email })
	const usernameUser = await User.findOne({ username: req.body.username })

	if (emailUser) return res.status(400).json({ email: 'Email already exists' })
	if (usernameUser) return res.status(400).json({ username: 'Username already exists' })

	try {
		const passwordHash = await bcrypt.hash(password, 10)

		const newUser = new User({
			username,
			email,
			password: passwordHash,
			role,
		})

		const userSaved = await newUser.save()

		res.json({
			id: userSaved._id,
			username: userSaved.username,
			email: userSaved.email,
			role: userSaved.role,
		})
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

export const getUser = async (req, res) => {
	const user = await User.findById(req.params.id)

	if (!user) return res.status(404).json({ message: 'User not found' })

	res.json(user)
}

export const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id)

		if (!user) return res.status(404).json({ message: 'User not found' })

		res.status(200).json({ message: 'User deleted successfully' })
	} catch (error) {
		res.status(500).json({ message: 'Error trying to delete user' })
	}
}

export const updateUser = async (req, res) => {
	// const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })

	// if (!user) return res.status(404).json({ message: 'User not found' })

	const { id } = req.params // ID del usuario
	const { username, email, role, password } = req.body // Datos a actualizar

	// Buscar el usuario por ID
	const user = await User.findById(id)
	if (!user) {
		return res.status(404).json({ message: 'User not found' })
	}

	// Actualizar campos opcionales
	if (username) user.username = username
	if (email) user.email = email
	if (role) user.role = role

	// Actualizar contraseña opcionalmente
	if (password) {
		const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(password, salt)
	}

	// Guardar cambios en la base de datos
	const updatedUser = await user.save()

	// Retornar el usuario actualizado
	res.status(200).json(updatedUser)

	// res.json(user)
}
