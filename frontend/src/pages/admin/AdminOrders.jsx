import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Admin.css';

const statusBadge = { placed: 'badge-blue', confirmed: 'badge-blue', packed: 'badge-amber', shipped: 'badge-amber', delivered: 'badge-green', cancelled: 'badge-red' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { api.get('/admin/orders').then((r) => setOrders(r.data)); }, []);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="serif">All Orders</h1>
          <p>{orders.length} total orders · Platform Revenue: ₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <div className="container admin-content">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.customer?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customer?.phone}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{o.paymentStatus}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                        {o.paymentMethod === 'cod' ? 'COD' : 'Wallet'}
                      </div>
                    </td>
                    <td><span className={`badge ${statusBadge[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {expanded === o._id ? '▲' : '▼'} Details
                      </button>
                    </td>
                  </tr>
                  {expanded === o._id && (
                    <tr key={`${o._id}-detail`}>
                      <td colSpan="7" style={{ background: 'var(--cream)', padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                          {/* Items */}
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--green-900)' }}>📦 Order Items</div>
                            {o.items?.map((item) => (
                              <div key={item._id} style={{ marginBottom: '0.3rem' }}>
                                {item.name} × {item.quantity} — <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                              </div>
                            ))}
                          </div>
                          {/* Shipping */}
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--green-900)' }}>📍 Shipping Address</div>
                            <div>{o.shippingAddress?.fullName}</div>
                            <div>{o.shippingAddress?.phone}</div>
                            <div>{o.shippingAddress?.address}</div>
                            <div>{o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pinCode}</div>
                          </div>
                          {/* Payment */}
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--green-900)' }}>💳 Payment Details</div>
                            <div>Method: <strong style={{ textTransform: 'capitalize' }}>{o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital Wallet'}</strong></div>
                            <div>Status: <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{o.paymentStatus}</span></div>
                            <div>Total: <strong style={{ color: 'var(--green-700)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</strong></div>
                            {o.paymentStatus === 'paid' && o.orderStatus === 'delivered' && (
                              <div style={{ marginTop: '0.4rem', color: '#166534', fontWeight: 600 }}>✅ Revenue credited to sellers</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
