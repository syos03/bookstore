const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect); // Tất cả cart routes yêu cầu đăng nhập
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:bookId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
