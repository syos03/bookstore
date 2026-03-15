const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');
const { cloudinary } = require('../config/cloudinary');

// Lưu file tạm trong memory
const storage = multer.memoryStorage();

// Filter chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new AppError('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp).', 400));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Tối đa 5 ảnh
  },
});

// Upload ảnh lên Cloudinary từ buffer
const uploadToCloudinary = (buffer, folder = 'bookstore/books') => {
  return new Promise((resolve, reject) => {
    // Mock if no real API key
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
      console.log('⚠️ Bỏ qua upload Cloudinary vì thiếu API KEY. Trả về ảnh mock.');
      return resolve({ 
        url: 'https://placehold.co/800x1000?text=Mock+Book+Image', 
        publicId: 'mock_' + Date.now() 
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto:good' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// Middleware upload nhiều ảnh
const uploadImages = upload.array('images', 5);

// Middleware upload một ảnh
const uploadSingleImage = upload.single('image');

// Xử lý upload lên Cloudinary sau khi multer nhận file
const processUpload = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const uploadedImages = [];
    for (const file of req.files) {
      // Tải lên tuần tự để tránh lỗi "Unhandled Rejection" khi một ảnh fail
      const result = await uploadToCloudinary(file.buffer);
      uploadedImages.push(result);
    }
    req.uploadedImages = uploadedImages;
    next();
  } catch (error) {
    next(new AppError(`Lỗi upload ảnh: ${error.message}`, 500));
  }
};

const processSingleUpload = async (req, res, next) => {
  if (!req.file) return next();

  try {
    req.uploadedImage = await uploadToCloudinary(req.file.buffer, 'bookstore/avatars');
    next();
  } catch (error) {
    next(new AppError(`Lỗi upload ảnh: ${error.message}`, 500));
  }
};

module.exports = {
  upload,
  uploadImages,
  uploadSingleImage,
  processUpload,
  processSingleUpload,
  uploadToCloudinary,
};
