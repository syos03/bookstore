const express = require('express');
const router = express.Router();
const { createVNPayUrl, vnpayCallback, createMomoPayment, momoIPN, simulateSuccess } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// VNPay
router.post('/vnpay/create', protect, createVNPayUrl);
router.get('/vnpay/callback', vnpayCallback);

// Momo
router.post('/momo/create', protect, createMomoPayment);
router.post('/momo/ipn', momoIPN);

// Simulation
router.post('/simulate-success', protect, simulateSuccess);

module.exports = router;
