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
      <div className="layout-with-sidebar" style={{ gap: 48, marginBottom: 48 }}>
        {/* Images */}
        <div>
          <div>
            <div style={{ aspectRatio: '3/4', background: 'var(--border-light)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
              <img 
                src={selectedImage || 'https://placehold.co/400x560?text=No+Image'} 
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/400x560?text=${encodeURIComponent(book.title || 'Sách')}`;
                }}
              />
            </div>
            {book.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {book.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(img.url)}
                    style={{ width: 64, height: 80, border: `2px solid ${selectedImage === img.url ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
                    <img 
                      src={img.url} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
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
        <div style={{ textAlign: 'inherit' }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            {book.category?.name}
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>{book.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Tác giả: <strong>{book.author}</strong>
            {book.publisher && <> | NXB: <strong>{book.publisher}</strong></>}
          </p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="stars">{'★'.repeat(Math.round(book.rating))}{'☆'.repeat(5 - Math.round(book.rating))}</span>
            <span style={{ fontWeight: 700 }}>{book.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>({book.numReviews} đánh giá)</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Đã bán: {book.soldCount?.toLocaleString()}</span>
          </div>

          {/* Price */}
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 900, color: 'var(--primary)' }}>{formatPrice(finalPrice)}</span>
              {book.discount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(book.price)}</span>
                  <span className="badge badge-primary">-{book.discount}%</span>
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
              {book.stock > 0 ? `✓ Còn ${book.stock} cuốn trong kho` : '✗ Hết hàng'}
            </p>
          </div>

          {/* Book Meta */}
          <div className="grid-2-col" style={{ marginBottom: 24, fontSize: 14 }}>
            {[
              { label: 'Số trang', value: book.pages ? `${book.pages} trang` : '-' },
              { label: 'Năm XB', value: book.publishYear || '-' },
              { label: 'Ngôn ngữ', value: book.language || 'Tiếng Việt' },
              { label: 'Thể loại', value: book.category?.name || '-' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}: </span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          {/* Quantity & Actions */}
          {book.stock > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Số lượng:</span>
                <div className="cart-qty-control">
                  <button className="cart-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span className="cart-qty-num">{quantity}</span>
                  <button className="cart-qty-btn" onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
                  🛒 Thêm vào giỏ hàng
                </button>
                <button className="btn btn-outline" style={{ padding: '14px 20px' }} onClick={handleWishlist} title="Thêm vào yêu thích">
                  ❤️
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
            {[
              { icon: '🚚', text: 'Miễn phí giao hàng cho đơn từ 300.000đ' },
              { icon: '🔄', text: 'Đổi trả trong 30 ngày nếu sách lỗi' },
              { icon: '✅', text: 'Cam kết sách chính hãng 100%' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>
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
                        src={review.user?.avatar || 'https://placehold.co/40x40?text=Avatar'} 
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
