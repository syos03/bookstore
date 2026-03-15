const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Lấy thống kê tổng quan (Dashboard)
// @route   GET /api/admin/stats
const getDashboardStats = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    totalOrders,
    pendingOrders,
    totalBooks,
    totalUsers,
    recentOrders,
    bestSellingBooks,
    ordersByStatus,
    revenueChart,
  ] = await Promise.all([
    // Tổng doanh thu
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    // Doanh thu tháng này
    Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    // Doanh thu tháng trước
    Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Book.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'customer' }),
    // Đơn hàng gần đây
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean(),
    // Sách bán chạy nhất
    Book.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('title author coverImage images soldCount rating price'),
    // Đơn hàng theo trạng thái
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // Doanh thu 12 tháng gần nhất
    Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const monthlyRevenueGrowth =
    lastMonthRevenue[0]?.total > 0
      ? (((monthlyRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total) * 100
      : 0;

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      revenueGrowth: Math.round(monthlyRevenueGrowth * 10) / 10,
      totalOrders,
      pendingOrders,
      totalBooks,
      totalUsers,
      recentOrders,
      bestSellingBooks,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      revenueChart,
    },
  });
});

// @desc    Lấy danh sách users (Admin)
// @route   GET /api/admin/users
const getUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) {
    filter.$or = [
      { name: { $regex: req.query.q, $options: 'i' } },
      { email: { $regex: req.query.q, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: { users },
  });
});

// @desc    Cập nhật trạng thái user (Admin)
// @route   PUT /api/admin/users/:id
const updateUser = catchAsync(async (req, res, next) => {
  const { isActive, role } = req.body;

  if (req.params.id === req.user.id) {
    return next(new AppError('Không thể tự chỉnh sửa tài khoản của mình.', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive, role },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError('Không tìm thấy người dùng.', 404));

  res.status(200).json({ success: true, data: { user } });
});

// @desc    Lấy tất cả reviews (Admin)
// @route   GET /api/admin/reviews
const getReviews = catchAsync(async (req, res) => {
  const books = await Book.find({ 'reviews.0': { $exists: true } })
    .select('title author reviews')
    .populate('reviews.user', 'name avatar');

  const reviews = [];
  books.forEach((book) => {
    book.reviews.forEach((review) => {
      reviews.push({
        _id: review._id,
        book: { _id: book._id, title: book.title, author: book.author },
        user: review.user,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      });
    });
  });

  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({ success: true, total: reviews.length, data: { reviews } });
});

// @desc    Xóa review (Admin)
// @route   DELETE /api/admin/reviews/:bookId/:reviewId
const deleteReview = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) return next(new AppError('Không tìm thấy sách.', 404));

  book.reviews = book.reviews.filter(
    (r) => r._id.toString() !== req.params.reviewId
  );
  book.updateRating();
  await book.save();

  res.status(200).json({ success: true, message: 'Đã xóa đánh giá.' });
});

module.exports = { getDashboardStats, getUsers, updateUser, getReviews, deleteReview };
