const Category = require('../models/Category');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .populate('bookCount');

  res.status(200).json({ success: true, data: { categories } });
});

// @desc    Lấy chi tiết danh mục
// @route   GET /api/categories/:id
const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
  });

  if (!category) {
    return next(new AppError('Không tìm thấy danh mục.', 404));
  }

  res.status(200).json({ success: true, data: { category } });
});

// @desc    Tạo danh mục (Admin)
// @route   POST /api/categories
const createCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon, sortOrder } = req.body;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new AppError('Danh mục này đã tồn tại.', 400));
  }

  const categoryData = { name, description, icon, sortOrder };
  if (req.uploadedImage) {
    categoryData.image = req.uploadedImage.url;
  }

  const category = await Category.create(categoryData);
  res.status(201).json({ success: true, data: { category } });
});

// @desc    Cập nhật danh mục (Admin)
// @route   PUT /api/categories/:id
const updateCategory = catchAsync(async (req, res, next) => {
  const updates = { ...req.body };
  if (req.uploadedImage) {
    updates.image = req.uploadedImage.url;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('Không tìm thấy danh mục.', 404));
  }

  res.status(200).json({ success: true, data: { category } });
});

// @desc    Xóa danh mục (Admin)
// @route   DELETE /api/categories/:id
const deleteCategory = catchAsync(async (req, res, next) => {
  const bookCount = await Book.countDocuments({ category: req.params.id });
  if (bookCount > 0) {
    return next(new AppError(`Không thể xóa danh mục đang có ${bookCount} cuốn sách.`, 400));
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('Không tìm thấy danh mục.', 404));
  }

  res.status(200).json({ success: true, message: 'Đã xóa danh mục thành công.' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
