'use client';

import { useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false });
  const [editingAddrId, setEditingAddrId] = useState(null);

  const fetchData = async () => {
    try {
      const [uRes, aRes] = await Promise.all([authAPI.getProfile(), userAPI.getAddresses()]);
      setUser(uRes.data.user);
      setProfileForm({ name: uRes.data.user.name, phone: uRes.data.user.phone || '' });
      setAddresses(aRes.data.addresses || []);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profileForm);
      toast.success('Cập nhật thông tin thành công');
      fetchData();
    } catch(e) { toast.error(e.message || 'Lỗi cập nhật'); }
    finally { setSavingProfile(false); }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddrId) {
        await userAPI.updateAddress(editingAddrId, addrForm);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await userAPI.addAddress(addrForm);
        toast.success('Thêm địa chỉ mới thành công');
      }
      setShowAddressForm(false);
      fetchData();
    } catch(e) { toast.error(e.message || 'Lỗi lưu địa chỉ'); }
  };

  const handleDeleteAddress = async (id) => {
    if(!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await userAPI.deleteAddress(id);
      toast.success('Đã xóa địa chỉ');
      fetchData();
    } catch(e) { toast.error(e.message || 'Lỗi xóa địa chỉ'); }
  };

  const openEditAddress = (addr) => {
    setAddrForm(addr);
    setEditingAddrId(addr._id);
    setShowAddressForm(true);
  };
  
  const openNewAddress = () => {
    setAddrForm({ fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false });
    setEditingAddrId(null);
    setShowAddressForm(true);
  };

  if(loading) return <div className="spinner"></div>;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Hồ sơ */}
      <div className="card" style={{ padding: '24px 20px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Hồ sơ của tôi</h2>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
             <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Email (Không thể thay đổi)</label>
                <input className="form-control" value={user.email} disabled style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: 13.5 }} />
             </div>
             <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Họ và tên</label>
                <input className="form-control" value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name: e.target.value})} required style={{ fontSize: 13.5 }} />
             </div>
             <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Số điện thoại</label>
                <input className="form-control" value={profileForm.phone} onChange={e=>setProfileForm({...profileForm, phone: e.target.value})} style={{ fontSize: 13.5 }} />
             </div>
             <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
               {savingProfile ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi'}
             </button>
          </div>
        </form>
      </div>

      {/* Địa chỉ */}
      <div className="card" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Sổ địa chỉ</h2>
          {!showAddressForm && (
            <button className="btn btn-outline btn-sm" onClick={openNewAddress}>+ Thêm mới</button>
          )}
        </div>

        {showAddressForm ? (
          <form onSubmit={handleSaveAddress} className="address-form-box">
             <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{editingAddrId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
             <div className="address-form-grid-2">
               <div className="form-group"><label className="form-label">Họ tên</label><input className="form-control" value={addrForm.fullName} onChange={e=>setAddrForm({...addrForm, fullName: e.target.value})} required /></div>
               <div className="form-group"><label className="form-label">Số điện thoại</label><input className="form-control" value={addrForm.phone} onChange={e=>setAddrForm({...addrForm, phone: e.target.value})} required /></div>
             </div>
             <div className="form-group">
               <label className="form-label">Số nhà, đường</label>
               <input className="form-control" value={addrForm.street} onChange={e=>setAddrForm({...addrForm, street: e.target.value})} required />
             </div>
             <div className="address-form-grid-3">
               <div className="form-group"><label className="form-label">Phường/Xã</label><input className="form-control" value={addrForm.ward} onChange={e=>setAddrForm({...addrForm, ward: e.target.value})} /></div>
               <div className="form-group"><label className="form-label">Quận/Huyện</label><input className="form-control" value={addrForm.district} onChange={e=>setAddrForm({...addrForm, district: e.target.value})} required /></div>
               <div className="form-group"><label className="form-label">Tỉnh/Thành</label><input className="form-control" value={addrForm.city} onChange={e=>setAddrForm({...addrForm, city: e.target.value})} required /></div>
             </div>
             <div className="form-group" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
               <input type="checkbox" id="isDef" checked={addrForm.isDefault} onChange={e=>setAddrForm({...addrForm, isDefault: e.target.checked})} style={{ width: 14, height: 14 }} />
               <label htmlFor="isDef" style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13.5 }}>Đặt làm mặc định</label>
             </div>
             <div style={{ display: 'flex', gap: 10 }}>
               <button type="submit" className="btn btn-primary btn-sm">Lưu địa chỉ</button>
               <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>Hủy</button>
             </div>
          </form>
        ) : (
          <div className="addresses-list">
            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Bạn chưa có địa chỉ nào.</p>
            ) : (
              addresses.map(addr => (
                <div key={addr._id} className="address-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{addr.fullName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>|</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{addr.phone}</span>
                      {addr.isDefault && <span className="badge badge-success" style={{ fontSize: 10, padding: '1px 6px' }}>Mặc định</span>}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{addr.street}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => openEditAddress(addr)}>Sửa</button>
                    {!addr.isDefault && <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444', fontSize: 12 }} onClick={() => handleDeleteAddress(addr._id)}>Xóa</button>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .address-form-box {
          background: var(--bg-main);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .address-form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .address-form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        .address-item {
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .address-item:last-child {
          border-bottom: none;
        }

        @media (max-width: 640px) {
          .address-form-grid-2, .address-form-grid-3 {
            grid-template-columns: 1fr;
          }
          .address-item {
             flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
