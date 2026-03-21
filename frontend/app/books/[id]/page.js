'use client';

import { useState, useEffect } from 'react';
import { bookAPI, cartAPI, wishlistAPI } from '@/services/api';
import BookCard from '@/components/BookCard';
import toast from 'react-hot-toast';

export default function BookDetailPage({ params }) {
  const [book, setBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookAPI.getOne(params.id);
        const b = res.data.book;
        setBook(b);
        setSelectedImage(b.coverImage || b.images?.[0]?.url || '');

        const recRes = await bookAPI.getRecommendations(b._id);
        setRecommendations(recRes.data.books || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div className="loading-spinner"></div>
    </div>
  );

  if (!book) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <p>Không tìm thấy sách</p>
    </div>
  );

  const finalPrice = book.discount > 0 ? Math.round(book.price * (1 - book.discount / 100)) : book.price;
  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';

  const handleAddToCart = async () => {
    try {
      await cartAPI.add(book._id, quantity);
      toast.success(`Đã thêm ${quantity} cuốn vào giỏ hàng! 🛒`);
    } catch (e) {
      toast.error(e.message || 'Vui lòng đăng nhập');
    }
  };

  const handleWishlist = async () => {
    try {
      const res = await wishlistAPI.toggle(book._id);
      toast.success(res.isWishlisted ? 'Đã thêm vào yêu thích ❤️' : 'Đã xóa khỏi yêu thích');
    } catch {
      toast.error('Vui lòng đăng nhập');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await bookAPI.addReview(book._id, reviewForm);
      toast.success('Đã gửi đánh giá thành công! 🌟');
      setReviewForm({ rating: 5, comment: '' });
      // Reload book data
      const res = await bookAPI.getOne(params.id);
      setBook(res.data.book);
    } catch (e) {
      toast.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* BOOK DETAIL */}
      <div className="book-detail-grid">
        {/* Images */}
        <div className="book-images-side">
          <div className="sticky-image-container">
            <div className="main-image-wrapper">
              <img 
                src={selectedImage || 'https://placehold.co/400x560?text=No+Image'} 
                alt={book.title}
                className="main-book-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/400x560?text=${encodeURIComponent(book.title || 'Sách')}`;
                }}
              />
            </div>
            {book.images?.length > 1 && (
              <div className="thumb-grid">
                {book.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(img.url)}
                    className={`thumb-item ${selectedImage === img.url ? 'active' : ''}`}>
                    <img 
                      src={img.url} 
                      alt="" 
                      className="thumb-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/64x80?text=${i+1}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="book-info-side">
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            {book.category?.name}
          </div>
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author-publisher">
            Tác giả: <strong>{book.author}</strong>
            {book.publisher && <> | NXB: <strong>{book.publisher}</strong></>}
          </p>

          {/* Rating */}
          <div className="book-rating-row">
            <span className="stars">{'★'.repeat(Math.round(book.rating))}{'☆'.repeat(5 - Math.round(book.rating))}</span>
            <span style={{ fontWeight: 700 }}>{book.rating}</span>
            <span className="rating-count">({book.numReviews} đánh giá)</span>
            <span className="sold-count">Đã bán: {book.soldCount?.toLocaleString()}</span>
          </div>

          {/* Price */}
          <div className="price-box">
            <div className="price-row">
              <span className="final-price">{formatPrice(finalPrice)}</span>
              {book.discount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="old-price">{formatPrice(book.price)}</span>
                  <span className="badge badge-primary">-{book.discount}%</span>
                </div>
              )}
            </div>
            <p className={`stock-status ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {book.stock > 0 ? `✓ Còn ${book.stock} cuốn trong kho` : '✗ Hết hàng'}
            </p>
          </div>

          {/* Book Meta Grid */}
          <div className="meta-grid">
            {[
              { label: 'Số trang', value: book.pages ? `${book.pages} trang` : '-' },
              { label: 'Năm XB', value: book.publishYear || '-' },
              { label: 'Ngôn ngữ', value: book.bookLanguage || 'Tiếng Việt' },
              { label: 'Thể loại', value: book.category?.name || '-' },
            ].map(item => (
              <div key={item.label} className="meta-item">
                <span className="meta-label">{item.label}: </span>
                <strong className="meta-value">{item.value}</strong>
              </div>
            ))}
          </div>

          {/* Quantity & Actions */}
          {book.stock > 0 && (
            <div className="book-actions-section">
              <div className="qty-row">
                <span style={{ fontSize: 14, fontWeight: 600 }}>Số lượng:</span>
                <div className="cart-qty-control">
                  <button className="cart-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span className="cart-qty-num">{quantity}</span>
                  <button className="cart-qty-btn" onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}>+</button>
                </div>
              </div>
              <div className="action-btns">
                <button className="btn btn-primary btn-lg add-to-cart-btn" onClick={handleAddToCart}>
                  🛒 Thêm vào giỏ hàng
                </button>
                <button className="btn btn-outline wishlist-btn" onClick={handleWishlist} title="Thêm vào yêu thích">
                  ❤️
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="info-box-features">
            {[
              { icon: '🚚', text: 'Miễn phí giao hàng cho đơn từ 300.000đ' },
              { icon: '🔄', text: 'Đổi trả trong 30 ngày nếu sách lỗi' },
              { icon: '✅', text: 'Cam kết sách chính hãng 100%' },
            ].map((item) => (
              <div key={item.text} className="info-feature-item">
                <span className="feature-icon">{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .book-detail-grid { display: grid; gridTemplateColumns: 1fr 1.5fr; gap: 48px; marginBottom: 48px; }
          .sticky-image-container { position: sticky; top: 80px; }
          .main-image-wrapper { aspectRatio: 3/4; background: var(--border-light); borderRadius: 16px; overflow: hidden; marginBottom: 16px; box-shadow: var(--shadow); }
          .main-book-img { width: 100%; height: 100%; objectFit: cover; }
          .thumb-grid { display: flex; gap: 8px; flexWrap: wrap; }
          .thumb-item { width: 64px; height: 80px; border: 2px solid var(--border); borderRadius: 8px; overflow: hidden; cursor: pointer; transition: var(--transition); }
          .thumb-item.active { border-color: var(--primary); }
          .thumb-img { width: 100%; height: 100%; objectFit: cover; }
          
          .book-title { fontSize: 26px; fontWeight: 800; lineHeight: 1.3; marginBottom: 8px; }
          .book-author-publisher { color: var(--text-secondary); marginBottom: 16px; }
          .book-rating-row { display: flex; alignItems: center; gap: 12px; marginBottom: 20px; flexWrap: wrap; }
          .rating-count, .sold-count { color: var(--text-muted); fontSize: 14px; }
          
          .price-box { background: var(--bg); borderRadius: 12px; padding: 20px; marginBottom: 24px; border: 1px solid var(--border-light); }
          .price-row { display: flex; alignItems: center; gap: 16px; marginBottom: 8px; flexWrap: wrap; }
          .final-price { fontSize: 32px; fontWeight: 900; color: var(--primary); }
          .old-price { fontSize: 18px; color: var(--text-muted); textDecoration: line-through; }
          .stock-status { fontSize: 13px; fontWeight: 600; }
          .stock-status.in-stock { color: var(--success); }
          .stock-status.out-of-stock { color: var(--error); }
          
          .meta-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 8px; marginBottom: 24px; fontSize: 14px; }
          .meta-item { background: var(--bg); padding: 8px 12px; borderRadius: 8px; border: 1px solid var(--border-light); }
          .meta-label { color: var(--text-muted); }
          
          .book-actions-section { marginBottom: 24px; }
          .qty-row { display: flex; alignItems: center; gap: 12px; marginBottom: 16px; }
          .action-btns { display: flex; gap: 12px; }
          .add-to-cart-btn { flex: 1; }
          
          .info-box-features { border: 1px solid var(--border); borderRadius: 12px; padding: 16px; fontSize: 13px; color: var(--text-secondary); }
          .info-feature-item { display: flex; alignItems: center; gap: 10px; padding: 6px 0; borderBottom: 1px solid var(--border-light); }
          .info-feature-item:last-child { borderBottom: none; }

          @media (max-width: 991px) {
            .book-detail-grid { gridTemplateColumns: 1fr; gap: 32px; }
            .sticky-image-container { position: static; }
            .main-image-wrapper { max-width: 400px; margin: 0 auto 16px; }
            .thumb-grid { justify-content: center; }
          }

          @media (max-width: 640px) {
            .container { paddingLeft: 16px; paddingRight: 16px; }
            .book-title { fontSize: 22px; }
            .final-price { fontSize: 28px; }
            .meta-grid { gridTemplateColumns: 1fr; }
            .action-btns { flexDirection: column; }
            .add-to-cart-btn { width: 100%; order: 1; }
            .wishlist-btn { width: 100%; order: 2; padding: 12px !important; }
          }
        `}</style>
      </div>

      {/* TABS */}
      <div className="card" style={{ padding: 0, marginBottom: 40 }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
          {[
            { key: 'description', label: '📖 Mô tả' },
            { key: 'reviews', label: `⭐ Đánh giá (${book.numReviews})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 24px', fontWeight: 600, fontSize: 14, border: 'none', background: 'transparent',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                marginBottom: -2, cursor: 'pointer', transition: 'var(--transition)',
              }}>{tab.label}</button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'description' && (
            <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {book.description || 'Chưa có mô tả cho sách này.'}
            </p>
          )}
          {activeTab === 'reviews' && (
            <div>
              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Viết đánh giá của bạn</h3>
                <div className="form-group">
                  <div className="form-label">Điểm đánh giá</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                        style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewForm.rating ? '#f39c12' : '#ddd' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <textarea className="form-control" placeholder="Chia sẻ cảm nhận của bạn..."
                    rows={3} value={reviewForm.comment}
                    onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? '⏳ Đang gửi...' : '📝 Gửi đánh giá'}
                </button>
              </form>

              {/* Reviews List */}
              {book.reviews?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Chưa có đánh giá nào</p>
              ) : (
                book.reviews?.map(review => (
                  <div key={review._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <img 
                        src={review.user?.avatar || 'https://placehold.co/400x400?text=Avatar'} 
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/40x40?text=Avatar';
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{review.user?.name || 'Ẩn danh'}</div>
                        <span className="stars" style={{ fontSize: 12 }}>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">📚 Sách Liên Quan</h2>
          </div>
          <div className="grid-books">
            {recommendations.slice(0, 6).map(book => <BookCard key={book._id} book={book} />)}
          </div>
        </section>
      )}
    </div>
  );
}
