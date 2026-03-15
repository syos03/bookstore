const User = require('../models/User');
const Cart = require('../models/Cart');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

// Helper: Tạo và gửi token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

// @desc    Đăng ký
// @route   POST /api/auth/register
const register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.', 400));
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('Email này đã được sử dụng.', 400));
  }

  const user = await User.create({ name, email: email.toLowerCase(), password, phone });

  // Tạo giỏ hàng trống cho user mới
  await Cart.create({ user: user._id, items: [] });

  sendTokenResponse(user, 201, res);
});

// @desc    Đăng nhập
// @route   POST /api/auth/login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Vui lòng nhập email và mật khẩu.', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.', 403));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Đăng xuất
// @route   POST /api/auth/logout
const logout = catchAsync(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Đăng xuất thành công.' });
});

// @desc    Lấy thông tin profile
// @route   GET /api/auth/profile
const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: { user } });
});

// @desc    Cập nhật thông tin profile
// @route   PUT /api/auth/profile
const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'phone'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.uploadedImage) {
    updates.avatar = req.uploadedImage.url;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: { user } });
});

// @desc    Đổi mật khẩu
// @route   PUT /api/auth/change-password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Mật khẩu hiện tại không đúng.', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Quên mật khẩu - gửi email reset
// @route   POST /api/auth/forgot-password
const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng với email này.', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu BookStore (có hiệu lực 10 phút)',
      html: `
        <h2>Xin chào ${user.name},</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào đường dẫn dưới đây:</p>
        <a href="${resetUrl}" style="background:#e74c3c;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
          Đặt lại mật khẩu
        </a>
        <p>Đường dẫn có hiệu lực trong 10 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br><strong>BookStore Team</strong></p>
      `,
    });

    res.status(200).json({
      success: true,
      message: `Email đặt lại mật khẩu đã được gửi tới ${user.email}`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Không thể gửi email. Vui lòng thử lại sau.', 500));
  }
});

// @desc    Đặt lại mật khẩu
// @route   PUT /api/auth/reset-password/:token
const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
const googleCallback = catchAsync(async (req, res) => {
  const user = req.user;

  // Đảm bảo user có giỏ hàng
  const existingCart = await Cart.findOne({ user: user._id });
  if (!existingCart) {
    await Cart.create({ user: user._id, items: [] });
  }

  const token = user.generateAuthToken();
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  googleCallback,
};
