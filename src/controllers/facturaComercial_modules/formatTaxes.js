import { getItems } from '../facturaComercial.controller'

//FILTER TAXES
const filterTaxes = async (invoiceNum, req, res) => {
	const items = await getItems(invoiceNum)

	//Filtrar Impuestos
	function filterTaxesByParent(item) {
		if (item.parent != null) {
			return true
		}
		return false
	}

	const arrTaxesFilteredByParent = items.filter(filterTaxesByParent)

	return arrTaxesFilteredByParent
}

//---------------------------

//FORMAT TAXES
const formatTax = async (invoiceNum, req, res) => {
	const arrTaxesFilteredByParent = await filterTaxes(invoiceNum)
	let totalAmount = 0

	// Group by Taxes by Type and Rate
	const taxesGrouped = []
	let SD18_amount = 0
	let ST10_amount = 0
	let CT2_amount = 0

	const GroupingTaxes = arrTaxesFilteredByParent.map((item) => {
		if (item.type2 == 'SD' && item.rate == '18') {
			SD18_amount = SD18_amount + item.amount
		}

		if (item.type2 == 'ST' && item.rate == '10') {
			ST10_amount = ST10_amount + item.amount
		}

		if (item.type2 == 'CT' && item.rate == '2') {
			CT2_amount = CT2_amount + item.amount
		}
	})

	taxesGrouped.push(
		{
			type2: 'SD',
			rate: '18',
			base: 0,
			amount: SD18_amount,
		},
		{
			type2: 'ST',
			rate: '10',
			base: 0,
			amount: ST10_amount,
		},
		{
			type2: 'CT',
			rate: '2',
			base: 0,
			amount: CT2_amount,
		}
	)

	// Agregar Taxes a formato json
	const taxesFormated = taxesGrouped.map((item) => {
		totalAmount = totalAmount + item.amount

		return {
			Tax: {
				_attributes: {
					Type: item.type2,
					Rate: item.rate,
					Base: item.base,
					Amount: item.amount.toFixed(2),
				},
			},
		}
	})

	return [taxesFormated, totalAmount]
}

//---------------------------
export { formatTax, filterTaxes }
