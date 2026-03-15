'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { bookAPI } from '@/services/api';
import BookCard from '@/components/BookCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      setLoading(true);
      try {
        const res = await bookAPI.getByCategory(slug);
        // Backend returns: { success, total, ..., data: { category, books } }
        setBooks(res.data?.books || []);
        setCategory(res.data?.category || null);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCategoryBooks();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Đang tải sách trong danh mục...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="section-title">
            Danh mục: <span style={{ color: 'var(--primary)' }}>{category?.name || '...'}</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          Tìm thấy {books.length} cuốn sách thuộc danh mục này
        </p>
      </div>

      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--bg-main)', borderRadius: 12, border: '1px solid var(--border-strong)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
          <h3>Hiện chưa có sách nào trong danh mục này</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Vui lòng quay lại sau hoặc khám phá các danh mục khác nhé!</p>
        </div>
      ) : (
        <div className="grid-books">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
