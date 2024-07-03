import { Router } from 'express'
import {
	getHeaders,
	createInvoice,
	getBatchOfInvoices,
	sendInvoices,
} from '../controllers/facturaComercial.controller'
// import { sendInvoices } from '../controllers/facturaComercial_modules/sendInvoice'

const router = Router()

router.get('/factura/batch/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)

router.get('/facturas', getHeaders)

router.get('/createFactura/:datas', createInvoice)

router.get('/facturas/sendInvoices', sendInvoices)

//Test API
router.post('/show', (req, res) => {
	const receiveObject = req.body
	console.log('Objeto recibido desde API: ')
	console.log(receiveObject)

	res.status(200)
})

router.get('/consultInbox', async (req, res) => {
	try {
		//Await Fetch
		const request = await fetch(`https://fileconnector.voxelgroup.net/inbox`, {
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

		const response = await request.text()
		console.log(response)
		res.send(response)
	} catch (error) {
		// Handle your error
		console.log(error)
		res.status(500).send(error.message)
	}
})

router.get('facturas/getList', (req, res) => {
	console.log('getting list')
})

export default router
