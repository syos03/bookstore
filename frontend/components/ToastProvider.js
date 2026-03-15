'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#1a1a2e',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: { primary: '#27ae60', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#e74c3c', secondary: '#fff' },
        },
      }}
    />
  );
}
