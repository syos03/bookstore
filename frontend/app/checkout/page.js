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
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28 }}>💳 Thanh Toán</h1>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 36 }}>
        {[1, 2, 3].map((s) => {
          const labels = ['Địa chỉ', 'Thanh toán', 'Xác nhận'];
          const isActive = step >= s;
          return (
            <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--border)', color: isActive ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{labels[s-1]}</span>
                {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--primary)' : 'var(--border)', marginLeft: 8 }}></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="layout-with-sidebar" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Main */}
        <div>
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📍 Địa chỉ giao hàng</h2>
              <div className="grid-2-col">
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
              <div className="grid-3-col">
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
              <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }} onClick={() => setStep(2)}>
                Tiếp theo: Chọn thanh toán →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>💳 Phương thức thanh toán</h2>
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
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Xem lại đơn hàng →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>✅ Xác nhận đơn hàng</h2>

              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>📍 Địa chỉ giao hàng:</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {form.fullName} | {form.phone}<br/>
                  {form.street}, {form.ward && form.ward + ', '}{form.district}, {form.city}
                </p>
              </div>

              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>💳 Phương thức thanh toán:</div>
                <p style={{ fontSize: 14 }}>{PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>📦 Sản phẩm:</div>
                {cart.items.map(item => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <img src={item.book.thumbnail || ''} alt="" style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.book.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>x{item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(item.itemTotal)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '⏳ Đang xử lý...' : '🎉 Đặt Hàng Ngay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 80 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Đơn hàng</h3>
          {cart.items.slice(0, 3).map(item => (
            <div key={item._id} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 13 }}>
              <img src={item.book.thumbnail || ''} alt="" style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{item.book.title}</div>
                <div style={{ color: 'var(--text-muted)' }}>x{item.quantity} | {formatPrice(item.itemTotal)}</div>
              </div>
            </div>
          ))}
          {cart.items.length > 3 && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>+{cart.items.length - 3} sản phẩm khác</div>}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
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
          <div style={{ borderTop: '2px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Tổng:</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(cart.subtotal + shippingFee)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
