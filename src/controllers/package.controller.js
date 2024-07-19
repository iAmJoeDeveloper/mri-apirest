import Package from '../models/packageModel'
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
		//Testing
		// console.log('Datos del paquete generados:', packageData)
		const newPackage = new Package(packageData)
		// console.log('Instancia de paquete creada:', newPackage)
		await newPackage.save()
		console.log('Paquete guardado en la base de datos')
		res.status(201).json({ message: 'Package created successfully', data: newPackage })
		// console.log('Respuesta enviada con éxito')
	} catch (error) {
		res.status(500).json({ message: 'Error creating package', error })
	}
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

// Checking status invoices
const checkStatus = async (req, res) => {
	const invoiceId = req.params.id
	const url = `https://fileconnector.voxelgroup.net/inbox/RespuestaConsultaTrackId_${invoiceId}.xml`

	try {
		//Await Fetch
		const request = await fetch(url, {
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + btoa('bluemallrdtest:Suheh3-Kugoz6'),
			},
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': true,
		})

		if (!request.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const response = await request.text()
		res.send(response)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching document status', error })
	}

	// res.send(url)
}

export { getPackages, createPackage, checkStatus }
