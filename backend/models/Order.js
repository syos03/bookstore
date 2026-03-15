const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải ít nhất là 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  bookSnapshot: {
    title: String,
    author: String,
    coverImage: String,
    slug: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderCode: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      ward: String,
      district: { type: String, required: true },
      city: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'vnpay', 'momo'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 30000,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      maxlength: 500,
    },
    cancelReason: String,
    cancelledAt: Date,
    shippedAt: Date,
    completedAt: Date,
    vnpayTransactionId: String,
    momoTransactionId: String,
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

// Auto-generate order code
orderSchema.pre('save', async function (next) {
  if (!this.orderCode) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderCode = `BS${Date.now().toString().slice(-8)}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
// orderSchema.index({ orderCode: 1 }); // Đã có unique: true ở schema

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
