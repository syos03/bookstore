const Book = require('../models/Book');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Lấy danh sách sách
// @route   GET /api/books
const getBooks = catchAsync(async (req, res) => {
  const query = Book.find({ isActive: true }).populate('category', 'name slug');

  const features = new ApiFeatures(query, req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [books, total] = await Promise.all([
    features.query,
    Book.countDocuments({ isActive: true, ...buildCountFilter(req.query) }),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: features.page || 1,
    limit: features.limit || 12,
    totalPages: Math.ceil(total / (features.limit || 12)),
    data: { books },
  });
});

// @desc    Lấy tất cả sách cho admin (bao gồm cả bị ẩn/xóa mềm)
// @route   GET /api/books/admin/all
const getBooksAdmin = catchAsync(async (req, res) => {
  const query = Book.find().populate('category', 'name slug');

  const features = new ApiFeatures(query, req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [books, total] = await Promise.all([
    features.query,
    Book.countDocuments(buildCountFilter(req.query)),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: features.page || 1,
    limit: features.limit || 12,
    totalPages: Math.ceil(total / (features.limit || 12)),
    data: { books },
  });
});

// Helper: Build filter object for counting
const buildCountFilter = (queryStr) => {
  const q = { ...queryStr };
  const removeFields = ['page', 'limit', 'sort', 'fields'];
  removeFields.forEach((el) => delete q[el]);

  if ('q' in q) {
    delete q.q;
  }

  let queryObj = {};
  if (Object.keys(q).length > 0) {
    let queryString = JSON.stringify(q);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryString);
  }
  return queryObj;
};

// @desc    Lấy chi tiết sách
// @route   GET /api/books/:id
const getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
    isActive: true,
  })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!book) {
    return next(new AppError('Không tìm thấy sách.', 404));
  }

  res.status(200).json({ success: true, data: { book } });
});

// @desc    Tìm kiếm sách (với autocomplete)
// @route   GET /api/books/search
const searchBooks = catchAsync(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, data: { books: [] } });
  }

  const books = await Book.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { author: { $regex: q, $options: 'i' } },
    ],
    isActive: true,
  })
    .select('title author coverImage images slug price discount')
    .limit(parseInt(limit))
    .lean();

  // Thêm finalPrice
  const result = books.map((book) => ({
    ...book,
    finalPrice: book.discount > 0 ? Math.round(book.price * (1 - book.discount / 100)) : book.price,
    thumbnail: book.coverImage || (book.images?.[0]?.url) || '',
  }));

  res.status(200).json({ success: true, data: { books: result } });
});

// @desc    Lấy sách nổi bật
// @route   GET /api/books/featured
const getFeaturedBooks = catchAsync(async (req, res) => {
  const books = await Book.find({ isFeatured: true, isActive: true })
    .populate('category', 'name')
    .select('title author coverImage images slug price discount rating numReviews soldCount')
    .limit(8)
    .lean();

  res.status(200).json({ success: true, data: { books } });
});

// @desc    Lấy sách bán chạy
// @route   GET /api/books/best-selling
const getBestSellingBooks = catchAsync(async (req, res) => {
  const books = await Book.find({ isActive: true })
    .sort({ soldCount: -1 })
    .populate('category', 'name')
    .select('title author coverImage images slug price discount rating numReviews soldCount')
    .limit(12)
    .lean();

  res.status(200).json({ success: true, data: { books } });
});

// @desc    Lấy sách mới nhất
// @route   GET /api/books/new-arrivals
const getNewArrivals = catchAsync(async (req, res) => {
  const books = await Book.find({ isActive: true })
    .sort({ createdAt: -1 })
    .populate('category', 'name')
    .select('title author coverImage images slug price discount rating numReviews')
    .limit(12)
    .lean();

  res.status(200).json({ success: true, data: { books } });
});

// @desc    Lấy sách theo danh mục
// @route   GET /api/books/category/:slug
const getBooksByCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return next(new AppError('Không tìm thấy danh mục.', 404));
  }

  const features = new ApiFeatures(
    Book.find({ category: category._id, isActive: true }).populate('category', 'name slug'),
    req.query
  )
    .sort()
    .filter()
    .paginate();

  const [books, total] = await Promise.all([
    features.query,
    Book.countDocuments({ category: category._id, isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: features.page || 1,
    limit: features.limit || 12,
    totalPages: Math.ceil(total / (features.limit || 12)),
    data: { category, books },
  });
});

// @desc    Thêm sách mới (Admin)
// @route   POST /api/books
const createBook = catchAsync(async (req, res, next) => {
  // Chỉ lấy các field được phép
  const allowedFields = [
    'title', 'author', 'publisher', 'category', 'price', 'originalPrice',
    'discount', 'stock', 'description', 'pages', 'publishYear',
    'bookLanguage', 'isbn', 'weight', 'isFeatured', 'isActive', 'tags', 'coverImage'
  ];
  
  const bookData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) bookData[field] = req.body[field];
  });

  // Xử lý ảnh upload
  if (req.uploadedImages && req.uploadedImages.length > 0) {
    bookData.images = req.uploadedImages;
    bookData.coverImage = req.uploadedImages[0].url;
  }

  const book = await Book.create(bookData);
  const populated = await book.populate('category', 'name slug');

  res.status(201).json({ success: true, data: { book: populated } });
});

// @desc    Cập nhật sách (Admin)
// @route   PUT /api/books/:id
const updateBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError('Không tìm thấy sách.', 404));
  }

  // Chỉ lấy các field được phép
  const allowedFields = [
    'title', 'author', 'publisher', 'category', 'price', 'originalPrice',
    'discount', 'stock', 'description', 'pages', 'publishYear',
    'bookLanguage', 'isbn', 'weight', 'isFeatured', 'isActive', 'tags', 'coverImage'
  ];
  
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      // Nếu là tags và đang bị gửi dạng string "" (từ FormData), ta bỏ qua hoặc parse
      if (field === 'tags' && req.body[field] === '') return;
      updates[field] = req.body[field];
    }
  });

  if (req.uploadedImages && req.uploadedImages.length > 0) {
    updates.images = [...(book.images || []), ...req.uploadedImages];
    if (!book.coverImage) updates.coverImage = req.uploadedImages[0].url;
  }

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.status(200).json({ success: true, data: { book: updatedBook } });
});

// @desc    Xóa sách (Admin - soft delete)
// @route   DELETE /api/books/:id
const deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError('Không tìm thấy sách.', 404));
  }

  // Soft delete
  book.isActive = false;
  await book.save();

  res.status(200).json({ success: true, message: 'Đã xóa sách thành công.' });
});

// @desc    Xóa ảnh của sách (Admin)
// @route   DELETE /api/books/:id/images/:imageId
const deleteBookImage = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError('Không tìm thấy sách.', 404));

  // Tìm ảnh bằng DB ID
  const image = book.images.id(req.params.imageId);
  if (!image) return next(new AppError('Không tìm thấy ảnh.', 404));

  const publicId = image.publicId;
  const imageUrl = image.url;

  // Xóa trên Cloudinary nếu có publicId
  if (publicId) {
    try {
      await deleteFromCloudinary(publicId);
    } catch (err) {
      console.error('❌ Lỗi Cloudinary:', err.message);
    }
  }

  // Xóa khỏi mảng images
  book.images.pull(req.params.imageId);

  // Cập nhật coverImage nếu trùng
  if (book.coverImage === imageUrl) {
    book.coverImage = book.images[0]?.url || '';
  }
  
  // Đảm bảo reviews không bị lỗi string trước khi save (cho chắc chắn)
  if (typeof book.reviews === 'string') {
    book.reviews = [];
  }
  
  await book.save();

  res.status(200).json({ success: true, data: { book } });
});

// @desc    Đánh giá sách
// @route   POST /api/books/:id/reviews
const addReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.id);

  if (!book) return next(new AppError('Không tìm thấy sách.', 404));

  // Kiểm tra đã review chưa
  const alreadyReviewed = book.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );

  if (alreadyReviewed) {
    return next(new AppError('Bạn đã đánh giá sách này rồi.', 400));
  }

  book.reviews.push({ user: req.user.id, rating: Number(rating), comment });
  book.updateRating();
  await book.save();

  res.status(201).json({ success: true, message: 'Đánh giá thành công.', data: { book } });
});

// @desc    Lấy sách gợi ý (AI suggestion - "Users Also Bought")
// @route   GET /api/books/:id/recommendations
const getRecommendations = catchAsync(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(200).json({ success: true, data: { books: [] } });
  }

  // Gợi ý sách cùng category và cùng tác giả
  const recommendations = await Book.find({
    _id: { $ne: book._id },
    isActive: true,
    $or: [{ category: book.category }, { author: book.author }],
  })
    .select('title author coverImage images slug price discount rating numReviews soldCount')
    .sort({ soldCount: -1, rating: -1 })
    .limit(8)
    .lean();

  res.status(200).json({ success: true, data: { books: recommendations } });
});

module.exports = {
  getBooks,
  getBook,
  searchBooks,
  getFeaturedBooks,
  getBestSellingBooks,
  getNewArrivals,
  getBooksByCategory,
  createBook,
  updateBook,
  deleteBook,
  deleteBookImage,
  addReview,
  getRecommendations,
  getBooksAdmin,
};
