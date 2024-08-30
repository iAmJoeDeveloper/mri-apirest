import { getConnection } from '../database/remoteConnection'
import { json2xml, xml2json } from 'xml-js'
import fs from 'fs'
import path from 'path'

//Others controllers
import { createPackage } from './package.controller'

//Modules
import { formatTax, filterTaxes } from './facturaComercial_modules/formatTaxes'
import { sendInvoice, sendInvoiceBavel } from './facturaComercial_modules/sendInvoice'
import { taxLinked } from './facturaComercial_modules/taxLinked'
import { exentLinked } from './facturaComercial_modules/exentLinked'

//Utils
import { sanitizeCompanyName } from '../utils/sanitizeCompanyName'
import { emptyTrim } from '../utils/emptyTrim'

//BD
import mongoose, { mongo } from 'mongoose'
import Package from '../models/packageModel'
import dotenv from 'dotenv'
dotenv.config()
const MONGO_URL = process.env.MONGO_URL

let invoiceBox

export const getBatchOfInvoices = async (req, res) => {
	const invoice1 = req.params.invoice1
	const invoice2 = req.params.invoice2
	const crearFactura = req.params.createInvoice

	const queryStructure = `SELECT invoice AS ref
	,tipoingreso = '2'
    ,tipopago = '2'
    ,cif = (
		SELECT PHONE
		FROM entity
		WHERE ENTITYID = ARLEDG.ENTITYID
		)
    , company = (
		SELECT NAME
		FROM entity
		WHERE ENTITYID = ARLEDG.ENTITYID
		
    )
    , address = (
		SELECT ADDR1
		FROM entity
		WHERE ENTITYID = ARLEDG.ENTITYID
		)
    , city = (
		SELECT CITY
		FROM entity
		WHERE ENTITYID = ARLEDG.ENTITYID
		)
	,country = 'DOM'
	,type = 'Phone'
	,number = (
		SELECT MAINPHONE
		FROM ACCOUNT
		WHERE ACCOUNTID = ARLEDG.ACCOUNTID
		)
	,cliente_CIF = (
		SELECT RNC
		FROM ACCOUNT
		WHERE ACCOUNTID = ARLEDG.ACCOUNTID
		)
	,company2 = (
		SELECT FILEASNAME
		FROM ACCOUNT
		WHERE ACCOUNTID = ARLEDG.ACCOUNTID
		)
    ,address = (
		SELECT ADDRESS
		FROM ACCOUNTADDR
		WHERE ACCOUNTID = ARLEDG.ACCOUNTID
		)
	,City = ''
	,Country = 'DOM'

    FROM arledg
WHERE invoice BETWEEN '${invoice1}' AND '${invoice2}' GROUP BY INVOICE, ACCOUNTID,ENTITYID
ORDER BY invoice`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	// createInvoice(result.recordset, crearFactura)

	console.log('llegue hasta aquí')
	console.log(result.recordset)

	res.json(result.recordset)
}

export const getHeaders = async (invoiceNum, req, res) => {
	const queryStructure = `
    SELECT TOP 1 invoice AS ref,
	tranid,
	parenttranid AS parent,
	refnmbr,
    trandate AS date,
    currcode AS currency,
    rtaxgrpid AS taxincluded,
    govinvc AS ncf,
    (
        SELECT TOP 1 vigencia 
        FROM numerofactura 
        WHERE entityid IN (
            SELECT entityid 
            FROM bldg 
            WHERE bldgid = cmledg.bldgid
            )
    ) AS ncfexpirationdate,
    (
		SELECT exchrate
		FROM currexch
		WHERE exchgref = cmledg.bcexchgref
	) AS exchangerate,
    tipoingreso = '2',
	tipopago = '2',
    linesperprintedpage = '',
	supplierid = '',
    cif = (
		SELECT phone
		FROM entity
		WHERE entityid IN (
				SELECT entityid
				FROM bldg
				WHERE bldgid = cmledg.bldgid
				)
		),
    company = (
        SELECT name
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    address = (
        SELECT addr1
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    city = (
        SELECT city
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    country = 'DOM',
    type = 'Phone',
    number = (
		SELECT phoneno
		FROM bldg
		WHERE bldgid = cmledg.bldgid
		),
    cliente_cif = (
        SELECT rnc
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    company2 = (
        SELECT dba
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    address = (
        SELECT address
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    city = (
        SELECT city
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    country = 'DOM',
    inccat AS suppliersku,
    item = (
		SELECT descrptn
		FROM inch
		WHERE inccat = cmledg.inccat
		),
    qty = '1',
    up = TRANAMT,
    total = '',
    netamount = '',
    syslinetype = 'GenericServices',
	type2 = (
		SELECT rtaxid
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	base = '',
	rate = (
		SELECT rtaxperc
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	amount = tranamt,
	(
		SELECT REFDESC
		FROM rtax
		WHERE inccat = cmledg.inccat
	) AS qualifier
    FROM cmledg 
    WHERE invoice='${invoiceNum}' AND srccode='ch'`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	//console.log('Esto es el recordset: ' + result.recordset)
	//const respuesta = res.json(result.recordset)

	// return res.json(result.recordset)
	//res.json(result.recordset)
	//console.log(result.recordset)
	return result.recordset
}

export const getItems = async (invoiceNum, req, res) => {
	const queryItems = `
    SELECT invoice AS ref,
	tranid,
	parenttranid AS parent,
	refnmbr,
    trandate AS date,
    currcode AS currency,
    rtaxgrpid AS taxincluded,
    govinvc AS ncf,
    (
        SELECT TOP 1 vigencia 
        FROM numerofactura 
        WHERE entityid IN (
            SELECT entityid 
            FROM bldg 
            WHERE bldgid = cmledg.bldgid
            )
    ) AS ncfexpirationdate,
    (
		SELECT exchrate
		FROM currexch
		WHERE exchgref = cmledg.bcexchgref
	) AS exchangerate,
    tipoingreso = '2',
	tipopago = '2',
    linesperprintedpage = '',
	supplierid = '',
    cif = (
		SELECT phone
		FROM entity
		WHERE entityid IN (
				SELECT entityid
				FROM bldg
				WHERE bldgid = cmledg.bldgid
				)
		),
    company = (
        SELECT name
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    address = (
        SELECT addr1
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    city = (
        SELECT city
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = cmledg.bldgid
                )
        ),
    country = 'DOM',
    type = 'Phone',
    number = (
		SELECT phoneno
		FROM bldg
		WHERE bldgid = cmledg.bldgid
		),
    cliente_cif = (
        SELECT rnc
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    company = (
        SELECT dba
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    address = (
        SELECT address
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    city = (
        SELECT city
        FROM leas
        WHERE leasid = cmledg.leasid
        ),
    country = 'DOM',
    inccat as suppliersku,
    item = (
		SELECT descrptn
		FROM inch
		WHERE inccat = cmledg.inccat
		),
    qty = '1',
    up = TRANAMT,
    total = '',
    netamount = '',
    syslinetype = 'GenericServices',
	type2 = (
		SELECT rtaxid
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	base = '',
	rate = (
		SELECT rtaxperc
		FROM rtax
		WHERE inccat = cmledg.inccat
	),
	amount = tranamt,
	(
		SELECT REFDESC
		FROM rtax
		WHERE inccat = cmledg.inccat
	) AS qualifier
    FROM cmledg 
    WHERE invoice='${invoiceNum}' AND srccode='ch'`

	const pool = await getConnection()
	const items = await pool.request().query(queryItems)

	//console.log(result.recordset)
	//res.json(result.recordset)

	return items.recordset
}

export const createInvoice = async (bathOfInvoices, crearFactura, req, res) => {
	//Crear folder
	let timestamp = Date.now()
	let dir = `facturaComercial-${timestamp}`
	//ACTIVAR 1/2 IMPRESION DE FACTURAS
	if (crearFactura) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir)
		}
	}
	//***************** */

	const arrOfInvoices = []

	const result = await Promise.all(
		bathOfInvoices.map(async (item) => {
			//Calls
			const headerFactura = await getHeaders(item.ref)
			const [productsFormated, grossamount] = await filterProducts(item.ref)
			const [taxesFormated, totalAmount] = await formatTax(item.ref)
			//console.log(productsFormated)

			headerFactura.map((invoice) => {
				const invoiceDate = new Date(invoice.date)

				const dueDate = new Date(invoiceDate)
				dueDate.setDate(dueDate.getDate() + 7)

				const invoiceExpirationDate = new Date(invoice.ncfexpirationdate)
				const template = {
					_declaration: {
						_attributes: {
							version: '1.0',
						},
					},
					Transaction: {
						_attributes: {
							'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
							'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
						},
						GeneralData: {
							_attributes: {
								Ref: invoice.ref,
								Type: 'FacturaComercial',
								Date:
									invoiceDate.getFullYear() +
									'-' +
									(invoiceDate.getMonth() + 1).toString().padStart(2, '0') +
									'-' +
									invoiceDate.getDate().toString().padStart(2, '0'),
								Currency: invoice.currency,
								TaxIncluded: 'false',
								NCF: invoice.ncf.trim(),
								NCFExpirationDate: '2025-12-31',
								ExchangeRate: invoice.exchangerate.toFixed(2),
							},
							PublicAdministration: {
								DOM: {
									_attributes: {
										TipoIngreso: invoice.tipoingreso,
										TipoPago: invoice.tipopago,
										LinesPerPrintedPage: '',
									},
								},
							},
						},
						Supplier: {
							_attributes: {
								SupplierID: '',
								Email: '',
								CIF: emptyTrim(invoice.cif),
								Company: invoice.company.trim(),
								Address: invoice.address,
								City: invoice.city,
								PC: '',
								Province: '',
								Country: 'DOM',
							},
						},
						Client: {
							_attributes: {
								CIF: invoice.cliente_cif.trim(),
								Email: '' === '' ? 'tecnologia@bluemall.com.do' : '',
								Company: sanitizeCompanyName(invoice.company2).trim(),
								Address: invoice.address,
								City: invoice.city,
								PC: '',
								Province: '',
								Country: 'DOM',
							},
						},
						References: {},
						ProductList: [
							{
								//Must be Multiple ⚠️
								Product: productsFormated.map((item) => {
									return item.Product
								}),
							},
						],
						DueDates: {
							DueDate: {
								_attributes: {
									PaymentID: 'Venta a Credito',
									Amount: (grossamount + totalAmount).toFixed(2),
									Date:
										dueDate.getFullYear() +
										'-' +
										(dueDate.getMonth() + 1).toString().padStart(2, '0') +
										'-' +
										dueDate.getDate().toString().padStart(2, '0'),
								},
							},
						},
						TaxSummary: [
							{
								//Multiple
								Tax: taxesFormated.map((item) => {
									return item.Tax
								}),
							},
						],
						TotalSummary: {
							_attributes: {
								GrossAmount: grossamount.toFixed(2),
								Discounts: '',
								SubTotal: grossamount.toFixed(2),
								Tax: totalAmount.toFixed(2),
								Total: (grossamount + totalAmount).toFixed(2),
							},
						},
					},
				}
				//Pass Template to Json
				const json = JSON.stringify(template)
				//console.log(template)

				//Pass Json to Xml
				const formatoXml = json2xml(json, { compact: true, spaces: 4 })
				//Mostrar factura por consola

				//Push xml into arrOfInvoices
				arrOfInvoices.push(template)
				//console.log(formatoXml)

				//Exportar en archivo XML
				//ACTIVAR 2/2 IMPRESION DE FACTURAS
				if (crearFactura) {
					fs.writeFile(
						`${dir}/FacturaComercial_${invoice.ref}_${timestamp}.xml`,
						formatoXml,
						(error) => {
							if (error) {
								console.log(error)
							}
							console.log(`Factura ${invoice.ref} creada correctamente`)
						}
					)
				}

				// 	return formatoXml
				// })
			})
		})
	)

	//See what is inside of arrOfInvoices
	// console.log(arrOfInvoices)

	invoiceBox = arrOfInvoices

	// return arrOfInvoices
	//************
}

//Send Invoices
export const sendInvoices = async (req, res) => {
	// Call createPackage to save array in DB
	// try {
	// 	await createPackage(invoiceBox)
	// } catch (error) {
	// 	console.error('Error saving package to DB:', error)
	// 	return res.status(500).send('Error saving package to DB')
	// }

	// Send invoiceBox to package/create endpoint
	try {
		const response = await fetch('http://localhost:3000/package/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ invoiceBox }),
		})
		const data = await response.json()
		console.log(data)
	} catch (error) {
		console.error('Error:', error)
	}

	// console.log(JSON.stringify(invoiceBox))

	// Check if invoiceBox is defined
	if (invoiceBox) {
		for (const invoice of invoiceBox) {
			let type = invoice.Transaction.GeneralData._attributes.Type
			let invoiceNumber = invoice.Transaction.GeneralData._attributes.NCF

			// Pass Json to Xml
			const invoiceXML = json2xml(invoice, { compact: true, spaces: 4 })
			try {
				await sendInvoiceBavel(invoiceXML, type, invoiceNumber)
				// res.status(200).send('Datos enviados exitosamente');
			} catch (error) {
				res.status(500).send('Error al enviar datos')
			}
		}
	} else {
		console.error('There are not invoices in the invoice box')
	}
}

//Get List of Invoices
const getListOfInvoices = async (req, res) => {
	try {
		await fetch('https://fileconnector.voxelgroup.net/inbox/', {
			headers: {
				Authorization: 'Basic ' + btoa('bluemallrdtest:Suheh3-Kugoz6'),
			},
		}).then((res) => console.log(''))
	} catch (error) {
		console.log('Error from API Get: ' + error)
	}
}

//----------------- MODULES --------------

//FILTER PRODUCTS
const filterProducts = async (invoiceNum, req, res) => {
	const items = await getItems(invoiceNum)
	const arrTaxesFilteredByParent = await filterTaxes(invoiceNum)
	let grossamount = 0

	//Filtrar Productos
	function filterProductsByParent(item) {
		if (item.parent == null) {
			return true
		}
		return false
	}

	const arrProductsFilteredByParent = items.filter(filterProductsByParent)

	// Agregar Productos a formato json
	const productsFormated = arrProductsFilteredByParent.map((item) => {
		grossamount = grossamount + item.up

		//new
		const taxincluded = item.taxincluded.replaceAll(' ', '')

		return {
			Product: {
				_attributes: {
					SupplierSKU: item.suppliersku,
					EAN: '',
					Item: item.item.trim(),
					Qty: '1',
					MU: '',
					UP: item.up,
					CU: '',
					Total: item.qty * item.up,
					NetAmount: item.amount,
					SysLineType: item.syslinetype,
				},
				Discounts: {},
				Taxes: [
					{
						Tax:
							taxincluded === 'E'
								? exentLinked(item.tranid, arrProductsFilteredByParent, item.amount)
								: taxLinked(item.tranid, arrTaxesFilteredByParent, item.amount),
						// Tax: taxLinked(item.tranid, arrTaxesFilteredByParent, item.amount),
					},
				],
			},
		}
	})

	return [productsFormated, grossamount]
}
