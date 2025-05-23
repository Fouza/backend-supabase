import { Router } from "express";


export default function () {

    const router = Router()


    router.post('/', async (req, res) => {
        const supabase = req.app.get('supabase')
        const { user_id, product_id, number } = req.body

        if (!user_id || !product_id || typeof number !== 'number' || number === 0) {
            res.send({
                code: 400,
                message: 'You have to specify a user and a product and a number'
            })
        }

        //Check if user exists

        const { data: dataUser, error: errorUser } = await supabase.from("users").select("id").eq("id", user_id).single()
        
        if (!dataUser || errorUser) {
            res.send({
                code: 401,
                message: errorUser?.message || "User not found"
            })
        }

        // Get the product price and stock
        const { data: dataPr, error: errorPr } = await supabase.from("products").select("price, stock").eq("id", product_id).single()
        // {data: ..., error: ...}

        // Check if product exist and check stock
        if (!dataPr || errorPr || number > dataPr.stock) {
            res.send({
                code: 404,
                message: errorPr?.message  || 'Product not found or unsufficient stock'
            })
        }

        const price = dataPr.price
        const total = price * number        

        // Insert of order
        const { data, error } = await supabase.from("orders").insert([user_id, product_id, number, total]).select("*").single()
        if (!data || error) {
            res.send({
                code: 500,
                message: error?.message ||  'Error inserting order please try again.'
            })
        }

        // Update stock of product
        const { data: dataUpdate, error: errorUpdate } = await supabase.from("products").update(
            {
                stock: dataPr.stock - number
            }
        ).eq("id", product_id).select("stock").single()

        if (!dataUpdate || errorUpdate || dataUpdate.stock === dataPr.stock) {
            res.send({
                code: 500,
                message: 'Error updating stock of product'
            })
        }
        // Send order created in the response
        res.send({
            code: 200,
            data
        })

    })

    return router
}