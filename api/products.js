import { Router } from "express"

export default () => {
    const router = Router()
/////////////////////////////////////////////////////////////////
    router.get('/', (req, res) => {
        console.log('here')
    })

    router.get('/filter', (req, res) => {
        const {filter} = req.body
        // Op DB

        res.send('data')
    })




    return router
}