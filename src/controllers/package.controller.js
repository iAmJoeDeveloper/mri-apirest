import Package from '../models/packageModel'
import { generateRandomString } from '../utils/randomStrings'
import convert from 'xml-js'

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
const getPackageById = async (req, res) => {
	const invoiceId = req.params.id

	try {
		const pack = await Package.findById(invoiceId)

		if (!pack) {
			return res.status(404).json({ message: 'Package not found' })
		}

		const results = await checkingStatus(pack, res)

		// Ver respuestas
		await Promise.all(
			results.map(async (result) => {
				// console.log(result.RespuestaConsultaTrackId.Encf)
				// console.log(result.RespuestaConsultaTrackId.Codigo)
				// console.log(result.RespuestaConsultaTrackId.Estado)
				let ncf = result.RespuestaConsultaTrackId.Encf._text
				let code = result.RespuestaConsultaTrackId.Codigo._text
				let estado = result.RespuestaConsultaTrackId.Estado._text

				if (code == '1') {
					// Estado "Aceptado"
					return await updateInvoiceStatus(invoiceId, ncf)
				}
			})
		)

		return res.status(200).json({ pack, results })
	} catch (error) {
		console.error('Error in getPackageById:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
}

const updateInvoiceStatus = async (packageId, ncf) => {
	try {
		const result = await Package.updateOne(
			{
				_id: packageId,
				'invoices.ncf': ncf,
			},
			{
				$set: { 'invoices.$.status': 'completed' },
			}
		)

		if (result.modifiedCount > 0) {
			console.log(`Invoice with NCF ${ncf} updated to 'complete'.`)

			// Ahora, verifica si todos los invoices tienen un estado diferente de 'pending'
			const pack = await Package.findById(packageId)

			const allInvoicesComplete = pack.invoices.every((invoice) => invoice.status !== 'pending')

			if (allInvoicesComplete && pack.status !== 'completed') {
				//Si todos los invoices están completos, actualiza el estado general del paquete
				pack.status = 'completed'
				await pack.save()
				console.log(`Package ${packageId} status updated to 'completed'.`)
			}
		} else {
			console.log('No invoice found or status was already complete.')
		}
	} catch (error) {
		console.error('Error updating invoice status:', error)
	}
}

const checkingStatus = async (pack, res) => {
	const invoices = pack.invoices || []

	const requests = invoices.map(fetchInvoiceStatus)

	try {
		const results = await Promise.all(requests)
		return results
	} catch (error) {
		throw new Error('Error processing invoices status')
	}
}

const fetchInvoiceStatus = async (invoice) => {
	const url = `https://fileconnector.voxelgroup.net/inbox/RespuestaConsultaTrackId_${invoice.ncf}.xml`

	try {
		const response = await fetch(url, {
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

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const xml = await response.text()

		// Parsear el XML a JSON
		const json = await convert.xml2js(xml, { compact: true, spaces: 4 })

		return json
	} catch (error) {
		console.error(`Error fetching status for invoice ${invoice.ncf}:`, error)
		throw error // Re-throw the error so it can be handled by the calling function
	}
}

export { getPackages, createPackage, getPackageById }
