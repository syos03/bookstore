const express = require('express');
const router = express.Router();
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { protect } = require('../middleware/auth');

// @desc    Thêm địa chỉ
// @route   POST /api/users/addresses
router.post('/addresses', protect, catchAsync(async (req, res) => {
  const { label, fullName, phone, street, ward, district, city, isDefault } = req.body;

  const user = await User.findById(req.user.id);

  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push({ label, fullName, phone, street, ward, district, city, isDefault: isDefault || user.addresses.length === 0 });
  await user.save();

  res.status(201).json({ success: true, data: { addresses: user.addresses } });
}));

// @desc    Lấy danh sách địa chỉ
// @route   GET /api/users/addresses
router.get('/addresses', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses');
  res.status(200).json({ success: true, data: { addresses: user.addresses } });
}));

// @desc    Cập nhật địa chỉ
// @route   PUT /api/users/addresses/:addressId
router.put('/addresses/:addressId', protect, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) return next(new AppError('Không tìm thấy địa chỉ.', 404));

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({ success: true, data: { addresses: user.addresses } });
}));

// @desc    Xóa địa chỉ
// @route   DELETE /api/users/addresses/:addressId
router.delete('/addresses/:addressId', protect, catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) return next(new AppError('Không tìm thấy địa chỉ.', 404));

  address.deleteOne();
  await user.save();

  res.status(200).json({ success: true, data: { addresses: user.addresses } });
}));

module.exports = router;
