const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    const Order = mongoose.connection.collection('orders');
    
    const countTotalAmount = await Order.countDocuments({ totalAmount: { $exists: true } });
    const countTotalPrice = await Order.countDocuments({ totalPrice: { $exists: true } });
    const countBoth = await Order.countDocuments({ totalAmount: { $exists: true }, totalPrice: { $exists: true } });
    const total = await Order.countDocuments();

    console.log(`Total Orders: ${total}`);
    console.log(`With totalAmount: ${countTotalAmount}`);
    console.log(`With totalPrice: ${countTotalPrice}`);
    console.log(`With Both: ${countBoth}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
