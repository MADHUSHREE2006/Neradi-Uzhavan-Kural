import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const statusConfig = {
  placed:    { badge: 'badge-blue',  label: 'Order Placed' },
  confirmed: { badge: 'badge-blue',  label: 'Confirmed' },
  packed:    { badge: 'badge-amber', label: 'Packed' },
  shipped:   { badge: 'badge-amber', label: 'Shipped' },
  delivered: { badge: 'badge-green', label: 'Delivered' },
  cancelled: { badge: 'badge-red',   label: 'Cancelled' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { api.get('/orders/my').then((r) => setOrders(r.data)); }, []);

  if (!orders.length)
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Start Shopping</button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="serif" style={{ marginBottom: '2rem', color: 'var(--green-900)' }}>My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => {
            const cfg = statusConfig[order.orderStatus] || { badge: 'badge-gray', label: order.orderStatus };
            return (
              <div
                key={order._id} className="card card-hover"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--green-800)' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {order.items.map((item) => (
                    <span key={item._id} className="tag">{item.name} ×{item.quantity}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--green-700)' }}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
