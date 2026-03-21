'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 10, q: search });
      setUsers(res.data.users);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleUpdateRole = async (id, role) => {
    try {
      await adminAPI.updateUser(id, { role });
      toast.success('Cập nhật quyền thành công');
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi cập nhật quyền');
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await adminAPI.updateUser(id, { isActive: !isActive });
      toast.success(isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>👥 Quản lý người dùng</h1>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Tìm kiếm email, tên..." 
          style={{ width: 300 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
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
                    <th>Người dùng</th>
                    <th>Liên hệ</th>
                    <th>Ngày tham gia</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32 }}>Không tìm thấy người dùng</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={user.avatar || 'https://placehold.co/40x40?text=Avatar'} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{user.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.googleId ? 'Google Acc' : 'Local Acc'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{user.email}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.phone || 'Chưa cập nhật SCD'}</div>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <select 
                            className="form-control" 
                            style={{ padding: '6px 12px', width: 'auto' }}
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          >
                            <option value="customer">Khách hàng</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge ${user.isActive ? 'success' : 'danger'}`}>
                            {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                          >
                            {user.isActive ? 'Khóa' : 'Mở khóa'}
                          </button>
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
    </AdminLayout>
  );
}
