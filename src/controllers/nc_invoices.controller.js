import { getConnection } from '../database/remoteConnection'
import { json2xml, xml2json } from 'xml-js'
import fs from 'fs'
import path from 'path'

//Others controllers
import { createPackage } from './package.controller'

//Modules
import { formatTax, filterTaxes } from './nc_invoices_modules/formatTaxes'
import { sendInvoice, sendInvoiceBavel } from './facturaComercial_modules/sendInvoice'
import { taxLinked } from './facturaComercial_modules/taxLinked'
import { exentLinked } from './facturaComercial_modules/exentLinked'

//Utils
import { sanitizeCompanyName } from '../utils/sanitizeCompanyName'
import { emptyTrim } from '../utils/emptyTrim'
import { compareDates } from '../utils/compareDates'

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
	,tipoingreso = '1'
    ,tipopago = '1'
    ,cif = (
		SELECT PHONE
		FROM ENTITY
		WHERE ENTITYID IN (
			SELECT ENTITYID
			FROM BLDG
			WHERE BLDGID = CMLEDG.BLDGID		
		)
	)
    , company = (
		SELECT NAME
        FROM ENTITY
        WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
		
    )
    , address = (
		SELECT ADDR1
		FROM ENTITY
		 WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
	)
    , city = (
		SELECT CITY
		FROM ENTITY
		WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
	)
	,country = 'DOM'
	,type = 'Phone'
	,number = (
        SELECT PHONENO
        FROM BLDG
        WHERE BLDGID = CMLEDG.BLDGID
    )
	,cliente_CIF = (
		SELECT RNC
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,company2 = (
		SELECT DBA
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
    ,address = (
		SELECT ADDRESS
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,city = (
		SELECT CITY
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
	)
	,country = 'DOM'

    FROM CMLEDG
WHERE invoice BETWEEN '${invoice1}' AND '${invoice1}' AND srccode='NC' GROUP BY INVOICE, BLDGID, LEASID
ORDER BY invoice`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	createInvoice(result.recordset, crearFactura)

	res.json(result.recordset)
}

export const getHeaders = async (invoiceNum, req, res) => {
	const queryStructure = `
	SELECT TOP 1 invoice AS ref,
	tranid,
	parenttranid AS parent,
	refnmbr = 'X',
	trandate AS date,
	currcode AS currency,
	taxincluded = 'false',
	govinvc AS ncf,
	ncfexpirationdate = 'X',
	exchangerate = 'X',
	tipoingreso = '1',
	tipopago = '1',
	linesperprintedpage = '',
	supplierid = '',
	cif = (
		SELECT PHONE
		FROM ENTITY
		WHERE ENTITYID IN (
			SELECT ENTITYID
			FROM BLDG
			WHERE BLDGID = CMLEDG.BLDGID		
		)
	)
    , company = (
		SELECT NAME
        FROM ENTITY
        WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
		
    )
    , address = (
		SELECT ADDR1
		FROM ENTITY
		 WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
	)
    , city = (
		SELECT CITY
		FROM ENTITY
		WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
	)
	,country = 'DOM'
	,type = 'Phone'
	,number = (
        SELECT PHONENO
        FROM BLDG
        WHERE BLDGID = CMLEDG.BLDGID
    )
	,cliente_cif = (
		SELECT RNC
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,company2 = (
		SELECT DBA
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
    ,address = (
		SELECT ADDRESS
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,city = (
		SELECT CITY
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
	)
	,country = 'DOM'
	,invoiceref = ''
    ,invoicerefdate = ''
	,invoicencf = (
        SELECT TOP 1 descrptn
        FROM cmledg
        WHERE invoice = '${invoiceNum}'
        AND srccode = 'NC'
    )
	,codigomodificacion = '3' 
    ,indicadornotacredito = '1' 
	,inccat AS suppliersku
	,item = (
		SELECT descrptn
		FROM inch
		WHERE inccat = cmledg.inccat
	)
	,qty = '1'
	,up = TRANAMT
	,total = ''
	,netamount = ''
	,syslinetype = 'GenericServices'
	,type2 = (
		SELECT rtaxid
		FROM rtax
		WHERE inccat = cmledg.inccat
	)
	,refdesc = (
        SELECT refdesc
        FROM rtax
        WHERE inccat = cmledg.inccat
    )
	,base = 'X'
	,rate = (
		SELECT rtaxperc
		FROM rtax
		WHERE inccat = cmledg.inccat
	)
	,amount = tranamt
	,(
		SELECT refdesc
		FROM rtax
		WHERE inccat = cmledg.inccat
		) AS qualifier
	FROM cmledg
	WHERE invoice='${invoiceNum}' AND srccode='NC'`

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
	parenttranid as parent,
	refnmbr = 'X',
    trandate AS date,
    currcode AS currency,
    taxincluded = 'false',
    govinvc AS ncf,
    ncfexpirationdate = 'X',
    exchangerate = '0.00',
    tipoingreso = '1',
	tipopago = '1',
    linesperprintedpage = '',
	supplierid = '',
    cif = (
		SELECT PHONE
		FROM ENTITY
		WHERE ENTITYID IN (
			SELECT ENTITYID
			FROM BLDG
			WHERE BLDGID = CMLEDG.BLDGID		
		)
	)
    , company = (
		SELECT NAME
        FROM ENTITY
        WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
		
    )
    , address = (
		SELECT ADDR1
		FROM ENTITY
		 WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
	)
    , city = (
		SELECT CITY
		FROM ENTITY
		WHERE ENTITYID IN (
            SELECT ENTITYID 
            FROM BLDG 
            WHERE BLDGID = CMLEDG.BLDGID
        )
	)
	,country = 'DOM',
    type = 'Phone'
	,number = (
        SELECT PHONENO
        FROM BLDG
        WHERE BLDGID = CMLEDG.BLDGID
    )
	,cliente_cif = (
		SELECT RNC
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,company2 = (
		SELECT DBA
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
    ,address = (
		SELECT ADDRESS
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
		)
	,City = (
		SELECT CITY
		FROM LEAS
		WHERE LEASID = CMLEDG.LEASID
	)
	,country = 'DOM',
    invoiceref = ''
    ,invoicerefdate = ''
	,invoicencf = (
        SELECT TOP 1 descrptn
        FROM cmledg
        WHERE invoice = '${invoiceNum}'
        AND srccode = 'NC'
    )
	,codigomodificacion = '3' 
    ,indicadornotacredito = '1' 
	,inccat AS suppliersku
	,item = (
		SELECT descrptn
		FROM inch
		WHERE inccat = cmledg.inccat
	)
	,qty = '1'
	,up = TRANAMT
	,total = ''
	,netamount = ''
	,syslinetype = 'GenericServices'
	,type2 = (
		SELECT rtaxid
		FROM rtax
		WHERE inccat = cmledg.inccat
	)
	,refdesc = (
        SELECT refdesc
        FROM rtax
        WHERE inccat = cmledg.inccat
    )
	,base = 'X'
	,rate = (
		SELECT rtaxperc
		FROM rtax
		WHERE inccat = cmledg.inccat
	)
	,amount = tranamt
	,(
		SELECT refdesc
		FROM rtax
		WHERE inccat = cmledg.inccat
		) AS qualifier
    FROM cmledg 
    WHERE invoice='${invoiceNum}' AND srccode='NC'`

	const pool = await getConnection()
	const items = await pool.request().query(queryItems)

	//console.log(result.recordset)
	//res.json(result.recordset)

	return items.recordset
}

const extraFields = async (invcnumber) => {
	const query = `
	SELECT TOP 1 invoice as invoiceref,
	trandate as invoicerefdate
	from cmledg  WHERE GOVINVC = '${invcnumber}' and SRCCODE = 'CH'`

	const pool = await getConnection()
	const fields = await pool.request().query(query)

	return fields.recordset[0]
}

export const createInvoice = async (bathOfInvoices, crearFactura, req, res) => {
	//Crear folder
	let timestamp = Date.now()
	let dir = `NC CM - notaDeCredito-${timestamp}`
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

			headerFactura.map(async (invoice) => {
				const invoiceDate = new Date(invoice.date)

				const dueDate = new Date(invoiceDate)
				dueDate.setDate(dueDate.getDate() + 7)

				const fieldsnc = await extraFields(invoice.invoicencf)
				// console.log(invoice.invoicencf)
				const indicadornotacredito = compareDates(invoiceDate, fieldsnc.invoicerefdate)

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
								Ref: invoice.ref.trim(),
								Type: 'FacturaAbono',
								Date:
									invoiceDate.getFullYear() +
									'-' +
									(invoiceDate.getMonth() + 1).toString().padStart(2, '0') +
									'-' +
									invoiceDate.getDate().toString().padStart(2, '0'),
								Currency: invoice.currency,
								TaxIncluded: 'false',
								NCF: invoice.ncf ? invoice.ncf.trim() : '',
								NCFExpirationDate: '2025-12-31',
								// ExchangeRate: invoice.exchangerate
								// 	? parseFloat(invoice.exchangerate).toFixed(2)
								// 	: '',
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
						References: {
							Reference: {
								_attributes: {
									// PORef: '-',
									InvoiceRef: fieldsnc.invoiceref,
									InvoiceRefDate:
										fieldsnc.invoicerefdate.getFullYear() +
										'-' +
										(fieldsnc.invoicerefdate.getMonth() + 1).toString().padStart(2, '0') +
										'-' +
										fieldsnc.invoicerefdate.getDate().toString().padStart(2, '0'),
									InvoiceNCF: invoice.invoicencf.trim(),
								},
								PublicAdministration: {
									DOM: {
										_attributes: {
											CodigoModificacion: invoice.codigomodificacion,
											IndicadorNotaCredito: indicadornotacredito,
										},
									},
								},
							},
						},
						ProductList: [
							{
								//Must be Multiple ⚠️
								Product: productsFormated.map((item) => {
									return item.Product
								}),
							},
						],
						// DueDates: {
						// 	DueDate: {
						// 		_attributes: {
						// 			PaymentID: 'Venta a Credito',
						// 			Amount: (grossamount + totalAmount).toFixed(2),
						// 			Date:
						// 				dueDate.getFullYear() +
						// 				'-' +
						// 				(dueDate.getMonth() + 1).toString().padStart(2, '0') +
						// 				'-' +
						// 				dueDate.getDate().toString().padStart(2, '0'),
						// 		},
						// 	},
						// },
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
								GrossAmount: Math.abs(grossamount).toFixed(2),
								Discounts: '',
								SubTotal: Math.abs(grossamount).toFixed(2),
								Tax: totalAmount.toFixed(2),
								Total: Math.abs(grossamount + totalAmount).toFixed(2),
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
						`${dir}/FacturaComercial_${invoice.ref.trim()}_${timestamp}.xml`,
						formatoXml,
						(error) => {
							if (error) {
								console.log(error)
							}
							console.log(`Factura ${invoice.ref.trim()} creada correctamente`)
						}
					)
				}

				// 	return formatoXml
				// })
			})
		})
	)

	// See what is inside of arrOfInvoices
	// console.log(arrOfInvoices)

	invoiceBox = arrOfInvoices

	// return arrOfInvoices
	//************
}

//Send Invoices
export const sendInvoices = async (req, res) => {
	const { username } = req.params
	// Send invoiceBox to package/create endpoint
	try {
		const response = await fetch(`http://localhost:3000/package/create/NC-CM/${username}`, {
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
					UP: Math.abs(item.up),
					CU: '',
					Total: Math.abs(item.qty * item.up),
					NetAmount: Math.abs(item.amount),
					SysLineType: item.syslinetype,
				},
				Discounts: {},
				Taxes: [
					{
						Tax:
							taxincluded === 'E'
								? exentLinked(item.tranid, arrProductsFilteredByParent, Math.abs(item.amount))
								: taxLinked(item.tranid, arrTaxesFilteredByParent, Math.abs(item.amount)),
						// Tax: taxLinked(item.tranid, arrTaxesFilteredByParent, item.amount),
					},
				],
			},
		}
	})

	return [productsFormated, grossamount]
}
