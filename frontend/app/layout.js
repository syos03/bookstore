import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata = {
  title: { default: 'BookStore - Nhà Sách Trực Tuyến', template: '%s | BookStore' },
  description: 'Mua sách trực tuyến với hàng nghìn đầu sách chất lượng. Giao hàng nhanh. Giá tốt nhất.',
  keywords: ['mua sách', 'sách online', 'nhà sách', 'bookstore', 'sách hay'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://bookstore.vn',
    siteName: 'BookStore',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ToastProvider />
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 64px - 200px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
