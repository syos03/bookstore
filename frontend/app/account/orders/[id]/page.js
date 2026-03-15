'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOne(params.id);
        setOrder(res.data.order);
      } catch (err) {
        toast.error('Không thể tải chi tiết đơn hàng');
        router.push('/account/orders');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

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

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';

  if (loading) return <div className="spinner"></div>;
  if (!order) return null;

  return (
    <div className="card" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Chi tiết đơn hàng #{order.orderCode}</h2>
        <span style={{ marginLeft: 'auto', fontWeight: 600, color: getStatusColor(order.status), padding: '6px 16px', background: `${getStatusColor(order.status)}15`, borderRadius: 20 }}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Địa chỉ giao hàng */}
        <div style={{ padding: 20, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>📍 Địa chỉ giao hàng</h3>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{order.shippingAddress?.fullName}</div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Điện thoại: {order.shippingAddress?.phone}</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {order.shippingAddress?.street}<br/>
            {[order.shippingAddress?.ward, order.shippingAddress?.district, order.shippingAddress?.city].filter(Boolean).join(', ')}
          </div>
        </div>

        {/* Thông tin thanh toán */}
        <div style={{ padding: 20, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>💳 Hình thức thanh toán</h3>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Phương thức: </span>
            {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
             order.paymentMethod === 'vnpay' ? 'VNPay' : 'Momo'}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Trạng thái: </span>
            {order.isPaid ? (
              <span className="badge badge-success">Đã thanh toán lúc {new Date(order.paidAt).toLocaleString('vi-VN')}</span>
            ) : (
              <span className="badge badge-warning">Chưa thanh toán</span>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, padding: '16px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', margin: 0 }}>📦 Sản phẩm</h3>
        <div style={{ padding: '0 20px' }}>
          {order.items.map((item, idx) => (
             <div key={idx} style={{ padding: '16px 0', display: 'flex', gap: 16, borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border)' : 'none' }}>
               <div style={{ width: 60, height: 80, position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
                 <img 
                   src={item.bookSnapshot?.coverImage || item.book?.thumbnail || 'https://placehold.co/60x80?text=Sách'} 
                   alt="" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = `https://placehold.co/60x80?text=${encodeURIComponent(item.bookSnapshot?.title || item.title || 'Sách')}`;
                   }}
                 />
               </div>
               <div style={{ flex: 1 }}>
                 <Link href={`/books/${item.bookSnapshot?.slug || item.book?._id}`} style={{ fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 4 }}>
                   {item.bookSnapshot?.title || item.title}
                 </Link>
                 <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mã sách: {item.book?._id?.slice(-8)}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{formatPrice(item.price)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>SL: x{item.quantity}</div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Tổng kết */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Tạm tính</span>
            <span>{formatPrice(order.items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Phí vận chuyển</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          {order.taxPrice > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Thuế</span>
              <span>{formatPrice(order.taxPrice)}</span>
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Tổng cộng</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
