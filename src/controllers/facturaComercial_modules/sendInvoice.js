//Send Invoices

const endpoint = 'http://localhost:3000/show'

export async function sendInvoice(invoice) {
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ post: invoice }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const responseData = await response.json()
		console.log('Success: ', responseData)
	} catch (error) {
		console.error('Error:', error.message)
	}
}
