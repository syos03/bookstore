const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUser, getReviews, deleteReview } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/reviews', getReviews);
router.delete('/reviews/:bookId/:reviewId', deleteReview);

module.exports = router;
