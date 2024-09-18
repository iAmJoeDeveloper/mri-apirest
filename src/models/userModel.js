import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		username: { type: String, minLength: 3, maxLength: 20, trim: true, required: true },
		email: { type: String, trim: true, required: true },
		password: { type: String, minLength: 8, required: true },
	},
	{
		timestamps: true,
	},
	{ versionKey: false }
)

module.exports = mongoose.model('User', userSchema)
