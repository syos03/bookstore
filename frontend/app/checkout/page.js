'use client';

import { useState, useEffect } from 'react';
import { cartAPI, orderAPI, userAPI, paymentAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const PAYMENT_METHODS = [
  { value: 'cod', label: '💵 Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi giao hàng' },
  { value: 'vnpay', label: '🏦 VNPay', desc: 'Thẻ ngân hàng / Ví điện tử' },
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
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 className="co-title">💳 Thanh Toán</h1>

      {/* Progress Steps */}
      <div className="co-steps">
        {[1, 2, 3].map((s) => {
          const labels = ['Địa chỉ', 'Thanh toán', 'Xác nhận'];
          const isActive = step >= s;
          return (
            <div key={s} className={`co-step ${isActive ? 'active' : ''}`}>
              <div className="co-circle">{step > s ? '✓' : s}</div>
              <span className="co-label">{labels[s - 1]}</span>
              {s < 3 && <div className={`co-line ${step > s ? 'active' : ''}`}></div>}
            </div>
          );
        })}
      </div>

      <div className="co-grid">
        {/* Main Panel */}
        <div className="co-main">

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card co-card">
              <h2 className="co-step-title">📍 Địa chỉ giao hàng</h2>
              <div className="fg-2">
                <div className="form-group-sm">
                  <label className="fl">Họ và tên *</label>
                  <input className="fc-sm" placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="form-group-sm">
                  <label className="fl">Số điện thoại *</label>
                  <input className="fc-sm" placeholder="0912345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-group-sm" style={{ marginTop: 12 }}>
                <label className="fl">Địa chỉ *</label>
                <input className="fc-sm" placeholder="Số nhà, tên đường" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
              </div>
              <div className="fg-3" style={{ marginTop: 12 }}>
                <div className="form-group-sm">
                  <label className="fl">Phường/Xã</label>
                  <input className="fc-sm" placeholder="Phường Bến Nghé" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} />
                </div>
                <div className="form-group-sm">
                  <label className="fl">Quận/Huyện *</label>
                  <input className="fc-sm" placeholder="Quận 1" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                </div>
                <div className="form-group-sm">
                  <label className="fl">Tỉnh/TP *</label>
                  <input className="fc-sm" placeholder="TP. Hồ Chí Minh" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary next-btn" onClick={() => setStep(2)}>
                  Tiếp theo: Chọn thanh toán →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card co-card">
              <h2 className="co-step-title">💳 Phương thức thanh toán</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_METHODS.map(method => (
                  <label key={method.value} className={`pay-option ${paymentMethod === method.value ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={e => setPaymentMethod(e.target.value)} />
                    <div>
                      <div className="pay-label">{method.label}</div>
                      <div className="pay-desc">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="co-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn btn-primary next-btn" onClick={() => setStep(3)}>Xem lại đơn hàng →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card co-card">
              <h2 className="co-step-title">✅ Xác nhận đơn hàng</h2>

              <div className="info-block">
                <div className="info-label">📍 Địa chỉ giao hàng</div>
                <div className="info-val">
                  <b>{form.fullName}</b> | {form.phone}<br />
                  {form.street}{form.ward && ', ' + form.ward}, {form.district}, {form.city}
                </div>
              </div>

              <div className="info-block">
                <div className="info-label">💳 Phương thức thanh toán</div>
                <div className="info-val">{PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="info-label" style={{ marginBottom: 10 }}>📦 Sản phẩm</div>
                {cart.items.map(item => (
                  <div key={item._id} className="confirm-item">
                    <img src={item.book.thumbnail || ''} alt="" className="confirm-img" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="confirm-name">{item.book.title}</div>
                      <div className="confirm-qty">x{item.quantity}</div>
                    </div>
                    <div className="confirm-price">{formatPrice(item.itemTotal)}</div>
                  </div>
                ))}
              </div>

              <div className="co-actions">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
                <button className="btn btn-primary next-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '⏳ Đang xử lý...' : '🎉 Đặt Hàng Ngay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Summary */}
        <div className="co-side">
          <div className="card co-summary">
            <h3 className="summary-hd">Tóm tắt đơn hàng</h3>
            <div className="sum-items">
              {cart.items.slice(0, 3).map(item => (
                <div key={item._id} className="sum-item">
                  <img src={item.book.thumbnail || ''} alt="" className="sum-img" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sum-name">{item.book.title}</div>
                    <div className="sum-sub">x{item.quantity} · {formatPrice(item.itemTotal)}</div>
                  </div>
                </div>
              ))}
              {cart.items.length > 3 && <div className="sum-more">+{cart.items.length - 3} sản phẩm khác</div>}
            </div>
            <div className="sum-rows">
              <div className="sum-row"><span>Tạm tính</span><span>{formatPrice(cart.subtotal)}</span></div>
              <div className="sum-row">
                <span>Phí vận chuyển</span>
                <span style={{ color: shippingFee === 0 ? 'var(--success, #27ae60)' : 'inherit', fontWeight: 600 }}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
            </div>
            <div className="sum-total">
              <span>Tổng</span>
              <span className="sum-total-price">{formatPrice(cart.subtotal + shippingFee)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .co-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; }

        /* Steps */
        .co-steps { display: flex; align-items: center; margin-bottom: 24px; padding-bottom: 4px; overflow-x: auto; }
        .co-step { display: flex; align-items: center; flex-shrink: 0; }
        .co-circle { width: 26px; height: 26px; border-radius: 50%; background: var(--border, #e9ecef); color: var(--text-muted, #aaa); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }
        .co-step.active .co-circle { background: var(--primary); color: #fff; }
        .co-label { font-size: 12px; margin-left: 6px; color: var(--text-muted); white-space: nowrap; }
        .co-step.active .co-label { font-weight: 600; color: var(--text-main); }
        .co-line { height: 2px; width: 48px; background: var(--border, #e9ecef); margin: 0 10px; flex-shrink: 0; }
        .co-line.active { background: var(--primary); }

        /* Grid */
        .co-grid { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
        .co-card { padding: 20px; }
        .co-step-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }

        /* Forms */
        .fg-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .fg-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .form-group-sm { display: flex; flex-direction: column; gap: 4px; }
        .fl { font-size: 12px; font-weight: 600; color: var(--text-main); }
        .fc-sm { width: 100%; padding: 8px 11px; border: 1px solid var(--border, #e9ecef); border-radius: 6px; font-size: 13px; transition: border-color 0.2s; }
        .fc-sm:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 180,50,50), 0.08); }
        .next-btn { padding: 10px 20px; font-size: 14px; }

        /* Payment options */
        .pay-option { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1.5px solid var(--border, #e9ecef); border-radius: 10px; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .pay-option.selected { border-color: var(--primary); background: rgba(var(--primary-rgb, 180,50,50), 0.04); }
        .pay-option input { margin-top: 2px; accent-color: var(--primary); }
        .pay-label { font-size: 13px; font-weight: 700; }
        .pay-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        /* Actions */
        .co-actions { display: flex; gap: 10px; margin-top: 20px; }

        /* Info blocks */
        .info-block { background: var(--bg, #f8f9fa); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; }
        .info-label { font-size: 12px; font-weight: 700; color: var(--text-main); margin-bottom: 5px; }
        .info-val { font-size: 13px; color: var(--text-secondary, #666); line-height: 1.6; }

        /* Confirm items */
        .confirm-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-light, #f0f0f0); }
        .confirm-item:last-child { border-bottom: none; }
        .confirm-img { width: 42px; height: 56px; object-fit: cover; border-radius: 5px; flex-shrink: 0; }
        .confirm-name { font-size: 12px; font-weight: 600; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .confirm-qty { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .confirm-price { font-size: 13px; font-weight: 700; color: var(--primary); flex-shrink: 0; }

        /* Side summary */
        .co-side { position: sticky; top: 80px; }
        .co-summary { padding: 16px; }
        .summary-hd { font-size: 13px; font-weight: 700; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .sum-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .sum-item { display: flex; gap: 8px; align-items: flex-start; }
        .sum-img { width: 36px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
        .sum-name { font-size: 12px; font-weight: 600; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sum-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .sum-more { font-size: 11.5px; color: var(--text-muted); }
        .sum-rows { border-top: 1px solid var(--border); padding-top: 10px; display: flex; flex-direction: column; gap: 8px; }
        .sum-row { display: flex; justify-content: space-between; font-size: 12.5px; }
        .sum-total { border-top: 2px solid var(--border); margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
        .sum-total-price { font-size: 17px; font-weight: 900; color: var(--primary); }

        @media (max-width: 991px) {
          .co-grid { grid-template-columns: 1fr; }
          .co-side { position: static; order: -1; }
          .sum-items { display: none; }
        }
        @media (max-width: 640px) {
          .fg-2, .fg-3 { grid-template-columns: 1fr; }
          .co-actions { flex-direction: column; }
          .co-actions button { width: 100%; }
          .co-card { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
