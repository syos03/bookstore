const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const Order = mongoose.connection.collection('orders');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(1).toArray();
    
    if (orders.length > 0) {
        console.log('--- One Raw Order Keys ---');
        console.log(Object.keys(orders[0]));
        console.log('--- Values ---');
        console.log(JSON.stringify(orders[0], null, 2));
    } else {
        console.log('No orders found');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
