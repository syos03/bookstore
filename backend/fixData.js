const mongoose = require('mongoose');
require('dotenv').config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const booksCollection = db.collection('books');
    const usersCollection = db.collection('users');

    // 1. Fix corrupted book data
    const resultReviews = await booksCollection.updateMany(
      { reviews: { $type: 'string' } },
      { $set: { reviews: [] } }
    );
    console.log(`✨ Đã sửa ${resultReviews.modifiedCount} sách bị lỗi reviews dạng chuỗi.`);

    const resultImages = await booksCollection.updateMany(
      { images: { $not: { $type: 'array' } } },
      { $set: { images: [] } }
    );
    console.log(`✨ Đã sửa ${resultImages.modifiedCount} sách bị lỗi images.`);

    // 2. Replace Placeholder URLs for Books
    const books = await booksCollection.find({
      $or: [
        { coverImage: /via\.placeholder\.com/ },
        { coverImage: /dummyimage\.com/ },
        { "images.url": /via\.placeholder\.com/ },
        { "images.url": /dummyimage\.com/ }
      ]
    }).toArray();

    let updatedBooksCount = 0;
    for (const book of books) {
      let changed = false;
      let coverImage = book.coverImage;
      if (coverImage && (coverImage.includes('via.placeholder.com') || coverImage.includes('dummyimage.com'))) {
        coverImage = coverImage.replace('via.placeholder.com', 'placehold.co').replace('dummyimage.com', 'placehold.co');
        coverImage = coverImage.replace('&text=', '?text=');
        changed = true;
      }

      let images = (book.images || []).map(img => {
        if (img.url && (img.url.includes('via.placeholder.com') || img.url.includes('dummyimage.com'))) {
          let newUrl = img.url.replace('via.placeholder.com', 'placehold.co').replace('dummyimage.com', 'placehold.co');
          newUrl = newUrl.replace('&text=', '?text=');
          changed = true;
          return { ...img, url: newUrl };
        }
        return img;
      });

      if (changed) {
        await booksCollection.updateOne(
          { _id: book._id },
          { $set: { coverImage, images } }
        );
        updatedBooksCount++;
      }
    }
    console.log(`✨ Đã cập nhật lại URL cho ${updatedBooksCount} sách.`);

    // 3. Replace Placeholder URLs for Users
    const users = await usersCollection.find({
      $or: [
        { avatar: /via\.placeholder\.com/ },
        { avatar: /dummyimage\.com/ }
      ]
    }).toArray();

    let updatedUsersCount = 0;
    for (const user of users) {
      let avatar = user.avatar;
      if (avatar && (avatar.includes('via.placeholder.com') || avatar.includes('dummyimage.com'))) {
        avatar = avatar.replace('via.placeholder.com', 'placehold.co').replace('dummyimage.com', 'placehold.co');
        avatar = avatar.replace('&text=', '?text=');
        await usersCollection.updateOne({ _id: user._id }, { $set: { avatar } });
        updatedUsersCount++;
      }
    }
    console.log(`✨ Đã cập nhật lại avatar cho ${updatedUsersCount} người dùng.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
};

cleanup();
