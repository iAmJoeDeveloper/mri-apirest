import { Router } from 'express'
import { getBatchOfInvoices, sendInvoices } from '../controllers/nc_invoices.controller'

const router = Router()

router.get('/ncinvoices/:invoice1/:invoice2/:createInvoice?', getBatchOfInvoices)
router.get('/ncinvoice/sendInvoices/:username?', sendInvoices)

export default router
