/**
 * Request logging middleware
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    console.log(`📤 ${req.method} ${req.url} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    
    return originalJson.call(this, body);
  };

  next();
};
//branch setup done
module.exports = requestLogger;