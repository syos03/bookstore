'use client';

import { useState, useCallback, useRef } from 'react';
import { bookAPI } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';
import { cartAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim() || value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await bookAPI.search(value, 6);
        setSearchResults(res.data.books || []);
        setShowDropdown(true);
      } catch {}
    }, 350);
  }, []);

  const formatPrice = (price) => price?.toLocaleString('vi-VN') + 'đ';

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <Link href="/" className="navbar-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8, display: 'inline-block', verticalAlign: 'middle'}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Book<span>Store</span>
          </Link>

          {/* Search */}
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Tìm kiếm tên sách, tác giả..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            />
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>

            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((book) => (
                  <Link
                    key={book._id}
                    href={`/books/${book.slug || book._id}`}
                    className="search-item"
                    onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                  >
                    <img
                      src={book.thumbnail || book.coverImage || 'https://placehold.co/40x60?text=S%C3%A1ch'}
                      alt={book.title}
                      style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 4 }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/40x60?text=S%C3%A1ch';
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{book.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{book.author}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                        {formatPrice(book.finalPrice || book.price)}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${searchQuery}`}
                  className="search-item"
                  style={{ justifyContent: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}
                  onClick={() => setShowDropdown(false)}
                >
                  Xem tất cả kết quả cho "{searchQuery}"
                </Link>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="nav-links" style={{ display: 'flex', gap: 4 }}>
            <Link href="/books" className="nav-link">Sách</Link>
            <Link href="/books?sort=-soldCount" className="nav-link">Bán Chạy</Link>
            <Link href="/books?sort=-createdAt" className="nav-link">Mới Nhất</Link>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <Link href="/cart" className="navbar-icon-btn" title="Giỏ hàng">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </Link>
            <Link href="/account/wishlist" className="navbar-icon-btn" title="Yêu thích">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </Link>
            <Link href="/account" className="navbar-icon-btn" title="Tài khoản">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M3 21v-2a7 7 0 0 1 14 0v2"></path></svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
