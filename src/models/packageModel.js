import mongoose from 'mongoose'

const Schema = mongoose.Schema

const InvoiceSchema = new Schema({
	ncf: { type: String, required: true },
	ref: { type: String, required: true },
	status: {
		type: String,
		enum: ['pending', 'completed', 'rejected', 'conditional accepted'],
		required: true,
	},
	date: { type: String, required: true },
})

const PackageSchema = new Schema(
	{
		name: { type: String, required: true },
		entity: { type: String, required: true },
		status: { type: String, enum: ['pending', 'completed', 'rejected'], required: true },
		tag: { type: String, enum: ['AR', 'CM'], required: true },
		invoices: [InvoiceSchema],
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Package', PackageSchema)
