import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default () => {
    const router = Router();
    const JWT_SECRET = process.env.JWT_SECRET


    // Custom Authentication Routes
    router.post("/signup", async (req, res) => {
        try {
            const supabase = req.app.get('supabase')

            const { email, password, first_name, last_name } = req.body;

            // Todo : Email format verification
            // Todo : Password format verification

            if (!email || !password) {
                res.send({
                    code: 400,
                    message: 'Email and password are required'
                })
            }

            const { data, error } = await supabase.from("users").select("id").eq("email", email).single()

            if (data) {
                res.send({
                    message: 'Email already in use'
                })
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = {
                email,
                password: hashedPassword,
                first_name,
                last_name,
            };

            // Store user
            const {data: dataUser, error:errorUser} = await supabase.from("users").insert([user]).select("*").single()

            if (errorUser) {
                return res.status(500).json({
                    code: 500,
                    message: errorUser.message
                });
            }

            // Generate token
            const token = jwt.sign(
                { user_id: dataUser.id, email: dataUser.email },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            return res.status(201).json({
                code: 201,
                data: {
                    user: dataUser,
                    token
                }
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    });

    router.post("/custom/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = users.get(email);
            if (!user) {
                return res.status(401).json({
                    code: 401,
                    message: "Invalid credentials"
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    code: 401,
                    message: "Invalid credentials"
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            return res.json({
                code: 200,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    },
                    token
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