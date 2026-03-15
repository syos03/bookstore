'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { bookAPI, categoryAPI } from '@/services/api';
import BookCard from '@/components/BookCard';

function BooksContent() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') || '-createdAt',
    category: searchParams.get('category') || '',
    'price[gte]': '',
    'price[lte]': '',
  });

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories || []));
  }, []);

  // ✅ Sync filters khi URL thay đổi (click Sách / Bán Chạy / Mới Nhất trên navbar)
  useEffect(() => {
    const sortFromUrl = searchParams.get('sort') || '-createdAt';
    const categoryFromUrl = searchParams.get('category') || '';
    setFilters(prev => ({
      ...prev,
      sort: sortFromUrl,
      category: categoryFromUrl,
    }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchBooks();
  }, [page, filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 16, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await bookAPI.getAll(params);
      
      // Backend returns: { success, total, page, limit, totalPages, data: { books: [] } }
      // Axios interceptor unwraps response.data.
      // So 'res' is the exact backend JSON.
      setBooks(res.data?.books || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Mới nhất' },
    { value: '-soldCount', label: 'Bán chạy nhất' },
    { value: 'price', label: 'Giá tăng dần' },
    { value: '-price', label: 'Giá giảm dần' },
    { value: '-rating', label: 'Đánh giá cao nhất' },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28 }}>
        {/* Sidebar Filters */}
        <aside>
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Bộ Lọc
            </h3>

            <div style={{ marginBottom: 16 }}>
              <div className="form-label" style={{ fontSize: 11 }}>Sắp xếp</div>
              <select className="form-control" value={filters.sort}
                onChange={(e) => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1); }}>
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="form-label" style={{ fontSize: 11 }}>Danh mục</div>
              <select className="form-control" value={filters.category}
                onChange={(e) => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}>
                <option value="">Tất cả</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="form-label" style={{ fontSize: 11 }}>Khoảng giá</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                <input className="form-control" type="number" placeholder="Từ" style={{ flex: 1, padding: '8px 10px' }}
                  value={filters['price[gte]']}
                  onChange={(e) => setFilters(f => ({ ...f, 'price[gte]': e.target.value }))}
                />
                <span style={{color: 'var(--text-muted)'}}>-</span>
                <input className="form-control" type="number" placeholder="Đến" style={{ flex: 1, padding: '8px 10px' }}
                  value={filters['price[lte]']}
                  onChange={(e) => setFilters(f => ({ ...f, 'price[lte]': e.target.value }))}
                />
              </div>
              <button className="btn btn-primary btn-full btn-sm"
                onClick={() => { setPage(1); fetchBooks(); }}>
                Áp dụng
              </button>
            </div>

            <button className="btn btn-ghost btn-full btn-sm" style={{ fontSize: 12, opacity: 0.7 }}
              onClick={() => { setFilters({ sort: '-createdAt', category: '', 'price[gte]': '', 'price[lte]': '' }); setPage(1); }}>
              ✕ Xóa bộ lọc
            </button>
          </div>
        </aside>

        {/* Book Grid */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>
              Tất Cả Sách <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>({total} sách)</span>
            </h1>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ aspectRatio: '3/4' }}></div>
                  <div style={{ padding: 12 }}>
                    <div className="skeleton" style={{ height: 14, marginBottom: 8 }}></div>
                    <div className="skeleton" style={{ height: 12, width: '60%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>Không tìm thấy sách nào phù hợp</p>
            </div>
          ) : (
            <>
              <div className="grid-books">
                {books.map(book => <BookCard key={book._id} book={book} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                  <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return <Suspense fallback={<div className="container" style={{ paddingTop: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>}><BooksContent /></Suspense>;
}
