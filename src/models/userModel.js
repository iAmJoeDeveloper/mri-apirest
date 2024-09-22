import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		username: { type: String, minLength: 3, maxLength: 20, trim: true, required: true },
		email: { type: String, trim: true, required: true },
		password: { type: String, minLength: 4, required: true },
		role: { type: String, enum: ['admin', 'user'], required: true },
	},
	{
		timestamps: true,
	},
	{ versionKey: false }
)

module.exports = mongoose.model('User', userSchema)
