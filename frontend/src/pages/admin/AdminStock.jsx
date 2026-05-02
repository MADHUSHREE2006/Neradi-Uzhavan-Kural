import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Admin.css';

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [pinCode, setPinCode] = useState('');

  const fetchStock = () => {
    const params = pinCode ? { pinCode } : {};
    api.get('/admin/stock', { params }).then((r) => setProducts(r.data));
  };
  useEffect(() => { fetchStock(); }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="serif">Stock by Location</h1>
          <p>View inventory availability across PIN codes</p>
        </div>
      </div>
      <div className="container admin-content">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            className="form-input" placeholder="Filter by PIN code" value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <button className="btn btn-primary" onClick={fetchStock}>Search</button>
          {pinCode && <button className="btn btn-ghost" onClick={() => { setPinCode(''); fetchStock(); }}>Clear</button>}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Total Stock</th>
                <th>PIN-wise Availability</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.seller?.farmName || p.seller?.name}</td>
                  <td>
                    <span className={`badge ${p.totalStock > 0 ? 'badge-green' : 'badge-red'}`}>
                      {p.totalStock}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {p.stockByPin.map((s) => (
                        <span key={s.pinCode} className={`badge ${s.quantity > 0 ? 'badge-green' : 'badge-gray'}`}>
                          {s.pinCode}: {s.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
