import { Router } from 'express'
import { verifyUser } from '../middleware/Auth'
import Package from '../models/packageModel'

const { getPackages, createPackage, getPackageById } = require('../controllers/package.controller')

const router = Router()

router.get('/packages', getPackages)
router.post('/package/create/:category', createPackage)
router.get('/package/checking/:id', getPackageById)

// Delete record by id
router.delete('/package/delete/:id', async (req, res) => {
	try {
		const result = await Package.findByIdAndDelete(req.params.id)

		if (!result) {
			return res.status(404).json({ message: 'Record not found' })
		}

		res.status(200).json({ message: 'Record deleted successfully' })
	} catch (error) {
		res.status(500).json({ message: 'Error trying to delete record' })
	}
})

export default router
