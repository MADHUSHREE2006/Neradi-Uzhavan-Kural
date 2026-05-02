import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Seller.css';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const statusBadge = { placed: 'badge-blue', confirmed: 'badge-blue', packed: 'badge-amber', shipped: 'badge-amber', delivered: 'badge-green', cancelled: 'badge-red' };

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => api.get('/orders/seller/my').then((r) => setOrders(r.data));
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="seller-page">
      <div className="seller-header">
        <div className="container">
          <h1 className="serif">Orders</h1>
          <p>{orders.length} total orders</p>
        </div>
      </div>
      <div className="container seller-content">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Orders will appear here once customers start buying</p>
          </div>
        ) : orders.map((o) => (
          <div key={o._id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
                  #{o._id.slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {o.customer?.name} · {o.customer?.phone}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                <span className={`badge ${statusBadge[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {o.items.map((item) => (
                <span key={item._id} className="tag">{item.name} ×{item.quantity}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update status:</span>
              <select
                value={o.orderStatus}
                onChange={(e) => updateStatus(o._id, e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
