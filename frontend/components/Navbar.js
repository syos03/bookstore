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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            className="mobile-menu-btn" 
            style={{ display: 'none' }}
            onClick={() => setIsMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          {/* Brand */}
          <Link href="/" className="navbar-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8, display: 'inline-block', verticalAlign: 'middle'}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Book<span>Store</span>
          </Link>

          {/* Desktop Search */}
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((book) => (
                  <Link key={book._id} href={`/books/${book.slug || book._id}`} className="search-item" onClick={() => { setShowDropdown(false); setSearchQuery(''); }}>
                    <img src={book.thumbnail || book.coverImage || 'https://placehold.co/40x60?text=S%C3%A1ch'} alt={book.title} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{book.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            <Link href="/books" className="nav-link">Sách</Link>
            <Link href="/books?sort=-soldCount" className="nav-link">Bán Chạy</Link>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <Link href="/cart" className="navbar-icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></Link>
            <Link href="/account" className="navbar-icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M3 21v-2a7 7 0 0 1 14 0v2"></path></svg></Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>MENU</div>
          <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/books" className="nav-link" onClick={() => setIsMenuOpen(false)}>📚 Tất Cả Sách</Link>
          <Link href="/books?sort=-soldCount" className="nav-link" onClick={() => setIsMenuOpen(false)}>🔥 Bán Chạy</Link>
          <Link href="/books?sort=-createdAt" className="nav-link" onClick={() => setIsMenuOpen(false)}>✨ Mới Nhất</Link>
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
          <Link href="/cart" className="nav-link" onClick={() => setIsMenuOpen(false)}>🛒 Giỏ Hàng</Link>
          <Link href="/account" className="nav-link" onClick={() => setIsMenuOpen(false)}>👤 Tài Khoản</Link>
        </div>
        
        {/* Mobile Search */}
        <div style={{ marginTop: 32 }}>
          <div className="navbar-search" style={{ display: 'block', maxWidth: '100%' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm sách..." 
              style={{ width: '100%' }}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
