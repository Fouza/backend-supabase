import { Router } from 'express'

export default () => {
    const router = Router()

    router.get('/', (req, res) => {
        res.send('Entering API ROUTE')
    })

    router.get('/users', async (req, res) => {
        const supabase = req.app.get('supabase')
        // Actions to DB

        const { data, error } = await supabase.from("users").select("*")

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