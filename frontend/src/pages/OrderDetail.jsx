import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const statusConfig = {
  placed:    { badge: 'badge-blue',  icon: '📋' },
  confirmed: { badge: 'badge-blue',  icon: '✅' },
  packed:    { badge: 'badge-amber', icon: '📦' },
  shipped:   { badge: 'badge-amber', icon: '🚚' },
  delivered: { badge: 'badge-green', icon: '🎉' },
  cancelled: { badge: 'badge-red',   icon: '❌' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data)); }, [id]);

  if (!order) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  const cfg = statusConfig[order.orderStatus] || { badge: 'badge-gray', icon: '📦' };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="serif" style={{ color: 'var(--green-900)', marginBottom: '0.25rem' }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`badge ${cfg.badge}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            {cfg.icon} {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Items */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--green-900)' }}>Order Items</h3>
              {order.items.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <img src={item.image || `https://placehold.co/64x64/e8f5e9/2e7d32?text=?`} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{item.price * item.quantity}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', fontWeight: 700, fontSize: '1.05rem' }}>
                Total: ₹{order.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Tracking */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--green-900)' }}>Order Tracking</h3>
              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: 'var(--border)' }} />
                {order.trackingHistory.map((t, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-1.5rem', top: '3px', width: 14, height: 14, borderRadius: '50%', background: i === 0 ? 'var(--green-600)' : 'var(--border)', border: '2px solid #fff', boxShadow: '0 0 0 2px ' + (i === 0 ? 'var(--green-200, #c8e6c9)' : 'var(--border)') }} />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{t.status}</div>
                    {t.note && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{t.note}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{new Date(t.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--green-900)' }}>Shipping Address</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.phone}</div>
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                <div style={{ fontWeight: 600 }}>PIN: {order.shippingAddress.pinCode}</div>
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--green-900)' }}>Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Method</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
