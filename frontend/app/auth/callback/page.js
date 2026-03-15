'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authAPI } from '@/services/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
       toast.error('Đăng nhập bị lỗi hoặc đã bị hủy.');
       router.push('/auth/login');
       return;
    }

    const token = searchParams.get('token');
    if (token) {
      // Lưu token vào Cookie và LocalStorage
      Cookies.set('token', token, { expires: 30 });
      localStorage.setItem('token', token);
      
      // Lấy thông tin User ngay
      authAPI.getProfile().then(res => {
         localStorage.setItem('user', JSON.stringify(res.data.user));
         toast.success(`Chào mừng ${res.data.user.name} 👋`);
         if (res.data.user.role === 'admin') router.push('/admin');
         else router.push('/');
      }).catch(() => {
         toast.error('Lỗi kết nối Server');
         router.push('/auth/login');
      });
    } else {
       router.push('/auth/login');
    }
  }, [searchParams, router]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto', marginBottom: 16 }}></div>
        <p>Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

export default function LoginCallback() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto', marginBottom: 16 }}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
