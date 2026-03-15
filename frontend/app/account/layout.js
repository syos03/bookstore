'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser(res.data.user);
      } catch (e) {
        if (e.statusCode === 401) router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Đã đăng xuất');
      router.push('/auth/login');
    } catch (e) {}
  };

  if (loading) return (
    <div className="container" style={{ padding: 80, textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
    </div>
  );

  if (!user) return null;

  const links = [
    { path: '/account', label: '👤 Thông tin tài khoản' },
    { path: '/account/orders', label: '📦 Quản lý đơn hàng' },
    { path: '/account/wishlist', label: '❤️ Sản phẩm yêu thích' },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>
        
        {/* Sidebar */}
        <div className="card" style={{ padding: '24px 16px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 24px', borderBottom: '1px solid var(--border)' }}>
            <img 
              src={user.avatar || 'https://placehold.co/48x48?text=Avatar'} 
              alt="" 
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/48x48?text=Avatar';
              }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thành viên</div>
            </div>
          </div>
          <div style={{ padding: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {links.map(link => (
              <Link key={link.path} href={link.path} style={{
                padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: pathname === link.path ? 'var(--primary)' : 'transparent',
                color: pathname === link.path ? '#fff' : 'var(--text-secondary)',
                transition: 'var(--transition)'
              }}>
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} style={{
              padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'var(--error)', background: 'transparent', textAlign: 'left', cursor: 'pointer',
              marginTop: 16, border: 'none'
            }}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
