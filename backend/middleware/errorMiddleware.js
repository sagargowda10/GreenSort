// backend/middleware/errorMiddleware.js

// Handles 404 - Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Check if status code is still 200, set to 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // You can add specific checks here, e.g., for Mongoose 'CastError'
  // if (err.name === 'CastError' && err.kind === 'ObjectId') {
  //   statusCode = 404;
  //   message = 'Resource not found';
  // }

  res.status(statusCode).json({
    message: message,
    // Only show the stack trace if in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

module.exports = { notFound, errorHandler };