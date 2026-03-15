const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://taogiahan1908_db_user:01259033249Hao@cluster0.s3ytpun.mongodb.net/bookstore?appName=Cluster0';

async function fixAvatars() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Users = mongoose.connection.collection('users');
    const brokenPattern = /cloudinary\.com.*default-avatar\.png/;
    const placeholder = 'https://placehold.co/100x100?text=User';

    const result = await Users.updateMany(
      { avatar: brokenPattern },
      { $set: { avatar: placeholder } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with broken avatars`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixAvatars();
