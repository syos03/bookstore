'use client';

import { useState, useEffect } from 'react';
import { wishlistAPI } from '@/services/api';
import BookCard from '@/components/BookCard';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.get();
      setWishlist(res?.data?.wishlist?.books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card" style={{ padding: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Sản phẩm yêu thích</h2>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❤️</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Danh sách yêu thích trống</h3>
          <p style={{ marginBottom: 24 }}>Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.</p>
          <Link href="/books" className="btn btn-primary">Khám phá Sách</Link>
        </div>
      ) : (
        <div className="book-grid">
          {wishlist.map(book => (
            <BookCard 
              key={book._id} 
              book={book} 
              onWishlistChange={fetchWishlist} // Gọi lại khi gỡ khỏi wishlist
            />
          ))}
        </div>
      )}
    </div>
  );
}
