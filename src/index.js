import app from './app'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000
const MONGO_URL = process.env.MONGO_URL

//DB Connection
mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.log('Database is connected successfully.')
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	})
	.catch((error) => console.log(error))

// app.listen(app.get('port'))
