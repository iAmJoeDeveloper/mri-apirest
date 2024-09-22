import { Router } from 'express'
import { getBatchOfInvoices, sendInvoices } from '../controllers/ncar_invoices.controller'

const router = Router()

router.get('/ncarinvoices/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)
router.get('/ncarinvoice/sendInvoices/:username?', sendInvoices)

export default router
