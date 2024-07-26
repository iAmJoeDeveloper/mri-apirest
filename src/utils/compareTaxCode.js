function compareTaxCode(tax) {
	const taxMap = {
		CD: 'CDT',
		CT: 'CDT',
		ED: 'ITBIS',
		EP: 'ITBIS',
		HD: 'ITBIS',
		HP: 'ITBIS',
		ID: 'ITBIS',
		IM: 'ITBIS',
		IP: 'ITBIS',
		IS: 'ISC',
		IX: 'ITBIS',
		MD: 'ITBIS',
		OD: 'ITBIS',
		OP: 'ITBIS',
		PD: 'ITBIS',
		PP: 'ITBIS',
		SD: 'ITBIS',
		SP: 'ITBIS',
		ST: 'ISC',
		E: 'EXENTO',
	}

	return taxMap[tax] || null
}

export { compareTaxCode }
