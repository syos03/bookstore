const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0';

async function fixImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Books = mongoose.connection.collection('books');
    const Orders = mongoose.connection.collection('orders');

    const tikiPattern = /tikicdn\.com/;
    const placeholderBase = 'https://placehold.co/400x600?text=';

    // 1. Fix Books
    const books = await Books.find({ 
      $or: [
        { coverImage: tikiPattern },
        { thumbnail: tikiPattern },
        { "images.url": tikiPattern }
      ] 
    }).toArray();
    
    console.log(`🔍 Found ${books.length} books with Tiki images`);
    
    for (const book of books) {
      const updates = {};
      const bookTitle = encodeURIComponent(book.title || 'Sách');
      
      if (book.coverImage && tikiPattern.test(book.coverImage)) {
        updates.coverImage = `${placeholderBase}${bookTitle}`;
      }
      if (book.thumbnail && tikiPattern.test(book.thumbnail)) {
        updates.thumbnail = `${placeholderBase}${bookTitle}`;
      }
      if (book.images && Array.isArray(book.images)) {
        updates.images = book.images.map(img => {
          if (img.url && tikiPattern.test(img.url)) {
            return { ...img, url: `${placeholderBase}${bookTitle}` };
          }
          return img;
        });
      }
      
      if (Object.keys(updates).length > 0) {
        await Books.updateOne({ _id: book._id }, { $set: updates });
      }
    }
    console.log('✅ Books updated');

    // 2. Fix Orders (bookSnapshot)
    const orders = await Orders.find({ "items.bookSnapshot.coverImage": tikiPattern }).toArray();
    console.log(`🔍 Found ${orders.length} orders with Tiki images in snapshots`);

    for (const order of orders) {
      let modified = false;
      const newItems = order.items.map(item => {
        if (item.bookSnapshot?.coverImage && tikiPattern.test(item.bookSnapshot.coverImage)) {
          modified = true;
          const bookTitle = encodeURIComponent(item.bookSnapshot.title || 'Sách');
          return {
            ...item,
            bookSnapshot: {
              ...item.bookSnapshot,
              coverImage: `${placeholderBase}${bookTitle}`
            }
          };
        }
        return item;
      });

      if (modified) {
        await Orders.updateOne({ _id: order._id }, { $set: { items: newItems } });
      }
    }
    console.log('✅ Orders updated');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixImages();
