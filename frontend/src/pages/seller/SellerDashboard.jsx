import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Seller.css';

const statusBadge = { placed: 'badge-blue', confirmed: 'badge-blue', packed: 'badge-amber', shipped: 'badge-amber', delivered: 'badge-green', cancelled: 'badge-red' };

export default function SellerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user?.sellerStatus === 'approved') {
      api.get('/orders/seller/my').then((r) => setOrders(r.data));
      api.get('/products/seller/my').then((r) => setProducts(r.data));
    }
  }, [user]);

  if (user?.sellerStatus !== 'approved') {
    return (
      <div className="seller-page">
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 className="serif" style={{ marginBottom: '0.75rem', color: 'var(--green-900)' }}>Pending Approval</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Your seller account is under review. Our admin team will verify your details and approve your account shortly.
            </p>
            <div className="seller-note" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <span>📧</span> You'll receive a notification once your account is approved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const revenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus)).length;

  return (
    <div className="seller-page">
      <div className="seller-header">
        <div className="container">
          <div className="seller-header__inner">
            <div>
              <h1 className="serif">Welcome back, {user.name.split(' ')[0]} 👋</h1>
              <p>{user.farmName || 'Your Farm'} · Seller Dashboard</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/seller/products" className="btn btn-primary">+ Add Product</Link>
              <Link to="/seller/orders" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>View Orders</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container seller-content">
        {/* Stats */}
        <div className="seller-stats">
          {[
            { icon: '📦', label: 'Total Orders', value: orders.length, color: '#2563eb' },
            { icon: '⏳', label: 'Active Orders', value: pendingOrders, color: '#d97706' },
            { icon: '💰', label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, color: '#059669' },
            { icon: '🌾', label: 'Products', value: products.length, color: '#7c3aed' },
          ].map((s) => (
            <div key={s.label} className="seller-stat">
              <div className="seller-stat__icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
              <div className="seller-stat__value">{s.value}</div>
              <div className="seller-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="seller-grid">
          {/* Recent orders */}
          <div className="card">
            <div className="seller-card-header">
              <h3>Recent Orders</h3>
              <Link to="/seller/orders" className="seller-card-link">View all →</Link>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders yet.</p>
            ) : orders.slice(0, 5).map((o) => (
              <div key={o._id} className="seller-order-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>#{o._id.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customer?.name}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--green-700)' }}>₹{o.totalAmount}</span>
                  <span className={`badge ${statusBadge[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Products */}
          <div className="card">
            <div className="seller-card-header">
              <h3>My Products</h3>
              <Link to="/seller/products" className="seller-card-link">Manage →</Link>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No products listed yet.</p>
                <Link to="/seller/products" className="btn btn-primary btn-sm">Add First Product</Link>
              </div>
            ) : products.slice(0, 5).map((p) => (
              <div key={p._id} className="seller-order-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stock: {p.totalStock} {p.unit}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{p.price}/{p.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
