const Cart = require('../models/Cart');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Lấy giỏ hàng
// @route   GET /api/cart
const getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.book',
    select: 'title author coverImage images slug price discount stock isActive',
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Tính tổng tiền và loại bỏ sách không còn active
  const validItems = cart.items.filter(
    (item) => item.book && item.book.isActive && item.book.stock > 0
  );

  const cartData = {
    _id: cart._id,
    items: validItems.map((item) => {
      const book = item.book;
      const finalPrice = book.discount > 0
        ? Math.round(book.price * (1 - book.discount / 100))
        : book.price;
      return {
        _id: item._id,
        book: {
          _id: book._id,
          title: book.title,
          author: book.author,
          slug: book.slug,
          thumbnail: book.coverImage || book.images?.[0]?.url || '',
          price: book.price,
          discount: book.discount,
          finalPrice,
          stock: book.stock,
        },
        quantity: Math.min(item.quantity, book.stock),
        itemTotal: finalPrice * Math.min(item.quantity, book.stock),
      };
    }),
    subtotal: 0,
    itemCount: 0,
  };

  cartData.subtotal = cartData.items.reduce((sum, item) => sum + item.itemTotal, 0);
  cartData.itemCount = cartData.items.reduce((sum, item) => sum + item.quantity, 0);

  res.status(200).json({ success: true, data: { cart: cartData } });
});

// @desc    Thêm sách vào giỏ hàng
// @route   POST /api/cart/add
const addToCart = catchAsync(async (req, res, next) => {
  const { bookId, quantity = 1 } = req.body;

  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    return next(new AppError('Không tìm thấy sách.', 404));
  }

  if (book.stock < 1) {
    return next(new AppError('Sách này đã hết hàng.', 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.book.toString() === bookId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + parseInt(quantity);
    if (newQty > book.stock) {
      return next(new AppError(`Chỉ còn ${book.stock} cuốn trong kho.`, 400));
    }
    existingItem.quantity = newQty;
  } else {
    if (parseInt(quantity) > book.stock) {
      return next(new AppError(`Chỉ còn ${book.stock} cuốn trong kho.`, 400));
    }
    cart.items.push({ book: bookId, quantity: parseInt(quantity) });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Đã thêm vào giỏ hàng.',
    data: { itemCount: cart.items.reduce((total, item) => total + item.quantity, 0) },
  });
});

// @desc    Cập nhật số lượng
// @route   PUT /api/cart/update
const updateCartItem = catchAsync(async (req, res, next) => {
  const { bookId, quantity } = req.body;

  if (quantity < 1) {
    return next(new AppError('Số lượng phải ít nhất là 1.', 400));
  }

  const book = await Book.findById(bookId);
  if (!book) return next(new AppError('Không tìm thấy sách.', 404));

  if (quantity > book.stock) {
    return next(new AppError(`Chỉ còn ${book.stock} cuốn trong kho.`, 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Giỏ hàng không tồn tại.', 404));

  const item = cart.items.find((item) => item.book.toString() === bookId);
  if (!item) return next(new AppError('Sách không có trong giỏ hàng.', 404));

  item.quantity = parseInt(quantity);
  await cart.save();

  res.status(200).json({ success: true, message: 'Đã cập nhật giỏ hàng.' });
});

// @desc    Xóa sách khỏi giỏ hàng
// @route   DELETE /api/cart/remove/:bookId
const removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Giỏ hàng không tồn tại.', 404));

  cart.items = cart.items.filter(
    (item) => item.book.toString() !== req.params.bookId
  );
  await cart.save();

  res.status(200).json({ success: true, message: 'Đã xóa khỏi giỏ hàng.' });
});

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/cart/clear
const clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
  res.status(200).json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng.' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
