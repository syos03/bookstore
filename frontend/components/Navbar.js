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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
          {/* Mobile Menu Toggle */}
          <button 
            className="navbar-mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>

          {/* Brand */}
          <Link href="/" className="navbar-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, display: 'inline-block', verticalAlign: 'middle'}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            <span className="brand-text" style={{ fontSize: 22 }}>Book<span>Store</span></span>
          </Link>

          {/* Nav Links & Search Container (Responsive) */}
          <div className={`navbar-mobile-wrapper ${isMobileMenuOpen ? 'active' : ''}`}>
            {/* Links - Desktop side-by-side with brand */}
            <div className="nav-links">
              <Link href="/books" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Sách</Link>
              <Link href="/books?sort=-soldCount" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Bán Chạy</Link>
              <Link href="/books?sort=-createdAt" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Mới</Link>
            </div>

            {/* Search */}
            <div className="navbar-search">
              <input
                type="text"
                placeholder="Tìm tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                style={{ padding: '8px 40px 8px 16px', fontSize: 13.5 }}
              />
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>

              {/* Search Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown" style={{ top: 'calc(100% + 8px)' }}>
                  {searchResults.map((book) => (
                    <Link
                      key={book._id}
                      href={`/books/${book.slug || book._id}`}
                      className="search-item"
                      onClick={() => { setShowDropdown(false); setSearchQuery(''); setIsMobileMenuOpen(false); }}
                    >
                      <img
                        src={book.thumbnail || book.coverImage || 'https://placehold.co/40x60?text=S%C3%A1ch'}
                        alt={book.title}
                        style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{book.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <Link href="/cart" className="navbar-icon-btn" title="Giỏ hàng">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </Link>
            <Link href="/account" className="navbar-icon-btn" title="Tài khoản">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M3 21v-2a7 7 0 0 1 14 0v2"></path></svg>
            </Link>
          </div>
        </div>

        <style jsx>{`
          .navbar-mobile-toggle {
            display: none;
            background: none;
            color: var(--text-primary);
            padding: 8px;
            margin-right: -8px;
          }

          @media (max-width: 991px) {
            .navbar-inner { justify-content: space-between; gap: 12px; }
            .navbar-mobile-toggle { display: block; order: 3; }
            .navbar-brand { order: 1; margin-right: auto; }
            .brand-text { font-size: 20px; }
            .navbar-actions { order: 2; margin-left: 0; gap: 4px; }
            
            .navbar-mobile-wrapper {
              position: fixed;
              top: 64px;
              left: 0;
              width: 100%;
              background: var(--bg-card);
              padding: 24px;
              flex-direction: column;
              gap: 24px;
              border-bottom: 2px solid var(--border-strong);
              transform: translateY(-120%);
              transition: var(--transition);
              z-index: 999;
              display: flex;
            }
            .navbar-mobile-wrapper.active { transform: translateY(0); }
            .navbar-search { max-width: none; width: 100%; margin: 0; }
            .nav-links { flex-direction: column; width: 100%; gap: 8px; }
            .nav-link { width: 100%; padding: 12px 20px; text-align: center; background: var(--bg-main); }
          }

          @media (max-width: 480px) {
            .brand-text { display: none; }
          }
        `}</style>
      </div>
    </nav>
  );
}
