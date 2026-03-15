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
    <div className="container account-container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="account-grid">
        
        {/* Sidebar */}
        <div className="card account-sidebar">
          <div className="account-user-header">
            <img 
              src={user.avatar || 'https://placehold.co/40x40?text=U'} 
              alt="" 
              className="account-avatar"
            />
            <div>
              <div className="account-user-name">{user.name}</div>
              <div className="account-user-role">Thành viên</div>
            </div>
          </div>
          <div className="account-nav">
            {links.map(link => (
              <Link key={link.path} href={link.path} className={`account-nav-link ${pathname === link.path ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="account-logout-btn">
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="account-content">
          {children}
        </div>
      </div>

      <style jsx>{`
        .account-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
        }
        .account-sidebar {
          padding: 16px 12px;
          height: fit-content;
        }
        .account-user-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .account-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-strong);
        }
        .account-user-name {
          font-weight: 700;
          font-size: 14.5px;
          color: var(--text-primary);
        }
        .account-user-role {
          font-size: 12px;
          color: var(--text-muted);
        }
        .account-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .account-nav-link {
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .account-nav-link:hover {
          background: var(--bg-main);
          color: var(--primary);
        }
        .account-nav-link.active {
          background: var(--primary);
          color: #fff;
        }
        .account-logout-btn {
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--primary);
          background: transparent;
          text-align: left;
          cursor: pointer;
          margin-top: 8px;
          border: none;
          opacity: 0.8;
          transition: var(--transition);
        }
        .account-logout-btn:hover {
          opacity: 1;
          background: rgba(239, 68, 68, 0.05);
        }

        @media (max-width: 768px) {
          .account-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .account-sidebar {
            padding: 12px;
          }
          .account-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
            gap: 8px;
          }
          .account-nav-link {
            white-space: nowrap;
            padding: 8px 16px;
            background: var(--bg-card);
            border: 1px solid var(--border);
          }
          .account-logout-btn {
            margin-top: 0;
            white-space: nowrap;
          }
          .account-user-header {
            margin-bottom: 8px;
            padding-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
}
