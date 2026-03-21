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
      <div className="steps-wrapper">
        <div className="steps-container">
          {[1, 2, 3].map((s) => {
            const labels = ['Thông tin giao hàng', 'Thanh toán', 'Xác nhận đơn hàng'];
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <div key={s} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? '✓' : s}
                </div>
                <span className="step-label">{labels[s-1]}</span>
                {s < 3 && <div className="step-connector"></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="checkout-grid">
        {/* Main Content */}
        <div className="checkout-content-area">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card checkout-section-card">
              <h2 className="section-title">📍 Địa chỉ giao hàng</h2>
              <div className="checkout-form-body">
                <div className="form-row">
                  <div className="input-group">
                    <label>Họ và tên người nhận</label>
                    <input type="text" placeholder="VD: Nguyễn Văn A" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label>Số điện thoại</label>
                    <input type="text" placeholder="VD: 0912345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                
                <div className="input-group full-width">
                  <label>Địa chỉ nhà (Số nhà, tên đường)</label>
                  <input type="text" placeholder="VD: 123 Đường ABC" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
                </div>

                <div className="form-row-3">
                  <div className="input-group">
                    <label>Phường/Xã</label>
                    <input type="text" placeholder="VD: Phường 1" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label>Quận/Huyện</label>
                    <input type="text" placeholder="VD: Quận 1" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label>Tỉnh/Thành phố</label>
                    <input type="text" placeholder="VD: TP. Hồ Chí Minh" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                </div>

                <div className="checkout-footer">
                  <button className="btn btn-primary btn-lg continue-btn" onClick={() => setStep(2)}>
                    TIẾP TỤC ĐẾN PHƯƠNG THỨC THANH TOÁN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card checkout-section-card">
              <h2 className="section-title">💳 Phương thức thanh toán</h2>
              <div className="payment-options">
                {PAYMENT_METHODS.map(method => (
                  <label key={method.value} className={`payment-option ${paymentMethod === method.value ? 'selected' : ''}`}>
                    <input type="radio" value={method.value} checked={paymentMethod === method.value} onChange={e => setPaymentMethod(e.target.value)} />
                    <div className="payment-info">
                      <div className="pm-label">{method.label}</div>
                      <div className="pm-desc">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="checkout-footer-split">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại địa chỉ</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>XÁC NHẬN ĐƠN HÀNG →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card checkout-section-card">
              <h2 className="section-title">✅ Kiểm tra lại đơn hàng</h2>
              
              <div className="info-summary-grid">
                <div className="info-block">
                  <h4 className="info-label">Giao đến:</h4>
                  <p className="info-text">
                    <b>{form.fullName}</b> | {form.phone}<br/>
                    {form.street}, {form.ward ? form.ward + ', ' : ''}{form.district}, {form.city}
                  </p>
                  <button className="edit-link" onClick={() => setStep(1)}>Thay đổi</button>
                </div>
                <div className="info-block">
                  <h4 className="info-label">Thanh toán bằng:</h4>
                  <p className="info-text">
                    {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
                  </p>
                  <button className="edit-link" onClick={() => setStep(2)}>Thay đổi</button>
                </div>
              </div>

              <div className="order-items-review">
                <h4 className="info-label" style={{ marginBottom: 16 }}>Sản phẩm trong đơn:</h4>
                {cart.items.map(item => (
                  <div key={item._id} className="review-item">
                    <img src={item.book.coverImage || item.book.thumbnail || ''} alt="" />
                    <div className="item-meta">
                      <div className="item-title">{item.book.title}</div>
                      <div className="item-qty">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="item-subtotal">{formatPrice(item.itemTotal)}</div>
                  </div>
                ))}
              </div>

              <div className="checkout-footer">
                <button className="btn btn-primary btn-lg finalize-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN VÀ ĐẶT HÀNG'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="checkout-sidebar">
          <div className="card order-summary-card">
            <h3 className="summary-title" style={{ fontSize: 18 }}>Đơn hàng của bạn</h3>
            
            <div className="summary-items-preview">
              {cart.items.map(item => (
                <div key={item._id} className="preview-row">
                  <span className="p-qty">{item.quantity}x</span>
                  <span className="p-name">{item.book.title}</span>
                  <span className="p-price">{formatPrice(item.itemTotal)}</span>
                </div>
              ))}
            </div>

            <div className="summary-pricing">
              <div className="price-row">
                <span>Tạm tính</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="price-row">
                <span>Phí vận chuyển</span>
                <span style={{ color: shippingFee === 0 ? 'var(--success)' : 'inherit' }}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="price-total">
                <span>Tổng tiền:</span>
                <span        .checkout-title { font-size: 28px; fontWeight: 800; marginBottom: 32px; letter-spacing: -0.5px; }
        
        /* Stepper */
        .steps-wrapper { maxWidth: 800px; margin: 0 auto 48px; }
        .steps-container { display: flex; alignItems: center; justifyContent: space-between; }
        .step-item { flex: 1; display: flex; flexDirection: column; alignItems: center; position: relative; }
        .step-circle { width: 40px; height: 40px; borderRadius: 50%; background: #fff; border: 2px solid var(--border); color: var(--text-muted); display: flex; alignItems: center; justifyContent: center; fontWeight: 700; fontSize: 16px; position: relative; zIndex: 1; transition: all 0.3s; }
        .step-label { marginTop: 12px; fontSize: 14px; color: var(--text-muted); fontWeight: 500; textAlign: center; }
        .step-connector { position: absolute; top: 20px; left: 50%; width: 100%; height: 2px; background: var(--border); zIndex: 0; }
        
        .step-item.active .step-circle { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1); }
        .step-item.active .step-label { color: var(--primary); fontWeight: 700; }
        .step-item.completed .step-circle { background: var(--primary); border-color: var(--primary); color: #fff; }
        .step-item.completed .step-label { color: var(--text-main); }
        .step-item.completed .step-connector { background: var(--primary); }

        .checkout-grid { display: grid; gridTemplateColumns: 1fr 380px; gap: 40px; alignItems: start; }
        .checkout-section-card { padding: 40px; }
        .section-title { fontSize: 20px; fontWeight: 800; marginBottom: 32px; borderBottom: 1px solid var(--border-light); paddingBottom: 16px; }
        
        /* Forms */
        .checkout-form-body { display: flex; flexDirection: column; gap: 24px; }
        .form-row { display: grid; gridTemplateColumns: 1fr 1fr; gap: 24px; }
        .form-row-3 { display: grid; gridTemplateColumns: 1fr 1fr 1fr; gap: 16px; }
        .input-group label { display: block; fontSize: 13px; fontWeight: 700; color: var(--text-secondary); marginBottom: 8px; textTransform: uppercase; }
        .input-group input { width: 100%; padding: 12px 16px; border: 1px solid var(--border); borderRadius: 8px; fontSize: 15px; transition: all 0.2s; }
        .input-group input:focus { border-color: var(--primary); box-shadow: 0 4px 12px rgba(67, 97, 238, 0.1); }
        
        /* Payment Options */
        .payment-options { display: flex; flexDirection: column; gap: 16px; }
        .payment-option { display: flex; alignItems: center; gap: 16px; padding: 20px; border: 2px solid var(--border); borderRadius: 12px; cursor: pointer; transition: all 0.2s; }
        .payment-option:hover { border-color: var(--primary-light); background: #f8fbff; }
        .payment-option.selected { border-color: var(--primary); background: #f0f7ff; }
        .pm-label { fontWeight: 700; fontSize: 16px; color: var(--text-main); }
        .pm-desc { fontSize: 13px; color: var(--text-muted); marginTop: 2px; }
        
        /* Info Summary (Step 3) */
        .info-summary-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 24px; marginBottom: 32px; padding: 24px; background: #f8fafc; borderRadius: 12px; border: 1px solid #e2e8f0; }
        .info-label { fontSize: 13px; fontWeight: 800; color: var(--text-secondary); textTransform: uppercase; marginBottom: 8px; }
        .info-text { fontSize: 15px; lineHeight: 1.6; color: var(--text-main); }
        .edit-link { marginTop: 8px; background: none; border: none; color: var(--primary); fontSize: 13px; fontWeight: 600; cursor: pointer; padding: 0; }
        .edit-link:hover { text-decoration: underline; }

        .review-item { display: flex; alignItems: center; gap: 20px; padding: 16px 0; borderBottom: 1px solid var(--border-light); }
        .review-item img { width: 60px; height: 80px; objectFit: cover; borderRadius: 4px; }
        .item-meta { flex: 1; }
        .item-title { fontWeight: 600; fontSize: 15px; }
        .item-qty { fontSize: 13px; color: var(--text-muted); marginTop: 4px; }
        .item-subtotal { fontWeight: 700; color: var(--text-main); }

        .checkout-footer { marginTop: 40px; display: flex; justifyContent: flex-end; }
        .checkout-footer-split { marginTop: 40px; display: flex; justifyContent: space-between; alignItems: center; }
        .finalize-btn, .continue-btn { letter-spacing: 0.5px; fontWeight: 800; padding: 16px 32px; }

        /* Sidebar Summary */
        .order-summary-card { padding: 32px; position: sticky; top: 100px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); }
        .summary-items-preview { max-height: 240px; overflow-y: auto; marginBottom: 24px; padding-right: 8px; }
        .preview-row { display: flex; gap: 12px; marginBottom: 12px; fontSize: 13px; alignItems: flex-start; }
        .p-qty { fontWeight: 700; color: var(--text-muted); min-width: 24px; }
        .p-name { flex: 1; fontWeight: 500; color: var(--text-main); white-space: nowrap; overflow: hidden; textOverflow: ellipsis; }
        .p-price { fontWeight: 600; }
        
        .summary-pricing { borderTop: 1px solid var(--border); paddingTop: 24px; }
        .price-row { display: flex; justifyContent: space-between; marginBottom: 12px; fontSize: 14px; }
        .price-total { borderTop: 1px dashed var(--border); marginTop: 12px; paddingTop: 16px; display: flex; justifyContent: space-between; alignItems: center; }
        .price-total span:first-child { fontSize: 16px; fontWeight: 800; }
        .grand-total { fontSize: 24px; fontWeight: 900; color: var(--primary); }
        .vat-hint { fontSize: 11px; color: var(--text-muted); textAlign: right; marginTop: 4px; }

        @media (max-width: 991px) {
          .checkout-grid { gridTemplateColumns: 1fr; }
          .checkout-sidebar { order: -1; }
          .order-summary-card { position: static; marginBottom: 24px; }
          .preview-row { display: none; }
          .summary-items-preview { display: none; }
        }

        @media (max-width: 640px) {
          .checkout-title { fontSize: 22px; }
          .checkout-section-card { padding: 24px; }
          .form-row, .form-row-3 { gridTemplateColumns: 1fr; gap: 16px; }
          .steps-wrapper { marginBottom: 24px; }
          .step-label { display: none; }
          .step-connector { left: 50%; }
        }
id-2, .form-grid-3 { gridTemplateColumns: 1fr; gap: 12px; }
          .checkout-actions { flexDirection: column; }
          .checkout-actions button { width: 100%; }
          .steps-container { marginHorizontal: -16px; paddingHorizontal: 16px; }
        }
      `}</style>
    </div>
  );
}
