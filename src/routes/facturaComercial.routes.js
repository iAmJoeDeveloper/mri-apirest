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

router.post('/facturas/sendInvoices', sendInvoices)
router.post('/show', (req, res) => {
	const receiveObject = req.body
	console.log('Objeto recibido desde API: ')
	console.log(receiveObject)

	res.status(200)
})

router.get('facturas/getList', (req, res) => {
	console.log('getting list')
})

export default router
