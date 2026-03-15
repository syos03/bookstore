import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30 giây timeout
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: gắn token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof localStorage !== 'undefined' && localStorage.getItem('token'));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: xử lý lỗi 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// =================== AUTH ===================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// =================== BOOKS ===================
export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getOne: (id) => api.get(`/books/${id}`),
  search: (q, limit = 10) => api.get('/books/search', { params: { q, limit } }),
  getFeatured: () => api.get('/books/featured'),
  getBestSelling: () => api.get('/books/best-selling'),
  getNewArrivals: () => api.get('/books/new-arrivals'),
  getByCategory: (slug, params) => api.get(`/books/category/${slug}`, { params }),
  getRecommendations: (id) => api.get(`/books/${id}/recommendations`),
  addReview: (id, data) => api.post(`/books/${id}/reviews`, data),
  create: (data) => api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/books/${id}`),
};

// =================== CATEGORIES ===================
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// =================== CART ===================
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (bookId, quantity = 1) => api.post('/cart/add', { bookId, quantity }),
  update: (bookId, quantity) => api.put('/cart/update', { bookId, quantity }),
  remove: (bookId) => api.delete(`/cart/remove/${bookId}`),
  clear: () => api.delete('/cart/clear'),
};

// =================== ORDERS ===================
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAll: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
};

// =================== WISHLIST ===================
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (bookId) => api.post('/wishlist/add', { bookId }),
  remove: (bookId) => api.delete(`/wishlist/remove/${bookId}`),
  toggle: (bookId) => api.post('/wishlist/toggle', { bookId }),
};

// =================== ADMIN ===================
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (bookId, reviewId) => api.delete(`/admin/reviews/${bookId}/${reviewId}`),
};

// =================== PAYMENT ===================
export const paymentAPI = {
  createVNPay: (orderId) => api.post('/payment/vnpay/create', { orderId }),
  createMomo: (orderId) => api.post('/payment/momo/create', { orderId }),
  simulateSuccess: (orderId) => api.post('/payment/simulate-success', { orderId }),
};

// =================== USER ===================
export const userAPI = {
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

export default api;
