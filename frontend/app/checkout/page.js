'use client';

import { useState, useEffect } from 'react';
import { cartAPI, orderAPI, userAPI, paymentAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const PAYMENT_METHODS = [
  { value: 'cod', label: '💵 Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { value: 'vnpay', label: '🏦 VNPay', desc: 'Thanh toán qua ví điện tử hoặc thẻ ngân hàng' },
  { value: 'momo', label: '📱 Momo', desc: 'Thanh toán qua ví Momo' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', street: '', ward: '', district: '', city: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([cartAPI.get(), userAPI.getAddresses()]);
        setCart(cartRes.data.cart);
        const addrs = addrRes.data.addresses || [];
        setAddresses(addrs);
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
        if (defaultAddr) {
          setForm({ fullName: defaultAddr.fullName, phone: defaultAddr.phone, street: defaultAddr.street, ward: defaultAddr.ward || '', district: defaultAddr.district, city: defaultAddr.city });
        }
      } catch (e) {
        if (e.statusCode === 401) router.push('/auth/login');
      }
    };
    init();
  }, []);

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.street || !form.district || !form.city) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }
    setSubmitting(true);
    try {
      const orderRes = await orderAPI.create({ shippingAddress: form, paymentMethod });
      const order = orderRes.data.order;

      if (paymentMethod === 'vnpay') {
        const payRes = await paymentAPI.createVNPay(order._id);
        window.location.href = payRes.data.paymentUrl;
        return;
      }
      if (paymentMethod === 'momo') {
        const payRes = await paymentAPI.createMomo(order._id);
        window.location.href = payRes.data.paymentUrl;
        return;
      }

      toast.success('Đặt hàng thành công! 🎉');
      router.push(`/account/orders/${order._id}`);
    } catch (e) {
      toast.error(e.message || 'Có lỗi khi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';
  const shippingFee = cart?.subtotal >= 300000 ? 0 : 30000;

  if (!cart) return null;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="checkout-title">💳 Thanh Toán</h1>

      {/* Steps */}
      <div className="steps-container">
        {[1, 2, 3].map((s) => {
          const labels = ['Địa chỉ', 'Thanh toán', 'Xác nhận'];
          const isActive = step >= s;
          return (
            <div key={s} className={`step-item ${isActive ? 'active' : ''}`}>
              <div className="step-circle">
                {step > s ? '✓' : s}
              </div>
              <span className="step-label">{labels[s-1]}</span>
              {s < 3 && <div className={`step-line ${step > s ? 'active' : ''}`}></div>}
            </div>
          );
        })}
      </div>

      <div className="checkout-grid">
        {/* Main */}
        <div className="checkout-main">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card checkout-card">
              <h2 className="step-title">📍 Địa chỉ giao hàng</h2>
              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Họ và tên *</label>
                  <input className="form-control" placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Số điện thoại *</label>
                  <input className="form-control" placeholder="0912345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Địa chỉ *</label>
                <input className="form-control" placeholder="Số nhà, tên đường" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
              </div>
              <div className="form-grid-3">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phường/Xã</label>
                  <input className="form-control" placeholder="Phường Bến Nghé" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quận/Huyện *</label>
                  <input className="form-control" placeholder="Quận 1" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tỉnh/Thành phố *</label>
                  <input className="form-control" placeholder="TP. Hồ Chí Minh" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary btn-lg checkout-btn" onClick={() => setStep(2)}>
                Tiếp theo: Chọn thanh toán →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card checkout-card">
              <h2 className="step-title">💳 Phương thức thanh toán</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PAYMENT_METHODS.map(method => (
                  <label key={method.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: `2px solid ${paymentMethod === method.value ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', transition: 'var(--transition)', background: paymentMethod === method.value ? 'rgba(231,76,60,0.04)' : 'white' }}>
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={e => setPaymentMethod(e.target.value)} style={{ marginTop: 2, accentColor: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{method.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="checkout-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Xem lại đơn hàng →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card checkout-card">
              <h2 className="step-title">✅ Xác nhận đơn hàng</h2>

              <div className="checkout-info-block">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>📍 Địa chỉ giao hàng:</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {form.fullName} | {form.phone}<br/>
                  {form.street}, {form.ward && form.ward + ', '}{form.district}, {form.city}
                </p>
              </div>

              <div className="checkout-info-block">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>💳 Phương thức thanh toán:</div>
                <p style={{ fontSize: 14 }}>{PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>📦 Sản phẩm:</div>
                {cart.items.map(item => (
                  <div key={item._id} className="checkout-item-row">
                    <img src={item.book.thumbnail || ''} alt="" className="checkout-item-img" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{item.book.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>x{item.quantity}</div>
                    </div>
                    <div className="checkout-item-total">{formatPrice(item.itemTotal)}</div>
                  </div>
                ))}
              </div>

              <div className="checkout-actions">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '⏳ Đang xử lý...' : '🎉 Đặt Hàng Ngay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Side */}
        <div className="checkout-side">
          <div className="card summary-card">
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Tóm tắt đơn hàng</h3>
            <div className="summary-items-list">
              {cart.items.slice(0, 3).map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 13 }}>
                  <img src={item.book.thumbnail || ''} alt="" className="summary-item-img" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{item.book.title}</div>
                    <div style={{ color: 'var(--text-muted)' }}>x{item.quantity} | {formatPrice(item.itemTotal)}</div>
                  </div>
                </div>
              ))}
              {cart.items.length > 3 && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>+{cart.items.length - 3} sản phẩm khác</div>}
            </div>
            
            <div className="summary-totals">
              {[
                ['Tạm tính:', formatPrice(cart.subtotal)],
                ['Phí vận chuyển:', shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(shippingFee)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: value === 'MIỄN PHÍ' ? 'var(--success)' : 'inherit' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="summary-final">
              <span style={{ fontWeight: 800, fontSize: 16 }}>Tổng:</span>
              <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(cart.subtotal + shippingFee)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-title { font-size: 24px; fontWeight: 800; marginBottom: 28px; }
        .steps-container { display: flex; gap: 0; marginBottom: 36px; overflow-x: auto; padding-bottom: 8px; }
        .step-item { flex: 1; display: flex; alignItems: center; min-width: 120px; }
        .step-circle { width: 28px; height: 28px; borderRadius: 50%; background: var(--border); color: var(--text-muted); display: flex; alignItems: center; justifyContent: center; fontWeight: 700; fontSize: 13px; flexShrink: 0; }
        .step-item.active .step-circle { background: var(--primary); color: white; }
        .step-label { fontSize: 13px; fontWeight: 400; color: var(--text-muted); marginLeft: 8px; white-space: nowrap; }
        .step-item.active .step-label { fontWeight: 600; color: var(--text-primary); }
        .step-line { flex: 1; height: 2px; background: var(--border); marginLeft: 12px; margin-right: 12px; }
        .step-line.active { background: var(--primary); }
        
        .checkout-grid { display: grid; gridTemplateColumns: 1fr 360px; gap: 28px; }
        .checkout-card { padding: 28px; }
        .step-title { fontSize: 18px; fontWeight: 700; marginBottom: 20px; }
        .form-grid-2 { display: grid; gridTemplateColumns: 1fr 1fr; gap: 16px; }
        .form-grid-3 { display: grid; gridTemplateColumns: 1fr 1fr 1fr; gap: 16px; marginTop: 16px; }
        .checkout-btn { marginTop: 24px; }
        .checkout-actions { display: flex; gap: 12px; marginTop: 24px; }
        .checkout-info-block { background: var(--bg); borderRadius: 12px; padding: 16px; marginBottom: 20px; }
        .checkout-item-row { display: flex; alignItems: center; gap: 12px; padding: 8px 0; borderBottom: 1px solid var(--border-light); }
        .checkout-item-img { width: 48px; height: 64px; objectFit: cover; borderRadius: 6px; }
        .checkout-item-total { fontWeight: 700; color: var(--primary); }
        
        .summary-card { padding: 24px; position: sticky; top: 80px; }
        .summary-item-img { width: 40px; height: 52px; objectFit: cover; borderRadius: 6px; }
        .summary-totals { borderTop: 1px solid var(--border); paddingTop: 14px; display: flex; flexDirection: column; gap: 10px; fontSize: 14px; }
        .summary-final { borderTop: 2px solid var(--border); marginTop: 12px; paddingTop: 12px; display: flex; justifyContent: space-between; }

        @media (max-width: 991px) {
          .checkout-grid { gridTemplateColumns: 1fr; }
          .checkout-side { order: -1; }
          .summary-card { position: static; marginBottom: 12px; }
          .summary-items-list { display: none; }
        }

        @media (max-width: 640px) {
          .container { paddingLeft: 16px; paddingRight: 16px; }
          .checkout-title { fontSize: 20px; }
          .checkout-card { padding: 20px; }
          .form-grid-2, .form-grid-3 { gridTemplateColumns: 1fr; gap: 12px; }
          .checkout-actions { flexDirection: column; }
          .checkout-actions button { width: 100%; }
          .steps-container { marginHorizontal: -16px; paddingHorizontal: 16px; }
        }
      `}</style>
    </div>
  );
}
