import express from 'express'
import { bootcampRouter } from './router/bootcamps'
import { coursesRouter } from './router/courses'
import morgan from 'morgan'
import { connectDB } from './db'
import 'colors'
import fileUpload from 'express-fileupload'

import 'dotenv/config'
import { errorHandler } from './middleware/error'
import path from 'path'
import { authRouter } from './router/auth'
import cookieParser from 'cookie-parser'

connectDB()

// Initialise express
const app = express()

app.use(express.json())

app.use(cookieParser())

// Log the request time, http version, method and URL
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(':date[web] :http-version :method :url'))
}

// File uploading
app.use(fileUpload())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1/bootcamps', bootcampRouter)
app.use('/api/v1/courses', coursesRouter)
app.use('/api/v1/auth', authRouter)

app.use(errorHandler)

// Define port
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Port is running on port ${PORT}`.yellow.bold)
})

// Handle unhandled promise rejections

process.on('uncaughtException', (err, promise) => {
  console.log(`Error : ${err.message}.red`)

  server.close(() => process.exit(1))
})
