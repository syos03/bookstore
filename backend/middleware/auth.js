const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Xác thực JWT token
const protect = catchAsync(async (req, res, next) => {
  let token;

  // Lấy token từ header hoặc cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Kiểm tra user còn tồn tại không
  const currentUser = await User.findById(decoded.id).select('+password');
  if (!currentUser) {
    return next(new AppError('Người dùng không tồn tại.', 401));
  }

  // Kiểm tra password có thay đổi sau khi token được tạo không
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.', 401));
  }

  req.user = currentUser;
  next();
});

// Quyền truy cập theo role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }
    next();
  };
};

// Middleware tùy chọn (không bắt buộc đăng nhập)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Bỏ qua lỗi - không bắt buộc đăng nhập
    }
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
