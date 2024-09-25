import express from 'express'

import cors from 'cors'
import bodyParser from 'body-parser'
import config from './config'

import invoicesRoutes from './routes/invoices.routes'
import facturaRoutes from './routes/facturaComercial.routes'
import packageRoutes from './routes/packages.routes'
import qrcodesRoutes from './routes/qrcodes.routes'
import authRoutes from './routes/Auth.routes'
import arRoutes from './routes/ar_invoices.routes'
import ncRoutes from './routes/nc_invoices.routes'
import ncarRoutes from './routes/ncar_invoices.routes'
import userRoutes from './routes/users.routes'

import cookieParser from 'cookie-parser'

const app = express()

//Middlelwares
app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cookieParser())

//settings
// app.set('port', config.port)

app.use(
	invoicesRoutes,
	facturaRoutes,
	packageRoutes,
	qrcodesRoutes,
	authRoutes,
	arRoutes,
	ncRoutes,
	ncarRoutes,
	userRoutes
)

export default app
