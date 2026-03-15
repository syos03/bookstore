'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Vui lòng nhập email và mật khẩu');
    
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data?.user?.role !== 'admin') {
        toast.error('Tài khoản không có quyền Admin!');
        return;
      }
      
      Cookies.set('token', res.token, { expires: 30 });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Đăng nhập thành công');
      router.push('/');
    } catch (err) {
      toast.error(err.message || 'Sai thông tin đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>BookStore Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Đăng nhập hệ thống quản trị</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Admin</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="admin@bookstore.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
