module.exports = (err, req, res, next) => {
  console.error('API Error Route Exception:', err.message || err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
