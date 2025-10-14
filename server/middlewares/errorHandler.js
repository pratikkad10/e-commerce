const errorHandler = (err, req, res, next) => {
  const errorLog = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous',
    statusCode: err.status || 500,
    timestamp: new Date().toISOString()
  };
  
  console.error('Error occurred:', errorLog);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;