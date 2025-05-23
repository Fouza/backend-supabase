import { Router } from 'express'
import products from './products.js'
import users from './users.js'
import orders from './orders.js'

export default () => {
    const router = Router()



    router.use('/products', products())

    router.use('/users', users())

    router.use('/orders', orders())

    return router

}