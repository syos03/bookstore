'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      if (res.token) {
        Cookies.set('token', res.token, { expires: 30 });
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      toast.success('Đăng ký thành công! Chào mừng bạn! 🎉');
      router.push('/');
    } catch (e) {
      toast.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>Tạo tài khoản</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Đăng ký để bắt đầu mua sách!</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Họ và tên *', placeholder: 'Nguyễn Văn An', type: 'text' },
            { key: 'email', label: 'Email *', placeholder: 'example@email.com', type: 'email' },
            { key: 'phone', label: 'Số điện thoại', placeholder: '0912345678', type: 'tel' },
            { key: 'password', label: 'Mật khẩu *', placeholder: 'Ít nhất 6 ký tự', type: 'password' },
            { key: 'confirmPassword', label: 'Xác nhận mật khẩu *', placeholder: 'Nhập lại mật khẩu', type: 'password' },
          ].map(field => (
            <div className="form-group" key={field.key}>
              <label className="form-label">{field.label}</label>
              <input className="form-control" type={field.type} placeholder={field.placeholder}
                value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} />
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? '⏳ Đang đăng ký...' : '✅ Đăng Ký'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Đã có tài khoản?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
