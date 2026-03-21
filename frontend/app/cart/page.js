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
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 className="cart-title">🛒 Giỏ Hàng</h1>

      {!cart || cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🛒</div>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Giỏ hàng trống</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>Hãy thêm sách vào giỏ hàng nhé!</p>
          <Link href="/books" className="btn btn-primary">📚 Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Cart Items */}
          <div className="card cart-items-card">
            <div className="cart-header">
              <span className="cart-count">{cart.itemCount} sản phẩm</span>
              <button onClick={() => cartAPI.clear().then(fetchCart)} className="cart-clear-btn">
                🗑️ Xóa tất cả
              </button>
            </div>

            <div className="cart-items-list">
              {cart.items.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={item.book.thumbnail || 'https://placehold.co/60x80?text=Sách'}
                    alt={item.book.title}
                    className="cart-item-img"
                  />
                  <div className="cart-item-body">
                    <Link href={`/books/${item.book.slug || item.book._id}`} className="cart-item-title">
                      {item.book.title}
                    </Link>
                    <div className="cart-item-author">{item.book.author}</div>
                    <div className="cart-item-footer">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => handleQuantityChange(item.book._id, item.quantity - 1)} disabled={!!updating || item.quantity <= 1}>−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleQuantityChange(item.book._id, item.quantity + 1)} disabled={!!updating || item.quantity >= item.book.stock}>+</button>
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-price">{formatPrice(item.itemTotal)}</span>
                        <button onClick={() => handleRemove(item.book._id)} className="remove-btn" title="Xóa">✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-sidebar">
            <div className="card summary-card">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span className="summary-val">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí giao hàng</span>
                  <span className={`summary-val ${shippingFee === 0 ? 'free' : ''}`}>
                    {shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>
              {shippingFee > 0 && (
                <div className="free-ship-hint">
                  💡 Mua thêm <b>{formatPrice(300000 - cart.subtotal)}</b> để miễn phí vận chuyển
                </div>
              )}
              <div className="summary-total">
                <span>Tổng cộng</span>
                <span className="total-price">{formatPrice(cart.subtotal + shippingFee)}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary btn-full checkout-go-btn">
                Tiến hành thanh toán →
              </Link>
              <Link href="/books" className="btn btn-ghost btn-full" style={{ marginTop: 8, fontSize: 13 }}>
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; }
        .cart-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        
        /* Items card */
        .cart-items-card { padding: 0; overflow: hidden; }
        .cart-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border); }
        .cart-count { font-size: 13px; font-weight: 600; color: var(--text-muted); }
        .cart-clear-btn { font-size: 12px; color: var(--error, #e74c3c); background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
        .cart-clear-btn:hover { background: rgba(231,76,60,0.08); }

        /* Item row */
        .cart-items-list { padding: 0 18px; }
        .cart-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border-light, #f0f0f0); }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-img { width: 60px; height: 80px; object-fit: cover; border-radius: 6px; flex-shrink: 0; border: 1px solid var(--border); }
        .cart-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .cart-item-title { font-size: 13px; font-weight: 600; color: var(--text-main); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cart-item-title:hover { color: var(--primary); }
        .cart-item-author { font-size: 12px; color: var(--text-muted); }
        .cart-item-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 6px; flex-wrap: wrap; gap: 8px; }

        /* Qty control */
        .qty-control { display: flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
        .qty-btn { width: 28px; height: 28px; background: var(--bg, #f8f9fa); border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text-main); transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
        .qty-btn:hover:not(:disabled) { background: var(--border); }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .qty-num { min-width: 30px; text-align: center; font-size: 13px; font-weight: 600; }

        .cart-item-right { display: flex; align-items: center; gap: 10px; }
        .cart-item-price { font-size: 14px; font-weight: 700; color: var(--primary); }
        .remove-btn { width: 24px; height: 24px; background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .remove-btn:hover { background: rgba(231,76,60,0.1); color: var(--error, #e74c3c); }

        /* Summary */
        .cart-sidebar { position: sticky; top: 80px; }
        .summary-card { padding: 18px; }
        .summary-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; }
        .summary-val { font-weight: 600; }
        .summary-val.free { color: var(--success, #27ae60); }
        .free-ship-hint { background: var(--bg, #f8f9fa); border-radius: 8px; padding: 8px 10px; font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
        .summary-total { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid var(--border); margin-bottom: 14px; font-size: 13px; font-weight: 600; }
        .total-price { font-size: 18px; font-weight: 900; color: var(--primary); }
        .checkout-go-btn { font-size: 14px; padding: 11px; }

        @media (max-width: 991px) {
          .cart-grid { grid-template-columns: 1fr; }
          .cart-sidebar { position: static; }
        }
        @media (max-width: 640px) {
          .cart-item-img { width: 50px; height: 66px; }
          .cart-item-title { font-size: 12px; }
          .cart-item-footer { gap: 6px; }
        }
      `}</style>
    </div>
  );
}
