# 📚 BookStore – Nền tảng Thương mại Điện tử Sách Chuyên sâu

[![Bookstore CI/CD](https://github.com/syos03/bookstore/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/syos03/bookstore/actions/workflows/ci_cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**BookStore** là một hệ thống thương mại điện tử hoàn chỉnh (Fullstack) dành riêng cho lĩnh vực sách, được xây dựng với kiến trúc hiện đại, tập trung vào trải nghiệm người dùng (UX) và hiệu năng hệ thống. Dự án bao gồm hệ thống Frontend cho khách hàng, Admin Dashboard cho quản trị viên và một RESTful API mạnh mẽ.

---

## 🔗 Demo & Links
- **🌐 Live Demo (Frontend):** [bookstore-psi-eight.vercel.app](https://bookstore-psi-eight.vercel.app/)
- **⚙️ Admin Dashboard:** [admin-bookstore.vercel.app](https://admin-bookstore.vercel.app/) (Tài khoản demo: `admin@bookstore.com` / `Admin@123456`)
- **🛰️ Backend API:** [bookstore-api.onrender.com](https://bookstore-api.onrender.com/)

---

## ✨ Tính Năng Nổi Bật

### 🔐 Bảo mật & Xác thực
- **Xác thực đa tầng:** Kết hợp Google OAuth 2.0 (Passport.js) và JWT bảo mật cao.
- **Phân quyền người dùng:** Middleware kiểm soát quyền truy cập chi tiết giữa User và Admin.
- **Bảo mật API:** Chống tấn công brute-force với Rate Limiting và bảo vệ header với Helmet.

### 🛍️ Trải nghiệm Mua sắm
- **Tìm kiếm thông minh:** Kỹ thuật Debounce giúp Autocomplete siêu nhanh mà không quá tải server.
- **Giỏ hàng & Thanh toán:** Quy trình Checkout 3 bước mượt mà, hỗ trợ tích hợp các cổng thanh toán (Mô phỏng).
- **Responsive Design:** Thiết kế tối ưu cho mọi thiết bị từ Desktop đến Mobile (Mobile-first optimization).

### 📊 Quản trị (Admin)
- **Thống kê Real-time:** Theo dõi doanh thu, số đơn hàng và lượng người dùng qua biểu đồ Recharts.
- **Quản lý nội dung (CMS):** CRUD Sách và Danh mục với tích hợp Cloudinary để tối ưu hóa hình ảnh.

---

## 🛠️ Stack Công Nghệ

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend / Admin** | Next.js 14/15, React, Vanilla CSS, Axios, Recharts |
| **Backend** | Node.js, Express, MongoDB Atlas, Mongoose |
| **Authentication** | Passport.js, JWT, Google OAuth 2.0 |
| **Infrastructure** | GitHub Actions (CI/CD), Vercel, Render, Cloudinary |
| **Testing/Linting** | Jest, Supertest, ESLint |

---

## 🚀 Hướng dẫn Cài đặt (Local)

1. **Clone repository:**
   ```bash
   git clone https://github.com/syos03/bookstore.git
   ```

2. **Cấu hình biến môi trường:**
   Tạo tệp `.env` trong thư mục `backend/` và `.env.local` trong `frontend/` dựa trên các tệp `.example`.

3. **Chạy dự án:**
   - **Backend:** `cd backend && npm install && npm run dev`
   - **Frontend:** `cd frontend && npm install && npm run dev`
   - **Admin:** `cd admin && npm install && npm run dev`

---

## 🛡️ CI/CD & Testing
Dự án được tích hợp quy trình **GitHub Actions** tự động:
- **CI:** Tự động chạy Lint và các bản Unit Test (Jest) mỗi khi push code.
- **CD:** Tự động triển khai lên Vercel và Render sau khi các bài kiểm tra thành công.

---

## 📄 Giấy phép
Bản quyền thuộc về [syos03](https://github.com/syos03). Phát hành dưới giấy phép MIT.
