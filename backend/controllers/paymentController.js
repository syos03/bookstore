const crypto = require('crypto');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/Order');
const logger = require('../utils/logger');

// ==================== VNPAY ====================
// Tạo URL thanh toán VNPay
const createVNPayUrl = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const orderId_str = order.orderCode;
  const amount = order.totalPrice * 100; // VNPay dùng đơn vị nhỏ nhất (đồng * 100)

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId_str,
    vnp_OrderInfo: `Thanh toan don hang ${orderId_str}`,
    vnp_OrderType: 'billpayment',
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: req.ip || '127.0.0.1',
    vnp_CreateDate: createDate,
  };

  // Sắp xếp params theo thứ tự alphabet
  vnp_Params = Object.keys(vnp_Params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {});

  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  // simulation mode
  const paymentUrl = `${process.env.CLIENT_URL}/payment/simulate?orderId=${order._id}&method=vnpay&orderCode=${order.orderCode}&amount=${order.totalPrice}`;

  res.status(200).json({ success: true, data: { paymentUrl } });
});

// Xử lý callback VNPay
const vnpayCallback = catchAsync(async (req, res) => {
  const vnp_Params = { ...req.query };
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {});

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const orderCode = vnp_Params['vnp_TxnRef'];
  const responseCode = vnp_Params['vnp_ResponseCode'];

  if (secureHash === signed && responseCode === '00') {
    // Thanh toán thành công
    await Order.findOneAndUpdate(
      { orderCode },
      {
        paymentStatus: 'paid',
        isPaid: true,
        paidAt: new Date(),
        vnpayTransactionId: vnp_Params['vnp_TransactionNo'],
        status: 'processing',
        $push: { statusHistory: { status: 'processing', note: 'Thanh toán VNPay thành công' } },
      }
    );

    return res.redirect(`${process.env.CLIENT_URL}/payment/success?orderCode=${orderCode}&method=vnpay`);
  }

  // Thanh toán thất bại
  await Order.findOneAndUpdate({ orderCode }, { paymentStatus: 'failed' });
  return res.redirect(`${process.env.CLIENT_URL}/payment/failed?orderCode=${orderCode}`);
});

// ==================== MOMO ====================
const createMomoPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;

  const requestId = `${partnerCode}_${Date.now()}`;
  const requestType = 'payWithMethod';
  const amount = String(order.totalPrice);
  const orderId_str = order.orderCode;
  const orderInfo = `Thanh toan don hang ${orderId_str}`;
  const extraData = '';
  const autoCapture = true;
  const lang = 'vi';

  // Tạo chữ ký
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId_str}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: 'BookStore',
    storeId: 'BookStore01',
    requestId,
    amount,
    orderId: orderId_str,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    signature,
  };

  // simulation mode
  return res.status(200).json({
    success: true,
    data: { paymentUrl: `${process.env.CLIENT_URL}/payment/simulate?orderId=${order._id}&method=momo&orderCode=${order.orderCode}&amount=${order.totalPrice}` },
  });
});

// @desc    Giả lập thanh toán thành công
// @route   POST /api/payment/simulate-success
const simulateSuccess = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  
  if (!order) return next(new AppError('Không tìm thấy đơn hàng.', 404));

  order.paymentStatus = 'paid';
  order.isPaid = true;
  order.status = 'processing';
  order.paidAt = new Date();
  order.statusHistory.push({
    status: 'processing',
    note: `Thanh toán ${order.paymentMethod.toUpperCase()} thành công`,
    updatedAt: new Date()
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Thanh toán thành công',
    redirectUrl: `${process.env.CLIENT_URL}/payment/success?orderCode=${order.orderCode}&method=${order.paymentMethod}`
  });
});

// Momo IPN (Instant Payment Notification)
const momoIPN = catchAsync(async (req, res) => {
  const { orderId, resultCode, transId, signature } = req.body;

  // Xác minh chữ ký (simplified - implement full verification in production)
  if (resultCode === 0) {
    await Order.findOneAndUpdate(
      { orderCode: orderId },
      {
        paymentStatus: 'paid',
        isPaid: true,
        paidAt: new Date(),
        momoTransactionId: String(transId),
        status: 'processing',
        $push: { statusHistory: { status: 'processing', note: 'Thanh toán Momo thành công' } },
      }
    );
  } else {
    await Order.findOneAndUpdate({ orderCode: orderId }, { paymentStatus: 'failed' });
  }

  res.status(200).json({ message: 'ok' });
});

module.exports = { 
  createVNPayUrl, 
  vnpayCallback, 
  createMomoPayment, 
  momoIPN, 
  simulateSuccess 
};
