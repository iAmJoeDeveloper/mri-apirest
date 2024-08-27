import fs from 'fs'
import QRCode from 'qrcode'
import Package from '../models/packageModel'

//Enlances
const test = 'https://ecf.dgii.gov.do/testecf/ConsultaTimbre?'
const certificación = 'https://ecf.dgii.gov.do/certecf/ConsultaTimbre?'
const producción = 'https://ecf.dgii.gov.do/ecf/ConsultaTimbre?'
const RNCEmisor = ''
const RncComprador = ''
const ENCF = ''
const fechaEmision = '22-12-1993'
const MontoTotal = '' //(En DOP)
const FechaFirma = '' //(dd-mm-aaaa hh:mm:ss entre fecha y hora se debe colocar %20 que representa un espacio en HTML)
const codigoSeguridad = '123456' //los 6 primeros dígitos de la firma digital

const createQRhtml = async (req, res) => {
	const formato = `${test}${certificación}${fechaEmision}${codigoSeguridad}`
	const QR = await QRCode.toDataURL(formato)

	const htmlContent = `<div><img src="${QR}"></div>`

	fs.writeFileSync('./QRcode.html', `${htmlContent}`)
}

const creatingQR = (entity, mriInvoiceNumber, ncf, url) => {
	QRCode.toFile(
		`./mri_qrcodes/${entity}-${mriInvoiceNumber}-${ncf}.png`,
		url,
		{
			width: 150,
			color: {
				dark: '#000', // Blue dots
				light: '#0000', // Transparent background
			},
		},
		function (err) {
			if (err) throw err
			console.log(`${ncf} - QR Code done`)
		}
	)
}

const findURLs = async (ncf) => {
	try {
		//Await Fetch
		const url = `https://fileconnector.voxelgroup.net/inbox/PDF_${ncf}.json`

		console.log(url)

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
			throw new Error(`Response status: ${request.status}`)
		}

		const response = await request.json()
		// console.log(response.DGII.QR)

		return response.DGII.QR
	} catch (error) {
		// Handle your error
		console.log(error)
	}
}

const generate = async (req, res) => {
	const { id } = req.params

	let qrBox = []

	try {
		const pack = await Package.findById(id)

		if (!pack) {
			return res.status(404).json({ message: 'Package not found' })
		}

		//Filtering completed invoices
		const invoicesCompleted = pack.invoices.filter((item) => item.status == 'completed')

		//Find url's
		await Promise.all(
			invoicesCompleted.map(async (item) => {
				const url = await findURLs(item.ncf)
				qrBox.push({ entity: pack.entity, mriNumber: item.ref, ncf: item.ncf, url: url })
			})
		)

		//Print QR's
		qrBox.map((item) => {
			creatingQR(item.entity, item.mriNumber, item.ncf, item.url)
		})

		return res.status(200).json({ pack })
	} catch (error) {
		// console.error('Error in getPackageById:', error)
		console.error(`Error in getPackageById: ${id}`)
		return res.status(500).json({ error: 'Internal server error' })
	}

	//---------------------------------------

	// const { value } = req.params
	// const url = value
	// 	? `https://fileconnector.voxelgroup.net/inbox/${value}`
	// 	: 'https://fileconnector.voxelgroup.net/inbox'

	// const url = `https://fileconnector.voxelgroup.net/inbox/PDF_E310000000015.json`

	// try {
	// 	//Await Fetch
	// 	const request = await fetch(url, {
	// 		method: 'GET',
	// 		mode: 'cors',
	// 		credentials: 'include',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Authorization: 'Basic ' + btoa('bluemallrdtest:Suheh3-Kugoz6'),
	// 		},
	// 		'Access-Control-Allow-Origin': '*',
	// 		'Access-Control-Allow-Credentials': true,
	// 	})

	// 	if (!request.ok) {
	// 		throw new Error(`Response status: ${request.status}`)
	// 	}

	// 	const response = await request.text()
	// 	console.log(response)
	// 	res.send(response)
	// } catch (error) {
	// 	// Handle your error
	// 	console.log(error)
	// 	res.status(500).send(error.message)
	// }
}

export { generate }
