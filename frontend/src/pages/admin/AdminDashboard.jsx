import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './Admin.css';

const quickLinks = [
  { to: '/admin/sellers', icon: '👨‍🌾', label: 'Manage Sellers', desc: 'Approve, block, verify' },
  { to: '/admin/orders', icon: '📦', label: 'All Orders', desc: 'View & track orders' },
  { to: '/admin/categories', icon: '🗂️', label: 'Categories', desc: 'Add & manage categories' },
  { to: '/admin/stock', icon: '📍', label: 'Stock by Location', desc: 'PIN-wise inventory' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => { api.get('/admin/dashboard').then((r) => setStats(r.data)); }, []);

  const statCards = [
    { label: 'Customers', value: stats.totalUsers, icon: '👥', color: '#2563eb' },
    { label: 'Total Sellers', value: stats.totalSellers, icon: '🚜', color: '#7c3aed' },
    { label: 'Pending Approval', value: stats.pendingSellers, icon: '⏳', color: '#d97706', alert: stats.pendingSellers > 0 },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#0891b2' },
    { label: 'Active Products', value: stats.totalProducts, icon: '🌾', color: '#059669' },
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#2e7d32', sub: 'From paid & delivered orders' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="serif">Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>
      </div>

      <div className="container admin-content">
        {/* Stats */}
        <div className="admin-stats-grid">
          {statCards.map((s) => (
            <div key={s.label} className={`admin-stat-card ${s.alert ? 'admin-stat-card--alert' : ''}`}>
              <div className="admin-stat-card__icon" style={{ background: s.color + '18', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="admin-stat-card__value">{s.value ?? '—'}</div>
                <div className="admin-stat-card__label">{s.label}</div>
                {s.sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{s.sub}</div>}
              </div>
              {s.alert && <span className="admin-stat-card__badge">Action needed</span>}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-quick-grid">
          {quickLinks.map((q) => (
            <Link key={q.to} to={q.to} className="admin-quick-card">
              <div className="admin-quick-card__icon">{q.icon}</div>
              <div>
                <div className="admin-quick-card__label">{q.label}</div>
                <div className="admin-quick-card__desc">{q.desc}</div>
              </div>
              <svg className="admin-quick-card__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
