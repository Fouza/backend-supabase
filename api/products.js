import { Router } from "express"

export default () => {
    const router = Router()

    // GET
    router.get('/', async (req, res) => {
        const supabase = req.app.get('supabase')
        const {product_id} = req.query
        // Action to DB
        // const {first_name, last_name, email} = res.body
        // const {role} = req.query

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

    /////////////////////////////////////////////////////////////////
    // router.get('/', (req, res) => {
    //     console.log('here')
    // })

    // router.get('/filter', (req, res) => {
    //     const { filter } = req.body
    //     // Op DB

    //     res.send('data')
    // })
    //////////////////////

    // POST
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

    // post , we add new product
    router.post("/", async (req, res) => {
        const supabase = req.app.get("supabase");
        const { user_id } = req.body;
        if (!user_id) {
            res.send({
                code: 401,
                message: "UserId is reuired",
            });
        }
        const { data, error } = await supabase
            .from("products")
            .insert(req.body)
            .select("*")
            .single(); // give us objects not an array
        console.log(data, error);
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data);
    });

    // PUT
    // PUT /api/products/:id

    router.put('/', async (req, res) => {
        console.log("test")
        const supabase = req.app.get('supabase')
        const { id } = req.body
        const newdata = req.body

        console.log(newdata)
        const { data, error } = await supabase.from("products").update(newdata).eq('id', id).select("*")


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


    // DELETE
    router.delete('/', async (req, res) => {
        const supabase = req.app.get('suparbase')
        const { id } = req.body
        const { soft_delete } = req.query

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

        let result
        if (!soft_delete) {
            result = await supabase.from("products").delete().eq('id', id).select("*")
        } else {
            result = await supabase.form("products").update({ active: false }).select("*").eq('id', id).select("*")
        }
        const { data, error } = result
        if (error) {
            res.send({
                code: 400,
                message: error.message
            })
        }
        res.send({
            code: 400,
            data
        })
    })

    return router
}