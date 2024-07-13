import Package from './../models/packageModel'
import { generateRandomString } from '../utils/randomStrings'

// Controlador para crear un nuevo paquete
const createPackage = async (req, res) => {
	const { invoiceBox } = req.body
	try {
		const packageData = {
			name: generateRandomString(10),
			status: 'pending',
			tag: 'CM',
			invoices: invoiceBox.map((invoice) => ({
				ncf: invoice.Transaction.GeneralData._attributes.NCF,
				ref: invoice.Transaction.GeneralData._attributes.Ref,
				status: 'pending',
				date: invoice.Transaction.GeneralData._attributes.Date,
			})),
		}
		console.log('Datos del paquete generados:', packageData)
		const newPackage = new Package(packageData)
		console.log('Instancia de paquete creada:', newPackage)
		await newPackage.save()
		console.log('Paquete guardado en la base de datos')
		res.status(201).json({ message: 'Package created successfully', data: newPackage })
		console.log('Respuesta enviada con éxito')
	} catch (error) {
		res.status(500).json({ message: 'Error creating package', error })
	}

	// Only one register working
	// try {
	// 	const packageData = {
	// 		name: 'Test Package',
	// 		status: 'pending',
	// 		tag: 'CM',
	// 		invoices: [
	// 			{
	// 				ncf: '123456',
	// 				ref: 'INV003',
	// 				status: 'pending',
	// 				date: new Date(),
	// 			},
	// 			{
	// 				ncf: '654321',
	// 				ref: 'INV004',
	// 				status: 'canceled',
	// 				date: new Date(),
	// 			},
	// 		],
	// 	}
	// 	const newPackage = new Package(packageData)
	// 	await newPackage.save()
	// 	res.status(201).json({ message: 'Package created successfully', data: newPackage })
	// } catch (error) {
	// 	res.status(500).json({ message: 'Error creating package', error })
	// }
}

// Controlador para obtener todos los paquetes
const getPackages = async (req, res) => {
	try {
		const pack = await Package.find().exec()

		// if (!p.length) {
		// 	const message = 'No existen registros'
		// }

		res.status(200).json({ pack })
	} catch (error) {
		console.log(error)
		res.status(500).json({ error })
	}
}

export { getPackages, createPackage }
