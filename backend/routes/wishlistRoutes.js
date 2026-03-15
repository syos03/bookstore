const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/remove/:bookId', removeFromWishlist);

module.exports = router;
