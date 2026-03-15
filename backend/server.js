const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');

// Load env vars
dotenv.config();

// Connect to Database & Services
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Route files
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Error Handler
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Connect DB
connectDB();

// Passport config
require('./config/passport');

const app = express();

// Cấu hình bắt buộc khi chạy trên các dịch vụ Cloud (Render, Heroku, Vercel...)
// để thư viện express-rate-limit bắt đúng IP người dùng.
app.set('trust proxy', 1);

// ==================== MIDDLEWARE ====================
// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001'
    ];
    // Cho phép localhost hoặc bất kỳ domain Vercel/Render nào
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Chặn bởi CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport
app.use(passport.initialize());

// Rate Limiter
app.use('/api/', rateLimiter);

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BookStore API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// THÊM TẠM THỜI: API để nạp dữ liệu (Seed) trên Render (Dùng 1 lần rồi xóa)
app.get('/api/seed', async (req, res) => {
  try {
    const { exec } = require('child_process');
    exec('node seed.js', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      res.status(200).json({ success: true, message: 'Đã nạp dữ liệu thành công!', logs: stdout });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tìm thấy`
  });
});

// Global Error Handler
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server đang chạy ở port ${PORT} (${process.env.NODE_ENV})`);
  logger.info(`📖 BookStore API: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
