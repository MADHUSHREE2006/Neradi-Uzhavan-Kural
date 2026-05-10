import { useState, useEffect, useRef } from 'react';
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
  const printRef = useRef();

  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data)); }, [id]);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - #${order._id.slice(-8).toUpperCase()}</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 2rem; }
            .receipt-header { text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
            .receipt-header h1 { font-size: 1.6rem; color: #2e7d32; margin-bottom: 0.25rem; }
            .receipt-header p { color: #666; font-size: 0.85rem; }
            .receipt-meta { display: flex; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
            .receipt-meta-block { flex: 1; }
            .receipt-meta-block h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 0.4rem; }
            .receipt-meta-block p { font-size: 0.9rem; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
            th { background: #f0fdf4; color: #2e7d32; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.6rem 0.75rem; text-align: left; border-bottom: 2px solid #c8e6c9; }
            td { padding: 0.65rem 0.75rem; border-bottom: 1px solid #e8f5e9; font-size: 0.9rem; }
            .text-right { text-align: right; }
            .total-row td { font-weight: 700; font-size: 1rem; border-top: 2px solid #2e7d32; border-bottom: none; color: #2e7d32; }
            .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
            .badge-green { background: #dcfce7; color: #166534; }
            .badge-amber { background: #fef3c7; color: #92400e; }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            .badge-red { background: #fee2e2; color: #991b1b; }
            .payment-section { background: #f0fdf4; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
            .payment-section h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 0.75rem; }
            .payment-row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.4rem; }
            .tracking-section { margin-bottom: 1.5rem; }
            .tracking-section h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 0.75rem; }
            .tracking-item { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 0.85rem; }
            .tracking-dot { width: 10px; height: 10px; border-radius: 50%; background: #2e7d32; margin-top: 4px; flex-shrink: 0; }
            .footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e8f5e9; color: #888; font-size: 0.8rem; }
            @media print {
              body { padding: 1rem; }
              button { display: none; }
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  if (!order) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  const cfg = statusConfig[order.orderStatus] || { badge: 'badge-gray', icon: '📦' };
  const txn = order.paymentTransactionId;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="serif" style={{ color: 'var(--green-900)', marginBottom: '0.25rem' }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className={`badge ${cfg.badge}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              {cfg.icon} {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>

        {/* Printable receipt area */}
        <div ref={printRef} style={{ display: 'none' }}>
          <div className="receipt-header">
            <h1>🌾 Neradi Uzhavan Kural</h1>
            <p>Farm-to-Table Marketplace · Order Receipt</p>
          </div>

          <div className="receipt-meta">
            <div className="receipt-meta-block">
              <h4>Order Details</h4>
              <p><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>
              <p><strong>Status:</strong> <span className={`badge ${cfg.badge}`}>{order.orderStatus}</span></p>
            </div>
            <div className="receipt-meta-block">
              <h4>Shipping Address</h4>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="text-right" style={{ fontWeight: 600 }}>Delivery</td>
                <td className="text-right" style={{ color: '#166534', fontWeight: 600 }}>Free</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="3" className="text-right">Total Amount</td>
                <td className="text-right">₹{order.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div className="payment-section">
            <h4>Payment Information</h4>
            <div className="payment-row">
              <span>Payment Method</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital Wallet'}</span>
            </div>
            <div className="payment-row">
              <span>Payment Status</span>
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.paymentStatus}</span>
            </div>
            {txn && (
              <>
                <div className="payment-row">
                  <span>Transaction ID</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{txn._id?.toString().slice(-12).toUpperCase()}</span>
                </div>
                <div className="payment-row">
                  <span>Transaction Date</span>
                  <span>{new Date(txn.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="payment-row">
                  <span>Amount Debited</span>
                  <span style={{ fontWeight: 700, color: '#991b1b' }}>-₹{txn.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="payment-row">
                  <span>Wallet Balance After</span>
                  <span>₹{txn.balanceAfter?.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
          </div>

          <div className="tracking-section">
            <h4>Order Tracking History</h4>
            {order.trackingHistory.map((t, i) => (
              <div key={i} className="tracking-item">
                <div className="tracking-dot" />
                <div>
                  <strong style={{ textTransform: 'capitalize' }}>{t.status}</strong>
                  {t.note && <span> — {t.note}</span>}
                  <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                    {new Date(t.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="footer">
            <p>Thank you for shopping with Neradi Uzhavan Kural!</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>

        {/* Screen view */}
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

            {/* Payment + Transaction */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--green-900)' }}>Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Method</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital Wallet'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.paymentStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Transaction details (wallet orders) */}
              {txn && (
                <>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '0.75rem 0', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      Transaction Details
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Txn ID</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.78rem' }}>
                        {txn._id?.toString().slice(-12).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date</span>
                      <span>{new Date(txn.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Debited</span>
                      <span style={{ fontWeight: 700, color: 'var(--red-600, #dc2626)' }}>-₹{txn.amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bal. After</span>
                      <span style={{ fontWeight: 600 }}>₹{txn.balanceAfter?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              )}

              {/* COD delivery note */}
              {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  💵 Payment will be collected on delivery
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
