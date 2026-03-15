const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const Order = mongoose.connection.collection('orders');

    // Find all orders that have totalAmount but no totalPrice
    const result = await Order.updateMany(
      { totalPrice: { $exists: false }, totalAmount: { $exists: true } },
      [
        { $set: { totalPrice: '$totalAmount' } }
      ]
    );

    console.log(`Migrated ${result.modifiedCount} orders.`);

    // Also check if some orders have neither
    const missing = await Order.countDocuments({ totalPrice: { $exists: false } });
    console.log(`Orders still missing totalPrice: ${missing}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
