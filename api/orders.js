import { Router } from "express";


export default function () {

    const router = Router()

    // Get orders with products
    router.get('/', async (req, res) => {
        try {
            const supabase = req.app.get('supabase')
            const { userId: user_id } = req.user    
            console.log(req.user)

            if (!user_id) {
                return res.status(400).json({
                    code: 400,
                    message: 'User ID is required'
                });
            }

            // Get orders with product details using a join
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    products (
                        *
                    ),
                    users (
                        *
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                return res.status(500).json({
                    code: 500,
                    message: error.message
                });
            }

            return res.json({
                code: 200,
                data
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    });

    // Get single order with product details
    router.get('/:id', async (req, res) => {
        try {
            const supabase = req.app.get('supabase')
            const { id } = req.params
            const { user_id } = req.query

            if (!user_id) {
                return res.status(400).json({
                    code: 400,
                    message: 'User ID is required'
                });
            }

            // Get single order with product details
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    products (
                        id,
                        name,
                        price,
                        description,
                        image_url
                    )
                `)
                .eq('id', id)
                .eq('user_id', user_id)
                .single();

            if (error) {
                return res.status(500).json({
                    code: 500,
                    message: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    code: 404,
                    message: 'Order not found'
                });
            }

            return res.json({
                code: 200,
                data
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    });

    router.post('/', async (req, res) => {
        const supabase = req.app.get('supabase')

        const {user_id: user_id} = req.user

        const { product_id, number } = req.body

        if (!user_id || !product_id || typeof number !== 'number' || number === 0) {
            return res.send({
                code: 400,
                message: 'You have to specify a user and a product and a number'
            })
        }

        //Check if user exists

        const { data: dataUser, error: errorUser } = await supabase.from("users").select("id").eq("id", user_id).single()

        if (!dataUser || errorUser) {
            return res.send({
                code: 401,
                message: errorUser?.message || "User not found"
            })
        }

        // Get the product price and stock
        const { data: dataPr, error: errorPr } = await supabase.from("products").select("price, stock").eq("id", product_id).single()
        // {data: ..., error: ...}

        // Check if product exist and check stock
        if (!dataPr || errorPr || number > dataPr.stock) {
            return res.send({
                code: 404,
                message: errorPr?.message || 'Product not found or unsufficient stock'
            })
        }

        const price = dataPr.price
        const total = price * number

        // Insert of order
        const { data, error } = await supabase.from("orders").insert([{ user_id, product_id, number, total }]).select("*").single()

        if (!data || error) {
            return res.send({
                code: 500,
                message: error?.message || 'Error inserting order please try again.'
            })
        }

        // Update stock of product
        const { data: dataUpdate, error: errorUpdate } = await supabase.from("products").update(
            {
                stock: dataPr.stock - number
            }
        ).eq("id", product_id).select("stock").single()

        if (!dataUpdate || errorUpdate || dataUpdate.stock === dataPr.stock) {
            return res.send({
                code: 500,
                message: 'Error updating stock of product'
            })
        }
        
        // Send order created in the response
        return res.send({
            code: 200,
            data
        })

    })

    return router
}