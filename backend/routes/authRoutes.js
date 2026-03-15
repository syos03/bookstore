const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register, login, logout, getProfile,
  updateProfile, changePassword,
  forgotPassword, resetPassword, googleCallback,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingleImage, processSingleUpload } = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/auth/login?error=oauth_failed' }),
  googleCallback
);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadSingleImage, processSingleUpload, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
