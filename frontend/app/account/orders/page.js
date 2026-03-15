'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getMyOrders();
        setOrders(res.data.orders);
      } catch (err) {
        toast.error('Không thể tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await orderAPI.cancel(id, 'Người dùng tự hủy');
      toast.success('Đã hủy đơn hàng');
      setOrders(orders.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đơn hàng');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--success)';
      case 'cancelled': return 'var(--error)';
      case 'shipping': return 'var(--info)';
      case 'processing': return 'var(--primary)';
      default: return 'var(--warning)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      case 'shipping': return 'Đang giao hàng';
      case 'processing': return 'Đang xử lý';
      default: return 'Chờ xác nhận';
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card" style={{ padding: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Quản lý Đơn hàng</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Bạn chưa có đơn hàng nào</h3>
          <p style={{ marginBottom: 24 }}>Hãy khám phá thêm sách và đặt hàng nhé!</p>
          <Link href="/books" className="btn btn-primary">Khám phá Sách</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {orders.map(order => (
            <div key={order._id} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              
              {/* Header đơn hàng */}
              <div style={{ background: 'var(--bg)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                 <div>
                   <span style={{ fontWeight: 700, marginRight: 16 }}>Đơn hàng: <span style={{ color: 'var(--primary)' }}>#{order.orderCode}</span></span>
                   <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   {order.isPaid ? (
                     <span className="badge badge-success">Đã thanh toán</span>
                   ) : (
                     <span className="badge badge-warning">Chưa thanh toán</span>
                   )}
                   <span style={{ fontWeight: 600, color: getStatusColor(order.status) }}>
                     {getStatusText(order.status)}
                   </span>
                 </div>
              </div>

              {/* Sản phẩm trong đơn */}
              <div style={{ padding: '0 24px' }}>
                 {order.items.map((item, idx) => (
                   <div key={idx} style={{ padding: '16px 0', display: 'flex', gap: 16, borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                     <div style={{ width: 60, height: 80, position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
                       <img src={item.bookSnapshot?.coverImage || item.book?.thumbnail || item.book?.coverImage || item.book?.images?.[0]?.url || 'https://placehold.co/60x80?text=Sách'} alt={item.bookSnapshot?.title || item.title || 'Book cover'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                     <div style={{ flex: 1 }}>
                       <Link href={`/books/${item.bookSnapshot?.slug || item.book?._id}`} style={{ fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 4 }}>
                         {item.bookSnapshot?.title || item.title}
                       </Link>
                       <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Số lượng: x{item.quantity}</div>
                     </div>
                     <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                       {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                     </div>
                   </div>
                 ))}
              </div>

              {/* Footer đơn hàng */}
              <div style={{ background: 'var(--bg)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                 <div style={{ fontSize: 14 }}>
                   Thành tiền: <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', marginLeft: 8 }}>{(order.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                 </div>
                 <div style={{ display: 'flex', gap: 12 }}>
                   {order.status === 'pending' && (
                     <button className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleCancelOrder(order._id)}>
                       Hủy đơn
                     </button>
                   )}
                   <Link href={`/account/orders/${order._id}`} className="btn btn-primary">
                     Xem chi tiết
                   </Link>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
