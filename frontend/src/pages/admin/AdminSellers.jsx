import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Admin.css';

const statusBadge = { approved: 'badge-green', pending: 'badge-amber', blocked: 'badge-red' };

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchSellers = () => {
    const params = filter ? { status: filter } : {};
    api.get('/admin/sellers', { params }).then((r) => setSellers(r.data));
  };
  useEffect(() => { fetchSellers(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/sellers/${id}/status`, { status });
      toast.success(`Seller ${status}`);
      fetchSellers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="serif">Seller Management</h1>
          <p>Approve, verify and manage farmer accounts</p>
        </div>
      </div>
      <div className="container admin-content">
        <div className="filter-tabs">
          {['', 'pending', 'approved', 'blocked'].map((s) => (
            <button key={s} className={`filter-tab ${filter === s ? 'filter-tab--active' : ''}`} onClick={() => setFilter(s)}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Sellers'}
            </button>
          ))}
        </div>

        {sellers.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👨‍🌾</div><h3>No sellers found</h3></div>
        ) : sellers.map((s) => (
          <div key={s._id} className="seller-card">
            <div className="seller-avatar">{s.name.charAt(0).toUpperCase()}</div>
            <div className="seller-info">
              <div className="seller-name">{s.name} {s.farmName && <span style={{ color: 'var(--green-600)', fontWeight: 400 }}>· {s.farmName}</span>}</div>
              <div className="seller-meta">{s.email} · {s.phone} · PIN: {s.pinCode}</div>
            </div>
            <div className="seller-actions">
              <span className={`badge ${statusBadge[s.sellerStatus]}`}>{s.sellerStatus}</span>
              {s.sellerStatus !== 'approved' && (
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(s._id, 'approved')}>Approve</button>
              )}
              {s.sellerStatus !== 'blocked' && (
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(s._id, 'blocked')}>Block</button>
              )}
              {s.sellerStatus === 'blocked' && (
                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(s._id, 'approved')}>Unblock</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
