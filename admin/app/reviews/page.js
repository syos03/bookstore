'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function ReviewsManagement() {
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReviews();
      setReviewsList(res.data.reviews || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (bookId, reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này? Không thể khôi phục!')) return;
    try {
      await adminAPI.deleteReview(bookId, reviewId);
      toast.success('Đã xóa đánh giá thành công');
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa đánh giá');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>⭐ Quản lý đánh giá</h1>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Sách</th>
                  <th>Người dùng</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Ngày đăng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reviewsList.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32 }}>Chưa có đánh giá nào</td></tr>
                ) : (
                  reviewsList.map(item => (
                    <tr key={item._id}>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={item.book.coverImage || 'https://placehold.co/40x50?text=S%C3%A1ch'} alt="" style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.book.title}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.user?.name || 'Ẩn danh'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.user?.email || ''}</div>
                      </td>
                      <td>
                        <span style={{ color: '#f39c12', fontSize: 14 }}>
                          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                        </span>
                      </td>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.comment}
                        </div>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                         <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.book._id, item._id)}>Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
