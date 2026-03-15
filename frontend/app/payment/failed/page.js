'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: 48, textAlign: 'center' }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          background: 'var(--error)', 
          color: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 40, 
          margin: '0 auto 24px',
          boxShadow: '0 10px 20px rgba(231, 76, 60, 0.2)'
        }}>
          ✕
        </div>
        
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Thanh toán thất bại</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán đơn hàng <strong>#{orderCode}</strong>. <br/>
          Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href={`/account/orders`} className="btn btn-primary btn-lg">
            Thử lại
          </Link>
          <Link href="/" className="btn btn-ghost">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={<div className="spinner"></div>}>
      <FailedContent />
    </Suspense>
  );
}
