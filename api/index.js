import { Router } from 'express'
import products from './products.js'
import users from './users.js'

export default () => {
    const router = Router()



    router.use('/products', products())

    router.use('/users', users())

    return router

}