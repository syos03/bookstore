const logger = require('../utils/logger');
const AppError = require('../utils/appError');

// Xử lý lỗi JWT không hợp lệ
const handleJWTError = () =>
  new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401);

// Xử lý lỗi JWT hết hạn
const handleJWTExpiredError = () =>
  new AppError('Token đã hết hạn. Vui lòng đăng nhập lại.', 401);

// Xử lý lỗi MongoDB CastError (ID không hợp lệ)
const handleCastErrorDB = (err) => {
  const message = `Giá trị không hợp lệ cho ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Xử lý lỗi duplicate key MongoDB
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' đã tồn tại. Vui lòng sử dụng giá trị khác.`;
  return new AppError(message, 400);
};

// Xử lý lỗi validation MongoDB
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Response lỗi trong development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Response lỗi trong production
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error('UNEXPECTED ERROR:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
    });
  }
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
