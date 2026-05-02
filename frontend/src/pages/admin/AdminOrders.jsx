import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Admin.css';

const statusBadge = { placed: 'badge-blue', confirmed: 'badge-blue', packed: 'badge-amber', shipped: 'badge-amber', delivered: 'badge-green', cancelled: 'badge-red' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { api.get('/admin/orders').then((r) => setOrders(r.data)); }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="serif">All Orders</h1>
          <p>{orders.length} total orders on the platform</p>
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
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customer?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customer?.phone}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{o.paymentStatus}</span></td>
                  <td><span className={`badge ${statusBadge[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
