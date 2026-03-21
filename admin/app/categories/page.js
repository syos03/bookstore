'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { categoryAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialForm = { name: '', description: '', icon: '', parent: '' };
  const [form, setForm] = useState(initialForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.categories);
    } catch (err) {
      toast.error('Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các sách thuộc danh mục này có thể bị lỗi!')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Đã xóa danh mục thành công');
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa danh mục');
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setForm({ ...cat, parent: cat.parent?._id || '' });
      setIsEditing(true);
    } else {
      setForm(initialForm);
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.parent) delete data.parent;

      if (isEditing) {
        await categoryAPI.update(form._id, data);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryAPI.create(data);
        toast.success('Thêm danh mục mới thành công');
      }
      
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>🔖 Quản lý danh mục</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Thêm danh mục mới
        </button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Icon</th>
                  <th>Mô tả</th>
                  <th>Số lượng sách</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}>Chưa có danh mục nào</td></tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat._id}>
                      <td style={{ fontWeight: 600 }}>{cat.name}</td>
                      <td style={{ fontSize: 24 }}>{cat.icon || '📚'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{cat.description || 'Không có mô tả'}</td>
                      <td><span className="badge info">{cat.bookCount || 0} cuốn</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(cat)}>Sửa</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', fontSize: 24, padding: '0 8px', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Tên danh mục *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (Emoji) Ví dụ: 📚, 💻, 🧠...</label>
                <input className="form-control" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} maxLength="2" />
              </div>
              <div className="form-group">
                <label className="form-label">Danh mục cha (Không bắt buộc)</label>
                <select className="form-control" value={form.parent} onChange={e => setForm({...form, parent: e.target.value})}>
                  <option value="">-- Không có --</option>
                  {categories.filter(c => c._id !== form._id).map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
