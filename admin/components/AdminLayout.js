'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.data?.user?.role !== 'admin') {
          toast.error('Ban khong co quyen truy cap!');
          router.replace('/login');
          return;
        }
        setUser(res.data.user);
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname, router]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-sidebar)' }}>
      <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-light)' }}></div>
    </div>
  );

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch {}
  };

  const menuItems = [
    { path: '/', label: 'Tổng quan', icon: '📊' },
    { path: '/orders', label: 'Quản lý Đơn hàng', icon: '📦' },
    { path: '/books', label: 'Quản lý Sách', icon: '📚' },
    { path: '/categories', label: 'Quản lý Danh mục', icon: '🔖' },
    { path: '/users', label: 'Quản lý Người dùng', icon: '👥' },
    { path: '/reviews', label: 'Quản lý Đánh giá', icon: '⭐' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          Book<span>Store</span> Admin
        </div>
        <div className="nav-menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="nav-item" style={{ width: '100%', background: 'transparent' }} onClick={handleLogout}>
            <span style={{ fontSize: 18 }}>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src={user?.avatar || 'https://placehold.co/40x40?text=Admin'} 
              alt="Avatar" 
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/40x40?text=Admin';
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Admin</div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
