const logger = (req, res, next) => {    
    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    
    // Log request body if it exists
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    
    // Capture response
    console.log(`[${new Date().toISOString()}] Response Status: ${res.statusCode}`);

    next();
};
export default logger