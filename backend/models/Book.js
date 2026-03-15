const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên sách không được để trống'],
      trim: true,
      maxlength: [200, 'Tên sách không quá 200 ký tự'],
      index: 'text',
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    author: {
      type: String,
      required: [true, 'Tác giả không được để trống'],
      trim: true,
      index: 'text',
    },
    publisher: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục không được để trống'],
    },
    price: {
      type: Number,
      required: [true, 'Giá không được để trống'],
      min: [0, 'Giá phải lớn hơn 0'],
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: [true, 'Số lượng tồn kho không được để trống'],
      min: [0, 'Số lượng phải >= 0'],
      default: 0,
    },
    description: {
      type: String,
      maxlength: [5000, 'Mô tả không quá 5000 ký tự'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    coverImage: {
      type: String,
      default: '',
    },
    pages: {
      type: Number,
      min: 1,
    },
    publishYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    bookLanguage: {
      type: String,
      default: 'Tiếng Việt',
    },
    isbn: {
      type: String,
      sparse: true,
    },
    weight: {
      type: Number, // gram
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index cho search
bookSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { language_override: 'dummyLanguage' }
);
bookSchema.index({ category: 1, price: 1 });
bookSchema.index({ soldCount: -1 });
bookSchema.index({ createdAt: -1 });

// Virtual: URL ảnh bìa từ images[0] nếu không có coverImage
bookSchema.virtual('thumbnail').get(function () {
  if (this.coverImage) return this.coverImage;
  if (this.images && this.images.length > 0) return this.images[0].url;
  return 'https://placehold.co/400x500?text=No+Image';
});

// Tính discount price
bookSchema.virtual('finalPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Cập nhật rating trung bình khi có review mới
bookSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Tạo slug từ title
bookSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      + '-' + Date.now();
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
