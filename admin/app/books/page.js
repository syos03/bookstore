'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { bookAPI, categoryAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const initialForm = {
    title: '', author: '', description: '', price: '', originalPrice: '',
    discount: 0, stock: '', pages: '', publishYear: '', category: '',
    isFeatured: false, images: [], coverImage: ''
  };
  const [form, setForm] = useState(initialForm);
  const [selectedImages, setSelectedImages] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, catRes] = await Promise.all([
        bookAPI.getAllAdmin({ page, limit: 10, q: search }),
        categoryAPI.getAll()
      ]);
      console.log("bookRes:", bookRes);
      setBooks(bookRes.data?.books || []);
      setTotalPages(bookRes.totalPages || 1);
      setCategories(catRes.data?.categories || []);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu sách/danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchData(); }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sách này? (Sách sẽ chỉ bị ẩn, không xóa vĩnh viễn)')) return;
    try {
      await bookAPI.delete(id);
      toast.success('Đã xóa sách thành công');
      fetchData();
    } catch (err) {
      toast.error('Lỗi xóa sách');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setSelectedImages(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleDeleteOldImage = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này vĩnh viễn?')) return;
    try {
      await bookAPI.deleteImage(form._id, id);
      toast.success('Đã xóa ảnh');
      setForm(prev => ({
        ...prev,
        images: prev.images.filter(img => img._id !== id)
      }));
      // Update the book in the list as well
      setBooks(prev => prev.map(b => b._id === form._id ? {
        ...b,
        images: b.images.filter(img => img._id !== id)
      } : b));
    } catch (err) {
      toast.error('Lỗi xóa ảnh');
    }
  };

  const handleRemoveNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setForm({
        ...book,
        category: book.category?._id || '',
        images: book.images || [],
        coverImage: book.coverImage || ''
      });
      setIsEditing(true);
    } else {
      setForm(initialForm);
      setIsEditing(false);
    }
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        // Loại bỏ images (của DB), reviews (nếu có), và category (xử lý riêng bên dưới)
        const skipKeys = ['images', 'category', 'reviews', 'tags', '_id', '__v', 'id', 'createdAt', 'updatedAt', 'slug', 'soldCount', 'rating', 'numReviews'];
        if (!skipKeys.includes(key) && form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });
      
      if (form.category) formData.append('category', form.category);
      
      selectedImages.forEach(file => {
        formData.append('images', file);
      });

      if (isEditing) {
        await bookAPI.update(form._id, formData);
        toast.success('Cập nhật sách thành công');
      } else {
        await bookAPI.create(formData);
        toast.success('Thêm sách mới thành công');
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu sách');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (p) => p?.toLocaleString('vi-VN') + 'đ';

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>📚 Quản lý sách</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Tìm kiếm sách..." 
            style={{ width: 250 }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Thêm sách mới
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sách</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Đã bán</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32 }}>Không tìm thấy sách nào</td></tr>
                  ) : (
                    books.map(book => (
                      <tr key={book._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={book.thumbnail || 'https://placehold.co/40x50?text=Sách'} alt="" style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                            <div>
                              <div style={{ fontWeight: 600, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge info">{book.category?.name || 'Không có'}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatPrice(book.finalPrice || book.price)}</div>
                          {book.discount > 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(book.price)}</div>}
                        </td>
                        <td>
                          <span className={`badge ${book.stock > 10 ? 'success' : book.stock > 0 ? 'warning' : 'danger'}`}>
                            {book.stock} cuốn
                          </span>
                        </td>
                        <td>{book.soldCount || 0}</td>
                        <td>
                          {book.isFeatured && <span className="badge warning" style={{ marginRight: 4 }}>Nổi bật</span>}
                          {!book.isActive && <span className="badge danger">Đã xóa</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(book)}>Sửa</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book._id)}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trang trước</button>
                <span style={{ padding: '6px 12px', fontWeight: 600 }}>{page} / {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{isEditing ? 'Sửa thông tin sách' : 'Thêm sách mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', fontSize: 24, padding: '0 8px', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Cot 1 */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Tên sách *</label>
                    <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tác giả *</label>
                    <input className="form-control" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Danh mục *</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Giá gốc (VNĐ) *</label>
                      <input type="number" className="form-control" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giảm giá (%)</label>
                      <input type="number" className="form-control" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} min="0" max="100" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tồn kho *</label>
                    <input type="number" className="form-control" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0" />
                  </div>
                </div>

                {/* Cot 2 */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Số trang</label>
                      <input type="number" className="form-control" value={form.pages} onChange={e => setForm({...form, pages: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Năm XB</label>
                      <input type="number" className="form-control" value={form.publishYear} onChange={e => setForm({...form, publishYear: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea className="form-control" rows="5" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Link ảnh bìa (URL)</label>
                    <input className="form-control" placeholder="Dán link ảnh tại đây (ưu tiên hơn upload)" value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Ảnh sản phẩm (Tối đa 5 ảnh)</label>
                    <input type="file" className="form-control" multiple accept="image/*" onChange={handleImageChange} />
                    
                    {/* Hien thi anh cu neu co */}
                    {isEditing && form.images?.length > 0 && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                        {form.images.map((img) => (
                          <div key={img.public_id || img._id} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              type="button"
                              onClick={() => handleDeleteOldImage(img._id)}
                              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255, 0, 0, 0.7)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Hien thi anh moi chon */}
                    {selectedImages.length > 0 && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                        {selectedImages.map((file, i) => (
                          <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--primary)', background: 'var(--bg-main)' }}>
                             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 10, padding: 4, wordBreak: 'break-all' }}>
                               {file.name}
                             </div>
                             <button 
                              type="button"
                              onClick={() => handleRemoveNewImage(i)}
                              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0, 0, 0, 0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} style={{ width: 16, height: 16 }} />
                    <label htmlFor="isFeatured" style={{ fontWeight: 600, cursor: 'pointer' }}>Sách nổi bật</label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Đang lưu...' : (isEditing ? '💾 Cập nhật' : '💾 Lưu sách mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
