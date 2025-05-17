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

    // POST

    router.post('/', async (req, res) => {
        const supabase = req.app.get('supabase')

        const {data, error} = await supabase
        .from("products")
        .insert([req.body])
        .select()

        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }
        res.send({
            code: 200,
            data
        })
    })

    return router
}