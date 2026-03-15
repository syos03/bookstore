'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const method = searchParams.get('method');

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: 48, textAlign: 'center' }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          background: 'var(--success)', 
          color: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 40, 
          margin: '0 auto 24px',
          boxShadow: '0 10px 20px rgba(46, 204, 113, 0.2)'
        }}>
          ✓
        </div>
        
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Thanh toán thành công!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Cảm ơn bạn đã tin tưởng BookStore. <br/>
          Đơn hàng <strong>#{orderCode}</strong> của bạn đã được xác nhận thanh toán qua <strong>{method?.toUpperCase()}</strong> và đang được xử lý.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href={`/account/orders`} className="btn btn-primary btn-lg">
            Xem lịch sử đơn hàng
          </Link>
          <Link href="/books" className="btn btn-ghost">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="spinner"></div>}>
      <SuccessContent />
    </Suspense>
  );
}
