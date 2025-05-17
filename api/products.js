import { Router } from "express";

export default () => {
    const router = Router()

    router.get('/', async (req, res) => {
        const supabase = req.app.get('supabase')

        const { data, error } = await supabase.from("products").select("*")

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

    router.post('/', async (req, res) => {
        const supabase = req.app.get('supabase')


        const { data, error } = await supabase
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

    router.delete('/', async (req, res) => {
        const supabase = req.app.get('supabase')
        const { id } = req.body

        if (!id) {
            res.send({
                code: 401,
                message: 'ID of product is required'
            })
        }

        const existProduct = await supabase.from("products").eq("id", id).single()

        if (!existProduct?.data) {
            res.send({
                message: 'Product with specified ID does not exist'
            })
        }

        const { data, error } = await supabase.from("products").delete().eq('id', id).select("*")

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

    router.put('/:id', async (req, res) => {
        const supabase = req.app.get('supabase')
        const { id } = req.params
        const newdata = req.body

        if (!id) {
            res.send({
                code: 401,
                message: 'ID of product is required'
            })
        }

        const existProduct = await supabase.from("products").eq("id", id).single()

        if (!existProduct?.data) {
            res.send({
                message: 'Product with specified ID does not exist'
            })
        }

        console.log(newdata)
        const { data, error } = await supabase.from("products").update(newdata).eq('id', id)


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