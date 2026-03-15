'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentAPI } from '@/services/api';
import toast from 'react-hot-toast';

function SimulateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const amount = searchParams.get('amount');
  const orderCode = searchParams.get('orderCode');
  
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState('Đang chờ quét mã...');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSuccess();
          return 0;
        }
        if (prev === 2) setStatus('Đã nhận diện thông tin thanh toán...');
        if (prev === 1) setStatus('Đang xử lý giao dịch...');
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  const handleSuccess = async () => {
    try {
      const res = await paymentAPI.simulateSuccess(orderId);
      toast.success('Thanh toán thành công!');
      router.push(res.redirectUrl);
    } catch (err) {
      toast.error('Có lỗi xảy ra trong quá trình giả lập');
      router.push(`/payment/failed?orderCode=${orderCode}`);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: 450, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color: method === 'momo' ? '#A50064' : '#005BAA',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8
          }}>
            Thanh toán {method === 'momo' ? 'Momo' : 'VNPay'}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>#{orderCode}</h2>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)', marginTop: 8 }}>
            {Number(amount).toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div style={{ 
          background: '#fff', 
          padding: 24, 
          borderRadius: 16, 
          border: '1px solid var(--border)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          marginBottom: 32,
          position: 'relative'
        }}>
          {/* Mock QR Code */}
          <div style={{ width: '100%', aspectRatio: '1/1', background: '#f8f9fa', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BookStore_Payment_Simulate_${orderCode}`} 
               alt="Mock QR" 
               style={{ width: '100%', height: '100%', padding: 20 }}
             />
             <div style={{ 
               position: 'absolute', 
               top: 0, 
               left: 0, 
               width: '100%', 
               height: 4, 
               background: 'var(--primary)', 
               animation: 'scan 2s linear infinite' 
             }}></div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="spinner-small" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{status}</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Tự động hoàn tất sau {countdown} giây...</p>
        </div>

        <style jsx>{`
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
          .spinner-small {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(0,0,0,0.05);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="spinner"></div>}>
      <SimulateContent />
    </Suspense>
  );
}
