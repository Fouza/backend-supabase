import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default () => {
    const router = Router();
    const JWT_SECRET = process.env.JWT_SECRET

    // Validation patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Custom Authentication Routes
    router.post("/signup", async (req, res) => {
        try {
            const supabase = req.app.get('supabase')

            const { email, password, first_name, last_name } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    code: 400,
                    message: 'Email and password are required'
                });
            }
            
            // Email format verification
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    code: 400,
                    message: 'Invalid email format. Please use a valid email address.'
                });
            }

            // Password format verification
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    code: 400,
                    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
                });
            }

            const { data, error } = await supabase.from("users").select("id").eq("email", email).single()

            if (data) {
                return res.status(400).json({
                    code: 400,
                    message: 'Email already in use'
                });
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
            const { data: dataUser, error: errorUser } = await supabase.from("users").insert([user]).select("*").single()

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

    router.post("/login", async (req, res) => {
        try {
            const supabase = req.app.get('supabase')
            const { email, password } = req.body;

            // Email format verification
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    code: 400,
                    message: 'Invalid email format. Please use a valid email address.'
                });
            }

            // Find user
            const { data: dataUser, error: errorUser } = await supabase.from("users").select("*").eq("email", email).single()

            if (!dataUser) {
                return res.status(401).json({
                    code: 401,
                    message: "Invalid email"
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, dataUser.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    code: 401,
                    message: "Invalid password"
                });
            }

            // Generate token
            const token = jwt.sign(
                { user_id: dataUser.id, email: dataUser.email },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            return res.json({
                code: 200,
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

    return router;
};