import { Router } from "express";
import bcrypt from "bcryptjs";
import { passwordRegex } from "./auth";

export default () => {
  const router = Router();
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Get user profile with their products and orders
  router.get("/profile", async (req, res) => {
    try {
      const supabase = req.app.get("supabase");
      const { userId: user_id } = req.user;

      // Get user details with their products and orders
      const { data, error } = await supabase
        .from("users")
        .select(
          `
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
                `
        )
        .eq("id", user_id)
        .single();

      if (error) {
        return res.status(500).json({
          code: 500,
          message: error.message,
        });
      }

      // Calculate user statistics
      const stats = {
        total_products: data.products.length,
        total_orders: data.orders.length,
        total_spent: data.orders.reduce((sum, order) => sum + order.total, 0),
        total_earned: data.products.reduce((sum, product) => {
          const productOrders = data.orders.filter(
            (order) => order.products && order.product_id === product.id
          );
          return (
            sum +
            productOrders.reduce((orderSum, order) => orderSum + order.total, 0)
          );
        }, 0),
      };

      return res.send({
        code: 200,
        data: {
          ...data,
          stats,
        },
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: error.message,
      });
    }
  });

  router.put("/profile", async (req, res) => {
    try {
      const supabase = req.app.get("supabase");
      const { userId: user_id } = req.user;
      const { first_name, last_name, current_password, new_password } =
        req.body;

      if (current_password && new_password) {
        if (
          !passwordRegex.test(new_password) ||
          current_password === new_password
        ) {
          return res.status(400).json({
            code: 400,
            message: "wrong password format or password aleardy used.",
          });
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("password")
          .eq("id", user_id)
          .single();

        const isCurrentPasswordCorrect = await bcrypt.compare(
          current_password,
          user.password
        );

        if (!isCurrentPasswordCorrect) {
          return res.status(400).json({
            code: 400,
            error: "Current password is incorrect.",
          });
        }

        const newHashedPassword = await bcrypt.hash(new_password, 10);
        console.log("...:", newHashedPassword);

        const { data: dataUser, error: errorUser } = await supabase
          .from("users")
          .update({ password: newHashedPassword })
          .eq("id", user_id)
          .select("password")
          .single();

        if (errorUser) {
          return res.status(500).json({
            code: 500,
            message: errorUser.message,
          });
        }
      }

      if (!first_name && !last_name) {
        return res.status(400).json({
          code: 400,
          message: "You have to specify at least one field to update.",
        });
      }
      const { data: dataUser, error: errorUser } = await supabase
        .from("users")
        .update({ first_name, last_name })
        .select("first_name,last_name")
        .eq("id", user_id)
        .single();

      if (errorUser) {
        return res.status(500).json({
          code: 500,
          message: errorUser.message,
        });
      }

      return res.status(200).json({
        code: 200,
        data: dataUser,
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: error.message,
      });
    }
  });
  return router;
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

    // Update user profile
    router.put('/profile', async (req, res) => {
        try {
            const supabase = req.app.get('supabase');
            const { userId: user_id } = req.user;
            const { first_name, last_name, current_password, new_password } = req.body;
            // If updating password
            if (current_password && new_password) {
                if (!passwordRegex.test(new_password) && current_password === new_password) {
                    return res.send({
                        code: 400, 
                        message: 'Password in wrong format or password already used'
                    })
                }
                // Get current user data
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('password')
                    .eq('id', user_id)
                    .single();

                if (userError) {
                    return res.status(500).json({
                        code: 500,
                        message: userError.message
                    });
                }

                // Verify current password
                const isValidPassword = await bcrypt.compare(current_password, user.password);
                if (!isValidPassword) {
                    return res.status(401).json({
                        code: 401,
                        message: 'Current password is incorrect'
                    });
                }
                
                // Hash new password
                const hashedPassword = await bcrypt.hash(new_password, 10);

                // Update user with new password
                const { data, error } = await supabase
                    .from('users')
                    .update({
                        first_name,
                        last_name,
                        password: hashedPassword
                    })
                    .eq('id', user_id)
                    .select('id, email, first_name, last_name')
                    .single();

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
            }

            // Update profile without password change
            const { data, error } = await supabase
                .from('users')
                .update({
                    first_name,
                    last_name
                })
                .eq('id', user_id)
                .select('id, email, first_name, last_name')
                .single();

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
