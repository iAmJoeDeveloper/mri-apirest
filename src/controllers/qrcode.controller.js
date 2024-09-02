import fs from 'fs'
import QRCode from 'qrcode'
import Jimp from 'jimp'
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

const creatingQR = async (entity, mriInvoiceNumber, ncf, url, fechaFirma, codigoSeguridad) => {
	const CodigoSeguridad = `Codigo de Seguridad: ${codigoSeguridad}`
	const FechaFirma = `Fecha de Firma Digital: ${fechaFirma}`

	try {
		// Generate QR as a buffer
		const qrBuffer = await QRCode.toBuffer(url, {
			width: 150,
			color: {
				dark: '#000', // Black dots
				light: '#0000', // Transparent background
			},
		})

		// Upload QR code in Jimp
		const qrImage = await Jimp.read(qrBuffer)

		// Create a image with white background to the text
		const font = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)

		// Define margins
		const leftMargin = 10
		const rightMargin = 10

		//Measure width and height first text
		const text1Width = Jimp.measureText(font, CodigoSeguridad)
		const text1Height = Jimp.measureTextHeight(font, CodigoSeguridad, text1Width)

		//Measure width and height second text
		const text2Width = Jimp.measureText(font, FechaFirma)
		const text2Height = Jimp.measureTextHeight(font, FechaFirma, text2Width)

		// Calculate total width and height needed
		const totalTextWidth = Math.max(text1Width, text2Width)
		const totalTextHeight = text1Height + text2Height + 10 // 10px de espacio entre los textos

		// Create a new image with QR and Text combined
		const finalImage = new Jimp(
			Math.max(qrImage.bitmap.width, totalTextWidth + leftMargin + rightMargin),
			qrImage.bitmap.height + totalTextHeight + 10,
			'#0000'
		)

		// Center the QR code horizontally
		finalImage.composite(qrImage, (finalImage.bitmap.width - qrImage.bitmap.width) / 2, 0)

		// Print the first text aligned to the left
		finalImage.print(font, leftMargin, qrImage.bitmap.height + 10, CodigoSeguridad)

		// Print the second text aligned to the left, with some margin from the left and right borders
		finalImage.print(font, leftMargin, qrImage.bitmap.height + text1Height + 15, {
			text: FechaFirma,
			alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
			alignmentY: Jimp.VERTICAL_ALIGN_TOP,
			maxWidth: finalImage.bitmap.width - rightMargin - leftMargin, // Add right margin
		})

		// Guardar la imagen final
		await finalImage.writeAsync(`./mri_qrcodes/${entity}-${mriInvoiceNumber}-${ncf}.png`)
		console.log(`${ncf} - QR Code with text done`)
	} catch (error) {
		console.error('Error generating QR code with text:', error)
	}

	// Old QRCode Generator
	// QRCode.toFile(
	// 	`./mri_qrcodes/${entity}-${mriInvoiceNumber}-${ncf}.png`,
	// 	url,
	// 	{
	// 		width: 150,
	// 		color: {
	// 			dark: '#000', // Blue dots
	// 			light: '#0000', // Transparent background
	// 		},
	// 	},
	// 	function (err) {
	// 		if (err) throw err
	// 		console.log(`${ncf} - QR Code done`)
	// 	}
	// )
}

const findURLs = async (ncf) => {
	try {
		//Await Fetch
		const url = `https://fileconnector.voxelgroup.net/inbox/PDF_${ncf}.json`

		// console.log(url)

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

		const responseData = {
			qr: response.DGII.QR,
			fechaFirma: response.DGII.FechaFirma,
			codigoSeguridad: response.DGII.CodigoSeguridad,
		}

		return responseData
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
		const invoicesCompleted = pack.invoices.filter(
			(item) => item.status === 'completed' || item.status === 'conditional accepted'
		)

		//Find url's
		await Promise.all(
			invoicesCompleted.map(async (item) => {
				const responseData = await findURLs(item.ncf)

				qrBox.push({
					entity: pack.entity,
					mriNumber: item.ref,
					ncf: item.ncf,
					url: responseData.qr,
					fechaFirma: responseData.fechaFirma,
					codigoSeguridad: responseData.codigoSeguridad,
				})
			})
		)

		//Print QR's
		qrBox.map((item) => {
			creatingQR(
				item.entity,
				item.mriNumber,
				item.ncf,
				item.url,
				item.fechaFirma,
				item.codigoSeguridad
			)
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
