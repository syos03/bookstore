'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
        <div className="spinner"></div>
      </div>
    </AdminLayout>
  );

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>📊 Tổng quan</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cập nhật hôm nay</div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <div className="card stat-card">
          <div className="stat-icon primary">💰</div>
          <div>
            <div className="stat-label">Tổng doanh thu</div>
            <div className="stat-value">{formatPrice(stats?.totalRevenue) || '0đ'}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success">📦</div>
          <div>
            <div className="stat-label">Tổng đơn hàng</div>
            <div className="stat-value">{stats?.totalOrders || 0}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon warning">👥</div>
          <div>
            <div className="stat-label">Khách hàng</div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon danger">📚</div>
          <div>
            <div className="stat-label">Sản phẩm</div>
            <div className="stat-value">{stats?.totalBooks || 0}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Đơn hàng gần đây</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', py: 32, color: 'var(--text-muted)' }}>Chưa có đơn hàng nào</td></tr>
                ) : (
                  stats?.recentOrders?.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{order.orderCode}</td>
                      <td>{order.shippingAddress?.fullName}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(order.totalPrice)}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'completed' ? 'success' :
                          order.status === 'processing' ? 'info' :
                          order.status === 'cancelled' ? 'danger' : 'warning'
                        }`}>
                          {order.status === 'pending' ? 'Chờ xử lý' :
                           order.status === 'processing' ? 'Đang xử lý' :
                           order.status === 'shipping' ? 'Đang giao' :
                           order.status === 'completed' ? 'Đã giao' : 'Đã hủy'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Books */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🔥 Sách bán chạy</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats?.topSellingBooks?.map((book, idx) => (
              <div key={book._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx < 3 ? 'var(--warning)' : 'var(--border-color)', color: idx < 3 ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {idx + 1}
                </div>
                <img 
                  src={book.thumbnail || 'https://placehold.co/40x50?text=Sách'} 
                  alt="" 
                  style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/40x50?text=Sách';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Đã bán: <b style={{ color: 'var(--primary)' }}>{book.soldCount}</b></div>
                </div>
              </div>
            ))}
            {(!stats?.topSellingBooks || stats.topSellingBooks.length === 0) && (
               <div style={{ color: 'var(--text-muted)', textAlign: 'center', py: 20 }}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
