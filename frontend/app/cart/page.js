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
          <div className="cart-left">
            <div className="card cart-items-card">
              <div className="cart-header-row">
                <span style={{ flex: 1 }}>Sản phẩm ({cart.itemCount})</span>
                <span className="desktop-only" style={{ width: 120, textAlign: 'center' }}>Số lượng</span>
                <span className="desktop-only" style={{ width: 120, textAlign: 'right' }}>Thành tiền</span>
                <button onClick={() => cartAPI.clear().then(fetchCart)} className="clear-all-btn">
                  🗑️ Xóa tất cả
                </button>
              </div>

              <div className="cart-items-list">
                {cart.items.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img
                      src={item.book.coverImage || item.book.thumbnail || 'https://placehold.co/80x110?text=Sách'}
                      alt={item.book.title}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-main">
                        <Link href={`/books/${item.book.slug || item.book._id}`}>
                          <h4 className="cart-item-title">{item.book.title}</h4>
                        </Link>
                        <p className="cart-item-author">bởi {item.book.author}</p>
                        <button onClick={() => handleRemove(item.book._id)} className="remove-link-btn">
                          Xóa
                        </button>
                      </div>

                      <div className="cart-item-qty">
                        <div className="qty-picker">
                          <button onClick={() => handleQuantityChange(item.book._id, item.quantity - 1)} disabled={!!updating}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.book._id, item.quantity + 1)} disabled={!!updating || item.quantity >= item.book.stock}>+</button>
                        </div>
                      </div>

                      <div className="cart-item-total-price">
                        {formatPrice(item.itemTotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-right">
            <div className="card summary-card">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: shippingFee === 0 ? 'var(--success)' : 'inherit' }}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="shipping-hint">
                    Mua thêm <b>{formatPrice(300000 - cart.subtotal)}</b> để được miễn phí vận chuyển!
                  </div>
                )}
              </div>
              
              <div className="summary-total">
                <span>Tổng cộng</span>
                <span className="total-amount">{formatPrice(cart.subtotal + shippingFee)}</span>
              </div>
              
              <Link href="/checkout" className="btn btn-primary btn-full btn-lg checkout-btn">
                MUA HÀNG NGAY
              </Link>
              <Link href="/books" className="btn btn-ghost btn-full" style={{ marginTop: 12 }}>
                ← Tiếp tục chọn thêm sách
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-title { font-size: 28px; fontWeight: 800; marginBottom: 32px; letter-spacing: -0.5px; }
        .cart-grid { display: grid; gridTemplateColumns: 1fr 380px; gap: 32px; alignItems: start; }
        
        .cart-items-card { padding: 0; overflow: hidden; }
        .cart-header-row { display: flex; padding: 16px 24px; background: #fdfdfd; borderBottom: 1px solid var(--border-light); fontSize: 13px; fontWeight: 700; color: var(--text-muted); textTransform: uppercase; letter-spacing: 0.5px; }
        
        .cart-item { display: flex; padding: 24px; borderBottom: 1px solid var(--border-light); gap: 24px; }
        .cart-item:last-child { borderBottom: none; }
        .cart-item-image { width: 100px; height: 140px; objectFit: cover; borderRadius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        
        .cart-item-details { flex: 1; display: flex; gap: 24px; alignItems: center; }
        .cart-item-main { flex: 1; }
        .cart-item-title { fontSize: 18px; fontWeight: 700; color: var(--text-main); marginBottom: 4px; lineHeight: 1.4; transition: color 0.2s; }
        .cart-item-title:hover { color: var(--primary); }
        .cart-item-author { fontSize: 13px; color: var(--text-muted); marginBottom: 12px; }
        
        .qty-picker { display: flex; alignItems: center; border: 1px solid var(--border); borderRadius: 6px; overflow: hidden; width: fit-content; margin: 0 auto; }
        .qty-picker button { width: 32px; height: 32px; background: #fff; border: none; fontSize: 18px; cursor: pointer; transition: background 0.2s; }
        .qty-picker button:hover:not(:disabled) { background: #f5f5f5; }
        .qty-picker span { width: 40px; textAlign: center; fontSize: 14px; fontWeight: 600; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }
        
        .cart-item-total-price { width: 120px; textAlign: right; fontSize: 18px; fontWeight: 800; color: var(--primary); }
        
        .remove-link-btn { background: none; border: none; padding: 0; color: var(--error); fontSize: 12px; fontWeight: 600; cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
        .remove-link-btn:hover { opacity: 1; text-decoration: underline; }
        .clear-all-btn { background: none; border: none; color: var(--text-muted); fontSize: 12px; fontWeight: 600; cursor: pointer; padding: 0; }
        .clear-all-btn:hover { color: var(--error); }

        .summary-card { padding: 32px; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .summary-title { fontSize: 20px; fontWeight: 800; marginBottom: 24px; borderBottom: 2px solid var(--primary); paddingBottom: 12px; display: inline-block; }
        .summary-rows { display: flex; flexDirection: column; gap: 16px; marginBottom: 24px; }
        .summary-row { display: flex; justifyContent: space-between; fontSize: 15px; }
        .summary-row span:first-child { color: var(--text-secondary); }
        .summary-row span:last-child { fontWeight: 700; }
        .shipping-hint { fontSize: 12px; background: #f0f7ff; color: #0070f3; padding: 12px; borderRadius: 8px; lineHeight: 1.5; }
        
        .summary-total { borderTop: 1px dashed var(--border); paddingTop: 20px; marginBottom: 24px; display: flex; justifyContent: space-between; alignItems: center; }
        .summary-total span:first-child { fontSize: 16px; fontWeight: 700; }
        .total-amount { fontSize: 24px; fontWeight: 900; color: var(--primary); }
        .checkout-btn { letter-spacing: 1px; }

        .desktop-only { display: block; }

        @media (max-width: 991px) {
          .cart-grid { gridTemplateColumns: 1fr; gap: 24px; }
          .summary-card { position: static; }
          .desktop-only { display: none; }
          .cart-item-details { flexDirection: column; alignItems: flex-start; gap: 12px; }
          .cart-item-total-price { textAlign: left; width: auto; }
          .qty-picker { margin: 0; }
        }

        @media (max-width: 640px) {
          .cart-title { fontSize: 22px; }
          .cart-item { padding: 16px; gap: 16px; }
          .cart-item-image { width: 80px; height: 110px; }
          .cart-item-title { fontSize: 15px; }
        }
      `}</style>
    </div>
  );
}
