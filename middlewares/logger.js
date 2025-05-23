const logger = (req, res, next) => {
    const start = Date.now();
    
    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    
    // Log request body if it exists
    if (Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    
    // Capture response
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Response Status: ${res.statusCode} - Duration: ${duration}ms`);
        return originalSend.call(this, body);
    };
    
    next();
};
export default logger