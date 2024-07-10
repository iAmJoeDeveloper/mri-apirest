import mongoose from 'mongoose'

const Schema = mongoose.Schema

const packageSchema = new Schema(
	{
		name: { type: String, required: true },
		status: { type: String, enum: ['pending', 'completed', 'canceled'] },
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('package', packageSchema)
