export const compareDates = (date1, date2) => {
	const d1 = new Date(date1)
	const d2 = new Date(date2)

	// Get miliseconds difference
	const diffInMs = Math.abs(d2 - d1)

	// Convert miliseconds difference in days
	const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

	// If the difference is  greater than 30 days, we return 1, otherwise we return 0
	return diffInDays > 30 ? 1 : 0
}
