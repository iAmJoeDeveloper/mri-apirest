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

router.get('/facturas', getHeaders) // Out of using - It is been using inside controller

router.get('/createFactura/:datas', createInvoice) // Out of using - It is been using inside controller

router.get('/facturas/sendInvoices', sendInvoices)

//Test API
router.post('/show', (req, res) => {
	const receiveObject = req.body
	console.log('Objeto recibido desde API: ')
	console.log(receiveObject)

	res.status(200)
})

router.get('/consultInbox/:value?', async (req, res) => {
	const { value } = req.params
	const url = value
		? `https://fileconnector.voxelgroup.net/inbox/${value}`
		: 'https://fileconnector.voxelgroup.net/inbox'

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
			throw new Error(`Response status: ${request.status}`)
		}

		const response = await request.text()
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
