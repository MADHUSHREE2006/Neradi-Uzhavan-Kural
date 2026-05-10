import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Seller.css';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const statusBadge = { placed: 'badge-blue', confirmed: 'badge-blue', packed: 'badge-amber', shipped: 'badge-amber', delivered: 'badge-green', cancelled: 'badge-red' };

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = () => api.get('/orders/seller/my').then((r) => setOrders(r.data));
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="seller-page">
      <div className="seller-header">
        <div className="container">
          <h1 className="serif">Orders</h1>
          <p>{orders.length} total orders · Revenue: ₹{totalRevenue.toLocaleString('en-IN')}</p>
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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                <span className={`badge ${statusBadge[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
                <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>
                  {o.paymentStatus === 'paid' ? '💰 Paid' : '⏳ Pending'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {o.items.map((item) => (
                <span key={item._id} className="tag">{item.name} ×{item.quantity}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update status:</span>
              <select
                value={o.orderStatus}
                onChange={(e) => updateStatus(o._id, e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                style={{ marginLeft: 'auto' }}
              >
                {expanded === o._id ? '▲ Hide Details' : '▼ Payment Details'}
              </button>
            </div>

            {/* Payment transaction details */}
            {expanded === o._id && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--green-500)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--green-900)' }}>
                  💳 Payment & Transaction Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method: </span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital Wallet'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Status: </span>
                    <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{o.paymentStatus}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Order Amount: </span>
                    <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Order Date: </span>
                    <span>{new Date(o.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {o.paymentStatus === 'paid' && o.orderStatus === 'delivered' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: '#dcfce7', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                    ✅ Payment credited to your wallet after delivery
                  </div>
                )}
                {o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: '#fef3c7', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#92400e' }}>
                    ⏳ COD payment will be credited to your wallet once you mark the order as delivered
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
