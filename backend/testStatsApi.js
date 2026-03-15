const axios = require('axios');

async function test() {
  try {
    // We can't easily login to get a token here, but we can simulate the controller call locally
    const Order = require('./models/Order');
    const Book = require('./models/Book');
    const User = require('./models/User');
    const mongoose = require('mongoose');

    await mongoose.connect('mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0');
    
    // Simulate what the controller does
    const [totalRevenue, totalOrders, totalBooks, totalUsers, recentOrders] = await Promise.all([
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Order.countDocuments(),
        Book.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'customer' }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    ]);

    const result = {
        success: true,
        data: {
          stats: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalBooks,
            totalUsers,
          },
          recentOrders,
        }
    };

    console.log('--- Simulated API Response ---');
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
