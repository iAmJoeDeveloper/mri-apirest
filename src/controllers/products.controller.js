import { getConnection } from '../database/connection'
import { json2xml, xml2json } from 'xml-js'
//New
import { xml2js } from 'xml2js'
import fs from 'fs'

export const getProducts = async (req, res) => {
	const pool = await getConnection()
	const result = await pool.request().query('SELECT * FROM Products')

	// console.log(result.recordset[0].Name)
	// res.json(result.recordset)

	return result.recordset
}

export const xmlTest = async (req, res) => {
	//Ejemplo de formato
	const ejemploJson = {
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
					ref: 'FAT9034',
					Type: 'FacturaComercial',
					Date: '2019-02-22',
					Currency: 'DOP',
					NCF: 'B0100124578',
					NCFExpirationDate: '2019-12-31',
					TaxIncluded: 'false',
				},
				PublicAdministration: {
					DOM: {
						_attributes: {
							TipoIngreso: '01',
							TipoPago: '2',
							LinesPerPrintedPage: '25',
						},
					},
				},
			},
			Supplier: {
				_attributes: {
					SupplierID: '54681',
					Email: 'info@bebidasyrefrescos.com',
					CIF: '10176242',
					Company: 'Bebidas y Refrescos, S.A.',
					Address: 'Av. Diagonal, 23',
					City: 'Santo Domingo',
					PC: '08012',
					Province: 'Distrito Nacional',
					Country: 'DOM',
				},
			},
			Client: {
				_attributes: {
					CIF: '10137464',
					Email: 'facturas@elpatiodom.com',
					Company: 'El patio Dominicano S.R.L',
					Address: 'Av. Anacaona #100',
					City: 'Santo Domingo',
					PC: '08012',
					Province: 'Distrito Nacional',
					Country: 'DOM',
				},
			},
			References: {
				Reference: {
					_attributes: {
						PORef: 'P459034',
					},
				},
			},
			ProductList: {
				Product: {
					_attributes: {
						SupplierSKU: '60',
						EAN: '7460828509991',
						Item: 'Refrescos de Uva',
						Qty: '15',
						MU: 'Cajas',
						UP: '120.00',
						CU: '12',
						Total: '1800.00',
						NetAmount: '1602.00',
						SysLineType: 'Purchase',
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
		},
	}

	const json = JSON.stringify(ejemploJson)

	const xml = json2xml(json, { compact: true, spaces: 4 })

	console.log(xml)
	res.send(xml)
}

export const xmlReal = async (req, res) => {
	const productsJson = await getProducts()

	const arrProducts = productsJson.map((product) => {
		let formato = {
			GeneralData: {
				_attributes: {
					ref: product.Id,
					Tpe: product.Name,
				},
			},
		}

		const json = JSON.stringify(formato)
		const formatoXml = json2xml(json, { compact: true, spaces: 4 })

		return formatoXml
	})

	console.log(arrProducts)

	res.send('xml real belongs here')
}

//Render xml Template
export const renderXml = async (req, res) => {
	res.sendFile(__dirname + '/Formatos/ficheroFactura.xml')
}

//Convert xml to json
export const convertXmlToJson = async (req, res) => {
	let xml3 = fs.readFileSync(__dirname + '/Formatos/ficheroFactura.xml', 'utf8')
	// let options = { ignoreComment: true, alwaysChildren: true }
	// let result = xml2json(xml3, options) // or convert.xml2json(xml, options)
	// res.json(result)
	var result1 = xml2json(xml3, { compact: true, spaces: 4 })
	var result2 = xml2json(xml3, { compact: false, spaces: 4 })
	res.send(result1)
}
