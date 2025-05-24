import { Router } from 'express'
import products from './products.js'
import users from './users.js'
import orders from './orders.js'
import { authMiddleware } from '../middlewares/auth.js'
import logger from '../middlewares/logger.js'
import auth from './auth.js'

export default () => {
    const router = Router()

    router.use('/auth', auth())

    router.use('/products', authMiddleware, products())

    router.use('/users', authMiddleware,users())

    router.use('/orders',authMiddleware, orders())

    return router

}