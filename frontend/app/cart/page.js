'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cartAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      setCart(res.data.cart);
    } catch (e) {
      if (e.statusCode === 401) router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleQuantityChange = async (bookId, newQty) => {
    if (newQty < 1) return;
    setUpdating(bookId);
    try {
      await cartAPI.update(bookId, newQty);
      await fetchCart();
    } catch (e) {
      toast.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating('');
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await cartAPI.remove(bookId);
      await fetchCart();
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';
  const shippingFee = cart?.subtotal >= 300000 ? 0 : 30000;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="cart-title">🛒 Giỏ Hàng</h1>

      {!cart || cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Giỏ hàng trống</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Hãy thêm sách vào giỏ hàng nhé!</p>
          <Link href="/books" className="btn btn-primary btn-lg">📚 Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Cart Items */}
          <div className="card cart-items-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{cart.itemCount} sản phẩm</span>
              <button onClick={() => cartAPI.clear().then(fetchCart)} style={{ fontSize: 13, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                🗑️ Xóa tất cả
              </button>
            </div>

            {cart.items.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.book.thumbnail || 'https://placehold.co/80x105?text=Sách'}
                  alt={item.book.title}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <Link href={`/books/${item.book.slug || item.book._id}`}>
                    <div className="cart-item-title">{item.book.title}</div>
                  </Link>
                  <div className="cart-item-author">{item.book.author}</div>
                  <div className="cart-item-actions">
                    <div className="cart-qty-control">
                      <button className="cart-qty-btn" onClick={() => handleQuantityChange(item.book._id, item.quantity - 1)} disabled={!!updating}>−</button>
                      <span className="cart-qty-num">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => handleQuantityChange(item.book._id, item.quantity + 1)} disabled={!!updating || item.quantity >= item.book.stock}>+</button>
                    </div>
                    <div className="cart-item-price-remove">
                      <span className="cart-item-price">{formatPrice(item.itemTotal)}</span>
                      <button onClick={() => handleRemove(item.book._id)} className="cart-remove-btn">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary-wrapper">
            <div className="card cart-summary-card">
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Tóm tắt đơn hàng</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tạm tính:</span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(cart.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phí giao hàng:</span>
                  <span style={{ fontWeight: 600, color: shippingFee === 0 ? 'var(--success)' : 'inherit' }}>
                    {shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '8px 12px', borderRadius: 8 }}>
                    💡 Mua thêm {formatPrice(300000 - cart.subtotal)} để được free ship!
                  </div>
                )}
              </div>
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Tổng cộng:</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(cart.subtotal + shippingFee)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn btn-primary btn-full btn-lg">
                Tiến hành thanh toán →
              </Link>
              <Link href="/books" className="btn btn-ghost btn-full" style={{ marginTop: 10 }}>
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-title { font-size: 24px; fontWeight: 800; marginBottom: 28px; }
        .cart-grid { display: grid; gridTemplateColumns: 1fr 360px; gap: 28px; }
        .cart-items-card { padding: 20px 24px; }
        .cart-item-info { flex: 1; minWidth: 0; }
        .cart-item-title { fontWeight: 600; fontSize: 15px; marginBottom: 4px; lineHeight: 1.4; color: var(--text-main); }
        .cart-item-author { fontSize: 13px; color: var(--text-muted); marginBottom: 12px; }
        .cart-item-actions { display: flex; alignItems: center; justifyContent: space-between; flexWrap: wrap; gap: 8px; }
        .cart-item-price-remove { display: flex; alignItems: center; gap: 12px; }
        .cart-item-price { fontWeight: 700; color: var(--primary); fontSize: 16px; }
        .cart-remove-btn { color: var(--text-muted); background: none; border: none; cursor: pointer; fontSize: 18px; padding: 4px; transition: var(--transition); }
        .cart-remove-btn:hover { color: var(--error); transform: scale(1.1); }
        .cart-summary-card { padding: 24px; position: sticky; top: 80px; }

        @media (max-width: 991px) {
          .cart-grid { gridTemplateColumns: 1fr; gap: 24px; }
          .cart-summary-card { position: static; }
        }

        @media (max-width: 640px) {
          .container { paddingLeft: 16px; paddingRight: 16px; }
          .cart-title { fontSize: 20px; marginBottom: 20px; }
          .cart-items-card { padding: 16px; }
          .cart-item { gap: 12px; }
          .cart-item-image { width: 64px; height: 84px; }
          .cart-item-title { fontSize: 14px; }
          .cart-item-actions { flexDirection: column; alignItems: flex-start; gap: 12px; }
          .cart-item-price-remove { width: 100%; justifyContent: space-between; }
        }
      `}</style>
    </div>
  );
}
