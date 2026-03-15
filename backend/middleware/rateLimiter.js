const rateLimit = require('express-rate-limit');
const AppError = require('../utils/appError');

// Rate limiter chung (Đã tăng limit cho Development)
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5000, // Tăng lên 5000 dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này. Đã đạt giới hạn 5000 requests.',
  },
});

// Rate limiter cho auth (nghiêm ngặt hơn)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
  },
});

// Rate limiter cho tìm kiếm
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 60,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu tìm kiếm. Vui lòng thử lại sau.',
  },
});

module.exports = rateLimiter;
module.exports.authLimiter = authLimiter;
module.exports.searchLimiter = searchLimiter;
