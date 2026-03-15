'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { orderAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAllAdmin({ page, limit: 10 });
      setOrders(res.data.orders);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error('Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await orderAPI.updateStatus(id, newStatus, 'Admin cập nhật trạng thái');
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>📦 Quản lý đơn hàng</h1>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32 }}>Chưa có đơn hàng nào</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 600 }}>#{order.orderCode}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.shippingAddress?.fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.shippingAddress?.phone}</div>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatPrice(order.totalPrice)}</td>
                        <td>
                          <span className={`badge ${order.isPaid ? 'success' : 'warning'}`}>
                            {order.isPaid ? 'Đã TT' : 'Chưa TT'}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="form-control" 
                            style={{ padding: '6px 12px', width: 'auto', fontWeight: 600,
                              backgroundColor: order.status === 'completed' ? '#f0fdf4' : 
                                             order.status === 'cancelled' ? '#fef2f2' : '#fff'
                            }}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => toast('Tính năng xem chi tiết đang phát triển')}>Xem</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trang trước</button>
                <span style={{ padding: '6px 12px', fontWeight: 600 }}>{page} / {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
