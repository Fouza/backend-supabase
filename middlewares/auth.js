import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                code: 401,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            message: 'Invalid token'
        });
    }
};

export const supabaseAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                code: 401,
                message: 'Authentication required'
            });
        }

        const supabase = req.app.get('supabase');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                code: 401,
                message: 'Invalid token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            code: 401,
            message: 'Invalid token'
        });
    }
}; 