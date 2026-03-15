const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    const Order = mongoose.connection.collection('orders');

    // Set isPaid: true for all orders with paymentStatus: 'paid'
    const result = await Order.updateMany(
      { paymentStatus: 'paid' },
      { $set: { isPaid: true } }
    );

    console.log(`Updated ${result.modifiedCount} orders to isPaid: true`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
