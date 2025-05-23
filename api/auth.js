import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export default () => {
    const router = Router();
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    
    // In-memory user store (replace with database in production)
    const users = new Map();

    // Custom Authentication Routes
    router.post("/custom/signup", async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Check if user already exists
            if (users.has(email)) {
                return res.status(400).json({
                    code: 400,
                    message: "User already exists"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = {
                id: uuidv4(),
                email,
                password: hashedPassword,
                name,
                createdAt: new Date().toISOString()
            };

            // Store user
            users.set(email, user);

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            return res.status(201).json({
                code: 201,
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

    // Supabase Authentication Routes
    router.post("/supabase/signup", async (req, res) => {
        try {
            const supabase = req.app.get('supabase');
            const { email, password, name } = req.body;

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name
                    }
                }
            });

            if (error) {
                return res.status(400).json({
                    code: 400,
                    message: error.message
                });
            }

            return res.status(201).json({
                code: 201,
                data
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    });

    router.post("/supabase/login", async (req, res) => {
        try {
            const supabase = req.app.get('supabase');
            const { email, password } = req.body;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return res.status(401).json({
                    code: 401,
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