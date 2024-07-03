import { getItems } from '../facturaComercial.controller'
import { compareTaxCode } from '../../utils/compareTaxCode'

// Filter taxes by parent
const filterTaxes = async (invoiceNum, req, res) => {
	const items = await getItems(invoiceNum)

	//Filtering
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

// Format Taxes
const formatTax = async (invoiceNum, req, res) => {
	const items = await getItems(invoiceNum)
	const arrTaxesFilteredByParent = await filterTaxes(invoiceNum)
	let totalAmount = 0

	const taxesGrouped = []

	const initializeAmounts = () => ({
		CD: { 2: { amount: 0, base: 0 } },
		CT: { 2: { amount: 0, base: 0 } },
		ED: { 18: { amount: 0, base: 0 } },
		EP: { 18: { amount: 0, base: 0 } },
		HD: { 18: { amount: 0, base: 0 } },
		HP: { 18: { amount: 0, base: 0 } },
		ID: { 18: { amount: 0, base: 0 } },
		IM: { 18: { amount: 0, base: 0 } },
		IP: { 18: { amount: 0, base: 0 } },
		IS: { 10: { amount: 0, base: 0 } },
		IX: { 18: { amount: 0, base: 0 } },
		MD: { 18: { amount: 0, base: 0 } },
		OD: { 18: { amount: 0, base: 0 } },
		OP: { 18: { amount: 0, base: 0 } },
		PD: { 18: { amount: 0, base: 0 } },
		PP: { 18: { amount: 0, base: 0 } },
		SD: { 18: { amount: 0, base: 0 } },
		SP: { 18: { amount: 0, base: 0 } },
		ST: { 10: { amount: 0, base: 0 } },
	})

	const amounts = initializeAmounts()

	//Filter Parent Product
	function filterParents(item) {
		if (item.parent == null) {
			return true
		}
		return false
	}
	const arrFilterParents = items.filter(filterParents)

	// Setting Amount
	arrTaxesFilteredByParent.forEach((item) => {
		const type = item.type2
		const rate = item.rate

		if (amounts[type] && amounts[type][rate] !== undefined) {
			amounts[type][rate].amount += item.amount
		}

		// Setting Base
		arrFilterParents.forEach((itemParent) => {
			const type = item.type2
			const rate = item.rate

			if (amounts[type] && amounts[type][rate] !== undefined) {
				if (item.parent == itemParent.tranid) amounts[type][rate].base += itemParent.amount
			}
		})
	})

	// Pushing object to taxesGrouped array
	for (const type in amounts) {
		for (const rate in amounts[type]) {
			if (amounts[type][rate].amount > 0) {
				taxesGrouped.push({
					type2: type,
					rate: rate,
					base: amounts[type][rate].base,
					amount: amounts[type][rate].amount,
					qualifier: '',
				})
			}
		}
	}

	// Adding Taxes to json format
	const taxesFormated = taxesGrouped.map((item) => {
		totalAmount += item.amount

		return {
			Tax: {
				_attributes: {
					Type: compareTaxCode(item.type2),
					Rate: item.rate,
					Base: item.base.toFixed(2),
					Amount: item.amount.toFixed(2),
					Qualifier: '',
				},
			},
		}
	})

	return [taxesFormated, totalAmount]
}

//---------------------------
export { formatTax, filterTaxes }
