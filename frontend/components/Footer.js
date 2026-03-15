import Link from 'next/link';

export default function Footer() {
  const categories = [
    { name: 'Văn học', slug: 'van-hoc' },
    { name: 'Kinh tế - Kinh doanh', slug: 'kinh-te-kinh-doanh' },
    { name: 'Công nghệ - IT', slug: 'cong-nghe-it' },
    { name: 'Tâm lý - Kỹ năng sống', slug: 'tam-ly-ky-nang-song' },
    { name: 'Thiếu nhi', slug: 'thieu-nhi' },
    { name: 'Ngoại ngữ', slug: 'ngoai-ngu' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">📚 Book<span>Store</span></div>
            <p className="footer-desc">
              Hệ thống nhà sách trực tuyến với hàng nghìn đầu sách chất lượng.
              Giao hàng toàn quốc. Cam kết giá tốt nhất.
            </p>
            <div className="footer-social" style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'inherit' }}>
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((s) => (
                <span key={s} style={{ fontSize: 14, opacity: 0.6, cursor: 'pointer', fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-heading">Danh Mục</div>
            <div className="footer-links">
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="footer-link">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-heading">Tài Khoản</div>
            <div className="footer-links">
              {[
                { label: 'Đăng ký', href: '/auth/register' },
                { label: 'Đăng nhập', href: '/auth/login' },
                { label: 'Tài khoản của tôi', href: '/account' },
                { label: 'Lịch sử đơn hàng', href: '/account/orders' },
                { label: 'Danh sách yêu thích', href: '/account/wishlist' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="footer-link">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-heading">Hỗ Trợ</div>
            <div className="footer-links">
              <span className="footer-link" style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Hotline: 1800 1234</span>
              <span className="footer-link" style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> support@bookstore.vn</span>
              <span className="footer-link" style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 08:00 - 22:00</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="footer-heading">Thanh Toán</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['💳 Thanh toán khi nhận hàng (COD)', '🏦 TT Chuyển Khoản (VNPay)', '📱 TT Momo'].map((p) => (
                  <span key={p} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 6, fontSize: 13 }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Thư Quán Books. All rights reserved. Made with 🖋️ in Vietnam</p>
        </div>
      </div>
    </footer>
  );
}
