//Send Invoices

//Local Test
const endpoint = 'http://localhost:3000/show'

export async function sendInvoice(invoice, type) {
	// Activar solo para pruebas locales
	// try {
	// 	const response = await fetch(endpoint, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify({ post: invoice }),
	// 	})
	// 	if (!response.ok) {
	// 		throw new Error(`HTTP error! status: ${response.status}`)
	// 	}
	// 	const responseData = await response.json()
	// 	console.log('Success: ', responseData)
	// } catch (error) {
	// 	console.error('Error:', error.message)
	// }
}

//Bavel
const baseUrl = 'https://fileconnector.voxelgroup.net/outbox'

export async function sendInvoiceBavel(invoice, type, invoiceNumber) {
	// Monitoring sending data
	// See the header
	// console.log(`${baseUrl}/${type}_${invoiceNumber}.xml`)
	// See what invoice in being sent
	// console.log(JSON.stringify(invoice))
	// console.log(invoice)
	//*************
	// Activate
	// try {
	// 	const response = await fetch(`${baseUrl}/${type}_${invoiceNumber}.xml`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/xml',
	// 			Authorization: 'Basic ' + btoa('bluemallrdtest:Suheh3-Kugoz6'),
	// 		},
	// 		body: invoice,
	// 	})
	// 	// Verifica si la respuesta es satisfactoria (código de estado en el rango 200-299)
	// 	if (!response.ok) {
	// 		throw new Error('Network response with a Error: ' + response.statusText)
	// 	}
	// 	const data = await response.json()
	// 	console.log('Success:', data)
	// } catch (error) {
	// 	console.error('Error:', error)
	// }
}
