const express = require('express');
const router = express.Router();
const {
  getBooks, getBooksAdmin, getBook, searchBooks,
  getFeaturedBooks, getBestSellingBooks, getNewArrivals,
  getBooksByCategory, createBook, updateBook, deleteBook,
  deleteBookImage, addReview, getRecommendations,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImages, processUpload } = require('../middleware/upload');
const { searchLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', getBooks);
router.get('/search', searchLimiter, searchBooks);
router.get('/featured', getFeaturedBooks);
router.get('/best-selling', getBestSellingBooks);
router.get('/new-arrivals', getNewArrivals);
router.get('/category/:slug', getBooksByCategory);
router.get('/:id', getBook);
router.get('/:id/recommendations', getRecommendations);

// User routes (cần đăng nhập)
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getBooksAdmin);
router.post('/', protect, authorize('admin'), uploadImages, processUpload, createBook);
router.put('/:id', protect, authorize('admin'), uploadImages, processUpload, updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);
router.delete('/:id/images/:imageId', protect, authorize('admin'), deleteBookImage);

module.exports = router;
