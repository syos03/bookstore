const Wishlist = require('../models/Wishlist');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Lấy wishlist
// @route   GET /api/wishlist
const getWishlist = catchAsync(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
    path: 'books',
    select: 'title author coverImage images slug price discount rating numReviews stock isActive',
    match: { isActive: true },
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, books: [] });
  }

  res.status(200).json({ success: true, data: { wishlist } });
});

// @desc    Thêm vào wishlist
// @route   POST /api/wishlist/add
const addToWishlist = catchAsync(async (req, res, next) => {
  const { bookId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, books: [] });
  }

  if (wishlist.books.includes(bookId)) {
    return res.status(200).json({ success: true, message: 'Sách đã có trong danh sách yêu thích.' });
  }

  wishlist.books.push(bookId);
  await wishlist.save();

  res.status(200).json({ success: true, message: 'Đã thêm vào danh sách yêu thích.' });
});

// @desc    Xóa khỏi wishlist
// @route   DELETE /api/wishlist/remove/:bookId
const removeFromWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) return next(new AppError('Wishlist không tồn tại.', 404));

  wishlist.books = wishlist.books.filter(
    (id) => id.toString() !== req.params.bookId
  );
  await wishlist.save();

  res.status(200).json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích.' });
});

// @desc    Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
// @route   POST /api/wishlist/toggle
const toggleWishlist = catchAsync(async (req, res) => {
  const { bookId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, books: [bookId] });
    return res.status(200).json({ success: true, isWishlisted: true, message: 'Đã thêm vào yêu thích.' });
  }

  const index = wishlist.books.indexOf(bookId);
  if (index === -1) {
    wishlist.books.push(bookId);
    await wishlist.save();
    return res.status(200).json({ success: true, isWishlisted: true, message: 'Đã thêm vào yêu thích.' });
  } else {
    wishlist.books.splice(index, 1);
    await wishlist.save();
    return res.status(200).json({ success: true, isWishlisted: false, message: 'Đã xóa khỏi yêu thích.' });
  }
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist };
