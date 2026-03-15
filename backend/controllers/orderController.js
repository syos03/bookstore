const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/emailService');

// @desc    Tạo đơn hàng
// @route   POST /api/orders
const createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod, note, items: frontendItems } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return next(new AppError('Vui lòng cung cấp địa chỉ giao hàng và phương thức thanh toán.', 400));
  }

  // Lấy items từ giỏ hàng hoặc từ frontend (mua ngay)
  let orderItems = [];
  let subtotal = 0;

  if (frontendItems && frontendItems.length > 0) {
    // Mua ngay
    for (const item of frontendItems) {
      const book = await Book.findById(item.bookId);
      if (!book || !book.isActive) {
        return next(new AppError(`Sách "${item.title || item.bookId}" không còn tồn tại.`, 400));
      }
      if (book.stock < item.quantity) {
        return next(new AppError(`Sách "${book.title}" chỉ còn ${book.stock} cuốn.`, 400));
      }
      const finalPrice = book.discount > 0
        ? Math.round(book.price * (1 - book.discount / 100))
        : book.price;

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: finalPrice,
        bookSnapshot: {
          title: book.title,
          author: book.author,
          coverImage: book.coverImage || book.images?.[0]?.url || '',
          slug: book.slug,
        },
      });
      subtotal += finalPrice * item.quantity;
    }
  } else {
    // Từ giỏ hàng
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Giỏ hàng trống.', 400));
    }

    for (const item of cart.items) {
      const book = item.book;
      if (!book || !book.isActive) continue;
      if (book.stock < item.quantity) {
        return next(new AppError(`Sách "${book.title}" chỉ còn ${book.stock} cuốn.`, 400));
      }
      const finalPrice = book.discount > 0
        ? Math.round(book.price * (1 - book.discount / 100))
        : book.price;

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: finalPrice,
        bookSnapshot: {
          title: book.title,
          author: book.author,
          coverImage: book.coverImage || book.images?.[0]?.url || '',
          slug: book.slug,
        },
      });
      subtotal += finalPrice * item.quantity;
    }
  }

  if (orderItems.length === 0) {
    return next(new AppError('Không có sản phẩm hợp lệ để đặt hàng.', 400));
  }

  const shippingFee = subtotal >= 300000 ? 0 : 30000; // Free ship nếu >= 300k
  const totalPrice = subtotal + shippingFee;

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingFee,
    totalPrice,
    note,
    statusHistory: [{ status: 'pending', note: 'Đơn hàng đã được tạo' }],
  });

  // Cập nhật stock sách
  await Promise.all(
    orderItems.map(async (item) => {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    })
  );

  // Xóa giỏ hàng nếu đặt từ giỏ hàng
  if (!frontendItems) {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
  }

  // Gửi email xác nhận (Chạy ngầm, không await để tránh treo đơn hàng)
  const user = req.user;
  sendEmail({
    to: user.email,
    subject: `Xác nhận đơn hàng #${order.orderCode} - BookStore`,
    html: `
      <h2>Xin chào ${user.name}!</h2>
      <p>Đơn hàng <strong>#${order.orderCode}</strong> của bạn đã được đặt thành công.</p>
      <p>Tổng tiền: <strong>${totalPrice.toLocaleString('vi-VN')}đ</strong></p>
      <p>Phương thức thanh toán: <strong>${paymentMethod.toUpperCase()}</strong></p>
      <p>Trân trọng,<br><strong>BookStore Team</strong></p>
    `,
  }).catch(err => console.error('❌ Lỗi gửi email ngầm:', err.message));

  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.book', 'title author');

  res.status(201).json({ success: true, data: { order: populatedOrder } });
});

// @desc    Lấy danh sách đơn hàng của user
// @route   GET /api/orders
const getMyOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-statusHistory')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: { orders },
  });
});

// @desc    Lấy chi tiết đơn hàng
// @route   GET /api/orders/:id
const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { orderCode: req.params.id },
    ],
    user: req.user.id,
  }).populate('items.book', 'title author slug');

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng.', 404));
  }

  res.status(200).json({ success: true, data: { order } });
});

// @desc    Hủy đơn hàng (User)
// @route   PUT /api/orders/:id/cancel
const cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  if (!['pending', 'processing'].includes(order.status)) {
    return next(new AppError('Không thể hủy đơn hàng ở trạng thái này.', 400));
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Khách hàng hủy đơn';
  order.cancelledAt = new Date();
  order.statusHistory.push({
    status: 'cancelled',
    note: req.body.reason || 'Khách hàng hủy đơn',
    updatedBy: req.user.id,
  });

  // Hoàn trả stock
  await Promise.all(
    order.items.map(async (item) => {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    })
  );

  await order.save();
  res.status(200).json({ success: true, message: 'Đã hủy đơn hàng.', data: { order } });
});

// ==================== ADMIN ====================

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders/admin/all
const getAllOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: { orders },
  });
});

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ.', 400));
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  order.status = status;
  order.statusHistory.push({ status, note, updatedBy: req.user.id });

  if (status === 'shipping') order.shippedAt = new Date();
  if (status === 'completed') {
    order.completedAt = new Date();
    order.paymentStatus = 'paid';
  }
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    // Hoàn trả stock
    await Promise.all(
      order.items.map(async (item) => {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      })
    );
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng.', data: { order } });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
