import { getConnection } from '../database/remoteConnection'
import { json2xml, xml2json } from 'xml-js'
import fs from 'fs'

export const getInvoices = async (req, res) => {
	const queryStructure = `
    SELECT invoice AS ref,
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
		WHERE exchgref = '00002758'
	) AS exchangerate,
    tipoingreso = '02',
	tipopago = '2 - Credito',
    linesperprintedpage = '',
	supplierid = '',
    cif = (
		SELECT phone
		FROM entity
		WHERE entityid IN (
				SELECT entityid
				FROM bldg
				WHERE bldgid = 'BM-SDC'
				)
		),
    company = (
        SELECT name
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = 'BM-SDC'
                )
        ),
    address = (
        SELECT addr1
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = 'BM-SDC'
                )
        ),
    city = (
        SELECT city
        FROM entity
        WHERE entityid IN (
                SELECT entityid
                FROM bldg
                WHERE bldgid = 'BM-SDC'
                )
        ),
    country = 'DOM',
    type = 'Phone',
    number = (
		SELECT phoneno
		FROM bldg
		WHERE bldgid = 'BM-SDC'
		),
    cliente_cif = (
        SELECT rnc
        FROM leas
        WHERE leasid = '000007'
        ),
    company = (
        SELECT dba
        FROM leas
        WHERE leasid = '000007'
        ),
    address = (
        SELECT address
        FROM leas
        WHERE leasid = '000007'
        ),
    city = (
        SELECT city
        FROM leas
        WHERE leasid = '000007'
        ),
    country = 'DOM',
    inccat,
    item = 'ALQUILER',
    qty = '1',
    up = TRANAMT,
    total = (
		SELECT sum(tranamt)
		FROM cmledg
		WHERE leasid = '000007'
		AND govinvc = 'B0100000692'
		GROUP BY govinvc
		),
    netamount = '',
    syslinetype = 'GenericServices'
    FROM cmledg 
    WHERE leasid=000007
    AND govinvc = 'B0100000692'`

	const pool = await getConnection()
	const result = await pool.request().query(queryStructure)

	// console.log(result.recordset)
	// res.json(result.recordset)

	return result.recordset
}

export const createInvoice = async (req, res) => {
	const invoicesJson = await getInvoices()

	const batchInvoices = invoicesJson.map((invoice) => {
		const invoiceDate = new Date(invoice.date)
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
						ref: invoice.ref,
						Type: 'FacturaComercial',
						Date:
							invoiceDate.getFullYear() +
							'-' +
							invoiceDate.getMonth() +
							'-' +
							invoiceDate.getDate(),
						Currency: invoice.currency,
						NCF: invoice.ncf,
						NCFExpirationDate:
							invoiceExpirationDate.getFullYear() +
							'-' +
							invoiceExpirationDate.getMonth() +
							'-' +
							invoiceExpirationDate.getDate(),
						TaxIncluded: 'false',
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
						CIF: invoice.cif,
						Company: invoice.company,
						Address: invoice.address,
						City: invoice.city,
						PC: '',
						Province: '',
						Country: 'DOM',
					},
				},
				Client: {
					_attributes: {
						CIF: invoice.cliente_cif,
						Email: '',
						Company: invoice.company,
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
							PORef: '',
						},
					},
				},
				ProductList: {
					//Must be Multiple ⚠️
					Product: {
						_attributes: {
							SupplierSKU: '',
							EAN: '',
							Item: invoice.item,
							Qty: invoice.qty,
							MU: '',
							UP: invoice.tranamt,
							CU: '',
							Total: invoice.total,
							NetAmount: invoice.netamount,
							SysLineType: invoice.syslinetype,
						},
						Discounts:
							//Asi se duplican etiquetas
							{
								Discount: [
									{
										_attributes: {
											Qualifier: 'Descuento',
											Type: 'Comercial',
											Rate: '10.00',
											Amount: '180.00',
										},
									},
									{
										_attributes: {
											Qualifier: 'Descuento',
											Type: 'Pronto Pago',
											Rate: '1.00',
											Amount: '18.00',
										},
									},
								],
							},
						Taxes: {
							Tax: {
								_attributes: {
									Type: 'ITBIS',
									Rate: '18.00',
									Base: '1602.00',
									Amount: '288.36',
								},
							},
						},
					},
				},
				DueDates: {
					DueDate: {
						_attributes: {
							PaymentID: 'Venta a Credito',
							Amount: '48888.36',
							Date: '2019-03-22',
						},
					},
				},
				TaxSummary: {
					//Multiple
					Tax: [
						{
							_attributes: {
								Type: 'ITBIS',
								Rate: '18.00',
								Base: '1602.00',
								Amount: '288.36',
							},
						},
						{
							_attributes: {
								Type: 'ITBIS',
								Rate: '16.00',
								Base: '3200.00',
								Amount: '288.36',
							},
						},
					],
				},
				TotalSummary: {
					_attributes: {
						GrossAmount: '43800.00',
						Discounts: '198.00',
						SubTotal: '43800.00',
						Tax: '5088.36',
						Total: '48888.36',
					},
				},
			},
		}

		const json = JSON.stringify(template)
		const formatoXml = json2xml(json, { compact: true, spaces: 4 })
		console.log(formatoXml)

		//Exportar en archivo XML
		fs.writeFile(
			`FacturaComercial_${invoice.ref}_${invoice.inccat}.xml`,
			formatoXml,
			function (error) {
				if (error) {
					return console.log(error)
				}
			}
		)

		return formatoXml
	})

	res.send(batchInvoices)
}
