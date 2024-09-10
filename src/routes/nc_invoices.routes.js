import { Router } from 'express'
import { getBatchOfInvoices, sendInvoices } from '../controllers/nc_invoices.controller'

const router = Router()

router.get('/ncinvoices/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)
router.get('/ncinvoices/sendInvoices', sendInvoices)

export default router
