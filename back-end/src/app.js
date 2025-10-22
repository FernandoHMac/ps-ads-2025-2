// Carregando as variáveis de ambiente do arquivo.env
import dotenv from 'dotenv'
dotenv.config()

import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index.js'

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)

/**************** ROTAS *******************/

// Middleware de verificação de autorização
import authMiddleware from './middleware/auth.js'
app.use(authMiddleware)

import customersRoute from './routes/customers.js'
app.use('/customers', customersRoute)

import carsRoute from './routes/cars.js'
app.use('/cars', carsRoute)

import usersRoute from './routes/users.js'
app.use('/users', usersRoute)

import sellersRoute from './routes/sellers.js'
app.use('/sellers', sellersRoute)


export default app
