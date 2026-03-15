# Fullstack Bookstore E-Commerce Platform

Đây là hệ thống thương mại điện tử bán sách hoàn chỉnh, được xây dựng theo kiến trúc Clean Architecture. Dự án mô phỏng các tính năng cốt lõi của Tiki Books / Fahasa với 3 phần chính:
1. **Backend Server** (Node.js, Express, MongoDB)
2. **Frontend Client** (Next.js 14 App Router, dành cho khách hàng)
3. **Admin Dashboard** (Next.js 14 App Router, dành riêng cho quản trị viên)

---

## 💻 Tech Stack
- **Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, Passport.js (Google OAuth), Cloudinary.
- **Frontend / Admin:** Next.js 14 (React), Axios, React-hot-toast, Vanilla CSS + Custom Variables.
- **Thanh toán:** VNPay, Momo Wallet, COD.
- **Others:** Caching (Redis - Optional), Nodemailer.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

Bạn cần cài đặt **Node.js** (v18+) và có **MongoDB URI**.

### 1. Khởi chạy Backend Server
Mở terminal 1:
```bash
cd backend
npm install
# Sửa file .env.example thành .env và điền thông tin tương ứng (Mongo URI, JWT Secret...)
# Seed dữ liệu mẫu (Category, Sách, Admin, User)
npm run seed
# Khởi động server
npm run dev
```
> **Lưu ý:** Backend sẽ chạy ở http://localhost:5000. Tài khoản Admin tạo ra là `admin@bookstore.com` / `Admin@123456`

### 2. Khởi chạy Frontend (Người dùng)
Mở terminal 2:
```bash
cd frontend
npm install
npm run dev
```
> Frontend sẽ chạy ở http://localhost:3000

### 3. Khởi chạy Admin Dashboard
Mở terminal 3:
```bash
cd admin
npm install
npm run dev
```
> Admin Dashboard sẽ chạy ở http://localhost:3001

---

## ✨ Chức Năng Cốt Lõi

### Backend API:
- Phân quyền User / Admin chặt chẽ với Protect & Authorize middlewares.
- Limit Rate (Chống Spam / DoS API), Error handler tập trung.
- Tìm kiếm Text theo Index MongoDB (Tìm tiêu đề/tác giả siêu nhanh).
- Tích hợp Cloudinary Storage Upload ảnh sản phẩm.
- Google OAuth 2.0.

### Frontend (Khách hàng):
- Giao diện Premium, responsive mobile thân thiện.
- Trang chủ (Hero, Sách Nổi bật, Bán chạy).
- Danh sách sách có Filters (Danh mục, Giá), Phân trang.
- Giỏ hàng & Wishlist liên kết tài khoản.
- Tự động Gợi ý Search (Autocomplete).
- Quản lý Profile, Sổ Địa Chỉ giao hàng.
- Nạp đơn hàng Checkout (3 bước) với Payment tích hợp trực tiếp.

### Admin Dashboard:
- Thống kê biểu đồ, số bán, lượng đơn.
- CRUD Danh mục, Sách.
- Cập nhật trạng thái Đơn Hàng (Chờ xử lý -> Đang giao -> Hoàn thành).
- Phân quyền hoặc Khóa tài khoản người dùng vi phạm.
- Quản lý / Xóa Cmt Đánh giá.

---
