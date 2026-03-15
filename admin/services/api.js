import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request: them token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof localStorage !== 'undefined' && localStorage.getItem('token'));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: xy ly loi 401
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (bookId, reviewId) => api.delete(`/admin/reviews/${bookId}/${reviewId}`),
};

export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getAllAdmin: (params) => api.get('/books/admin/all', { params }),
  getOne: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/books/${id}`),
  deleteImage: (id, imageId) => api.delete(`/books/${id}/images/${imageId}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orderAPI = {
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
};

export default api;
