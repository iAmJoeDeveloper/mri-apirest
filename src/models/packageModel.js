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
		tag: { type: String, enum: ['AR', 'CM', 'NC-CM', 'NC-AR'], required: true },
		invoices: [InvoiceSchema],
		user: { type: String, required: true },
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Package', PackageSchema)
