'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookAPI, categoryAPI } from '@/services/api';
import BookCard from '@/components/BookCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, bestRes, newRes, catRes] = await Promise.all([
          bookAPI.getFeatured(),
          bookAPI.getBestSelling(),
          bookAPI.getNewArrivals(),
          categoryAPI.getAll(),
        ]);
        setFeatured(featuredRes.data.books || []);
        setBestSelling(bestRes.data.books || []);
        setNewArrivals(newRes.data.books || []);
        setCategories(catRes.data.categories || []);
      } catch (e) {
        console.error('Lỗi tải trang chủ:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hàm mapping Category Icon từ Emoji gốc trong DB sang SVG cổ điển
  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'van-hoc':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>; // Sách
      case 'kinh-te-kinh-doanh':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>; // Cặp táp
      case 'thieu-nhi':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path></svg>; // Trẻ em (User)
      case 'tam-ly-ky-nang-song':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>; // Tâm lý (Trái tim cổ)
      case 'khoa-hoc-tu-nhien':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>; // Khoa học (Bình thí nghiệm)
      case 'lich-su-dia-ly':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="2" x2="12" y2="22"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>; // Địa lý (Quả địa cầu)
      case 'ngoai-ngu':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>; // Ngoại ngữ (Message)
      default:
        // Mặc định (Công nghệ / Kỹ thuật...)
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>;
    }
  };

  return (
    <div>
      {/* HERO BANNER */}
      <section className="hero-banner">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 60, alignItems: 'center' }}>
            <div className="hero-content animate-fade-up">
              <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8, color: 'var(--accent)'}}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
                Khám phá tri thức thư viện 2026
              </div>
              <h1 className="hero-title">
                Thế giới sách<br /><span>trong tầm tay bạn</span>
              </h1>
              <p className="hero-desc">
                Tuyển tập hơn 10.000+ đầu sách chọn lọc từ các nhà xuất bản uy tín nhất. Lan tỏa văn hóa đọc, nâng tầm tri thức Việt.
              </p>
              <div className="hero-actions">
                <Link href="/books" className="btn btn-primary btn-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  Mua Sắm Ngay
                </Link>
                <Link href="/books?sort=-soldCount" className="btn btn-outline-glass btn-lg">
                  Xem Sách Bán Chạy
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 40, marginTop: 48, borderTop: '1px solid var(--border-strong)', paddingTop: 32 }}>
                {[
                  { num: '10K+', label: 'Tựa sách hay' },
                  { num: '50K+', label: 'Độc giả tin tưởng' },
                  { num: '4.9/5', label: 'Đánh giá tích cực' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--secondary)', fontFamily: 'var(--font-heading)' }}>{stat.num}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* HÌNH ẢNH NỔI BẬT DẠNG DECOR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'radial-gradient(circle, var(--border-strong) 0%, transparent 60%)', zIndex: -1, filter: 'blur(40px)', opacity: 0.3 }}></div>
              {featured.slice(0, 4).map((book, i) => (
                <Link href={`/books/${book.slug || book._id}`} key={book._id}
                  style={{
                    transform: i % 2 === 1 ? 'translateY(32px)' : 'none',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                  <div className="glass-panel" style={{ padding: 12, borderRadius: 4, background: 'var(--bg-main)', border: '1px solid var(--border-strong)' }}>
                    <img
                      src={book.coverImage || book.images?.[0]?.url || 'https://placehold.co/200x300?text=No+Image'}
                      alt={book.title}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 2, boxShadow: 'var(--shadow)' }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* CATEGORIES */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Sách</h2>
          </div>
          <div className="category-grid">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat._id} href={`/categories/${cat.slug}`}>
                <div className="category-card">
                  <span className="category-icon" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span className="category-name">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED BOOKS */}
        {featured.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Tuần Này Có Gì Hot?
              </h2>
              <Link href="/books?isFeatured=true" className="section-link">Khám phá ngay <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg></Link>
            </div>
            <div className="grid-books">
              {featured.slice(0, 8).map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* BEST SELLING */}
        {bestSelling.length > 0 && (
          <section className="section" style={{ background: 'linear-gradient(135deg, #fff5f5, #fff)', borderRadius: 20, padding: '32px 24px', margin: '0 -24px 0' }}>
            <div className="section-header">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}><circle cx="12" cy="8" r="5"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                Top Bán Chạy Nhất
              </h2>
              <Link href="/books?sort=-soldCount" className="section-link">Xem ngay <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg></Link>
            </div>
            <div className="grid-books">
              {bestSelling.slice(0, 8).map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* NEW ARRIVALS */}
        {newArrivals.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
                Tri Thức Vừa Lên Kệ
              </h2>
              <Link href="/books?sort=-createdAt" className="section-link">Thêm vào giỏ <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg></Link>
            </div>
            <div className="grid-books">
              {newArrivals.slice(0, 8).map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* PROMOTION BANNER */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="glass-panel" style={{
            background: 'var(--secondary)',
            padding: '48px', color: 'var(--bg-card)', border: '4px double var(--border-strong)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32,
            boxShadow: 'var(--shadow-lg)', borderRadius: '4px'
          }}>
            <div>
              <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: 2, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16 }}>ĐIỂN TÍCH THƯ QUÁN</div>
              <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, fontFamily: 'var(--font-heading)' }}>Thưởng Lãm Sách Quý - Giao Tận Tay</h3>
              <p style={{ opacity: 0.8, fontSize: 16, maxWidth: 500, lineHeight: 1.6 }}>Miễn phí giao hàng toàn quốc cho thư khế từ 300.000đ. Đóng gói cẩn mật, giữ gìn từng trang giấy quý.</p>
            </div>
            <Link href="/books" className="btn btn-lg" style={{ background: 'var(--bg-main)', color: 'var(--primary)', fontWeight: 800, padding: '16px 36px', border: '1px solid var(--border-strong)' }}>
              Tham quan thư viện <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: 8}}><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
