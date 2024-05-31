import { Router } from 'express'
import {
	getHeaders,
	createInvoice,
	getBatchOfInvoices,
	sendInvoices,
} from '../controllers/facturaComercial.controller'

const router = Router()

router.get('/factura/batch/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)

router.get('/facturas', getHeaders)

router.get('/createFactura/:datas', createInvoice)

router.get('/factura/sendInvoices', sendInvoices)

router.get('facturas/getList', (req, res) => {
	console.log('getting list')
})

export default router
