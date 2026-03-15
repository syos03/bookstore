'use client';

import Link from 'next/link';
import { cartAPI, wishlistAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function BookCard({ book }) {
  const finalPrice = book.discount > 0
    ? Math.round(book.price * (1 - book.discount / 100))
    : book.price;

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';
  const rawThumbnail = book.thumbnail || book.coverImage || book.images?.[0]?.url || '';
  const thumbnail = rawThumbnail.replace('http://', 'https://');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await cartAPI.add(book._id, 1);
      toast.success('Đã thêm vào giỏ hàng thành công', { id: 'cart-toast' });
    } catch (err) {
      if (err.message?.includes('đăng nhập') || err.statusCode === 401) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng', { id: 'cart-err' });
      } else {
        toast.error(err.message || 'Có lỗi xảy ra', { id: 'cart-err' });
      }
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic mua ngay: Thêm vào giỏ hảng và chuyển hướng (sẽ update router sau nếu cần) hoặc gọi qua checkout
    try {
      await cartAPI.add(book._id, 1);
      window.location.href = '/cart'; // Redirect sang giỏ hàng/thanh toán ngay
    } catch (err) {
      if (err.message?.includes('đăng nhập') || err.statusCode === 401) {
        toast.error('Vui lòng đăng nhập để mua hàng');
      } else {
        toast.error('Có lỗi xảy ra khi mua hàng');
      }
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await wishlistAPI.toggle(book._id);
      toast.success(res.isWishlisted ? 'Đã thêm vào yêu thích ❤️' : 'Đã xóa khỏi yêu thích');
    } catch {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
    }
  };

  return (
    <Link href={`/books/${book.slug || book._id}`}>
      <div className="card book-card">
        <div className="book-image-wrap">
          <img
            src={thumbnail || 'https://placehold.co/280x400?text=No+Image'}
            alt={book.title}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/280x400?text=${encodeURIComponent(book.title || 'Sách')}`;
            }}
          />
          {book.discount > 0 && (
            <span className="book-discount-badge">-{book.discount}%</span>
          )}
          <button className="book-wishlist-btn" onClick={handleToggleWishlist} title="Yêu thích lưu trữ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>
        </div>
        <div className="book-info">
          <div className="book-title">{book.title}</div>
          <div className="book-author">{book.author}</div>
          {book.rating > 0 && (
            <div className="book-rating">
              <span className="stars" style={{ display: 'flex', gap: '2px', color: 'var(--accent)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(book.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ))}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({book.numReviews})</span>
            </div>
          )}
          <div className="card-footer-row">
            <div className="book-price">
              <span className="price-current">{formatPrice(finalPrice)}</span>
              {book.discount > 0 && (
                <span className="price-original">{formatPrice(book.price)}</span>
              )}
            </div>
          </div>
          {/* Overlay chứa 2 nút hành động (Trượt từ dưới lên) */}
          <div className="book-actions-overlay">
            <button className="btn-action-sm btn-action-cart" onClick={handleAddToCart} title="Thêm vào giỏ">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
               Giỏ
            </button>
            <button className="btn-action-sm btn-action-buy" onClick={handleBuyNow}>
               Mua Sách
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
