const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Tạo transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Gửi email
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BookStore <noreply@bookstore.com>',
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email đã gửi tới ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Lỗi gửi email tới ${to}: ${error.message}`);
    throw error;
  }
};

// Email chào mừng
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🎉 Chào mừng bạn đến với BookStore!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">📚 BookStore</h1>
        <h2>Chào mừng ${user.name}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại BookStore.</p>
        <p>Khám phá hàng nghìn đầu sách chất lượng với giá tốt nhất!</p>
        <a href="${process.env.CLIENT_URL}/books" 
           style="background:#e74c3c;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
          🛒 Mua sắm ngay
        </a>
        <p style="color:#666;font-size:14px;">BookStore Team</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcomeEmail };
