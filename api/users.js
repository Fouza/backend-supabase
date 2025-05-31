import { Router } from "express";
import bcrypt from "bcryptjs";

export default () => {
    const router = Router();

    // Get user profile with their products and orders
    router.get('/profile', async (req, res) => {
        try {
            const supabase = req.app.get('supabase');
            const { userId: user_id } = req.user;

            // Get user details with their products and orders
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    products!products_user_id_fkey (
                        id,
                        name,
                        price,
                        stock,
                        created_at
                    ),
                    orders!orders_user_id_fkey (
                        id,
                        product_id,
                        number,
                        total,
                        status,
                        created_at,
                        products!orders_product_id_fkey (
                            name,
                            price
                        )
                    )
                `)
                .eq('id', user_id)
                .single();

            if (error) {
                return res.status(500).json({
                    code: 500,
                    message: error.message
                });
            }

            // Calculate user statistics
            const stats = {
                total_products: data.products.length,
                total_orders: data.orders.length,
                total_spent: data.orders.reduce((sum, order) => sum + order.total, 0),
                total_earned: data.products.reduce((sum, product) => {
                    const productOrders = data.orders.filter(order => 
                        order.products && order.product_id === product.id
                    )
                    return sum + productOrders.reduce((orderSum, order) => orderSum + order.total, 0);
                }, 0)
            }

            return res.send({
                code: 200,
                data: {
                    ...data,
                    stats
                }
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    });

  
    return router;
};


// // Example 1: Simple Sum
// const numbers = [1, 2, 3, 4, 5];

// const sum = numbers.reduce((accumulator, currentValue) => {
//     return accumulator + currentValue;
// }, '');

// console.log(sum); // Output: 15

// How it works:
// First iteration: accumulator = 0, currentValue = 1, returns 0 + 1 = 1
// Second iteration: accumulator = 1, currentValue = 2, returns 1 + 2 = 3
// Third iteration: accumulator = 3, currentValue = 3, returns 3 + 3 = 6
// Fourth iteration: accumulator = 6, currentValue = 4, returns 6 + 4 = 10
// Fifth iteration: accumulator = 10, currentValue = 5, returns 10 + 5 = 15