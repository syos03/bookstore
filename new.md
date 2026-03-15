# 📚 Bookstore E-Commerce System (Node.js + MongoDB)

## 1. Project Overview

Build a **modern online bookstore e-commerce website** similar to large platforms like Fahasa, Tiki Books, or Amazon Books.

The system must be **production-ready**, scalable, and include:

* Frontend website
* Backend API using Node.js
* Admin dashboard
* MongoDB database
* Payment integration

---

# 2. Technology Stack

## Backend

Node.js

## Database

MongoDB
Mongoose ODM

## Frontend

HTML
CSS
JavaScript
or Next.js / React (optional)

## Authentication

JWT Authentication
Google OAuth Login

## Payment

VNPay
Momo
Cash on Delivery (COD)

## Image Storage

Cloudinary

## Cache

Redis (optional)

---

# 3. Project Structure

```
bookstore/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
├── client/
│   ├── pages/
│   ├── components/
│   ├── styles/
│
├── admin/
│   ├── dashboard/
│
└── database/
    └── seed-data
```

---

# 4. MongoDB Data Models

## Users

```
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  createdAt: Date
}
```

---

## Books

```
{
  _id: ObjectId,
  title: String,
  author: String,
  publisher: String,
  category: ObjectId,
  price: Number,
  stock: Number,
  description: String,
  images: [String],
  pages: Number,
  publishYear: Number,
  rating: Number
}
```

---

## Categories

```
{
  _id: ObjectId,
  name: String,
  description: String
}
```

---

## Orders

```
{
  _id: ObjectId,
  userId: ObjectId,
  items: [OrderItems],
  totalPrice: Number,
  shippingAddress: Object,
  paymentMethod: String,
  status: String,
  createdAt: Date
}
```

---

## OrderItems

```
{
  bookId: ObjectId,
  quantity: Number,
  price: Number
}
```

---

## Reviews

```
{
  _id: ObjectId,
  userId: ObjectId,
  bookId: ObjectId,
  rating: Number,
  comment: String,
  createdAt: Date
}
```

---

## Wishlist

```
{
  userId: ObjectId,
  books: [ObjectId]
}
```

---

## Cart

```
{
  userId: ObjectId,
  items: [
    {
      bookId: ObjectId,
      quantity: Number
    }
  ]
}
```

---

# 5. REST API System

## Authentication API

```
POST /auth/register
POST /auth/login
POST /auth/google
GET /auth/profile
```

---

## Books API

```
GET /books
GET /books/:id
POST /books
PUT /books/:id
DELETE /books/:id
```

---

## Categories API

```
GET /categories
POST /categories
PUT /categories/:id
DELETE /categories/:id
```

---

## Cart API

```
GET /cart
POST /cart/add
DELETE /cart/remove
PUT /cart/update
```

---

## Orders API

```
POST /orders
GET /orders
GET /orders/:id
PUT /orders/status
```

---

## Reviews API

```
POST /reviews
GET /reviews/book/:id
DELETE /reviews/:id
```

---

## Wishlist API

```
POST /wishlist/add
GET /wishlist
DELETE /wishlist/remove
```

---

# 6. Frontend Features

## Homepage

Display:

* Promotional banners
* Featured books
* Best selling books
* New books
* Book categories

---

## Book Categories

Filters:

* price range
* author
* publisher
* rating

Sorting:

* price ascending
* price descending
* best selling
* newest

---

## Search System

Search by:

* book title
* author
* keyword

Features:

* autocomplete
* search suggestions

---

## Book Detail Page

Display:

* book images
* title
* author
* publisher
* description
* publish year
* number of pages
* ratings

Actions:

* add to cart
* add to wishlist
* write review

---

## User Account

Users can:

* register
* login
* reset password
* login with Google

User dashboard includes:

* profile management
* shipping addresses
* order history
* wishlist

---

## Shopping Cart

Functions:

* add product
* remove product
* update quantity
* calculate total price

---

## Checkout

Steps:

1 Enter shipping address
2 Select payment method
3 Confirm order

Payment methods:

* COD
* VNPay
* Momo

---

## Order Tracking

Statuses:

* Pending
* Processing
* Shipping
* Completed
* Cancelled

---

# 7. Admin Dashboard

Admin can manage:

* books
* categories
* orders
* users
* reviews
* promotions

Dashboard displays:

* total revenue
* total orders
* best selling books
* revenue charts

---

# 8. Advanced Features

Optional features:

* AI book recommendation
* "Users also bought"
* SEO optimization
* Mobile responsive design
* Redis caching
* Email notifications

---

# 9. Development Requirements

The system must include:

* clean Node.js architecture
* MongoDB schema using Mongoose
* RESTful API
* secure authentication
* error handling
* logging system

---

# 10. Expected Output

The generated project should include:

1 Full project structure
2 MongoDB models
3 Node.js backend API
4 Frontend pages
5 Admin dashboard
6 Sample books data
7 Database seed script
8 Setup and run instructions

The goal is to create a **fully functional bookstore e-commerce system that can run locally after cloning the repository**.
