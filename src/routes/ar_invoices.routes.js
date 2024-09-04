import { Router } from 'express'
import {
	getHeaders,
	createInvoice,
	getBatchOfInvoices,
	sendInvoices,
} from '../controllers/ar_invoices.controller'

const router = Router()

router.get('/arinvoices', getHeaders) // Out of using - It is been using inside controller
router.get('/arcreateFactura/:datas', createInvoice) // Out of using - It is been using inside controller
router.get('/arinvoices/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)
router.get('/arinvoices/sendInvoices', sendInvoices)

export default router
