import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [pinCode, setPinCode] = useState('');
  const [pinAvailable, setPinAvailable] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => { api.get(`/products/${id}`).then((r) => setProduct(r.data)); }, [id]);

  const checkPin = () => {
    const stock = product.stockByPin?.find((s) => s.pinCode === pinCode);
    setPinAvailable(stock ? stock.quantity : 0);
  };

  const handleAddToCart = async () => {
    try { await addToCart(product._id, qty); toast.success('Added to cart'); }
    catch { toast.error('Login to add to cart'); }
  };

  if (!product) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Image */}
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img
              src={product.images?.[0] || `https://placehold.co/600x450/e8f5e9/2e7d32?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="tag">{product.category?.name}</span>
              {product.totalStock > 0
                ? <span className="badge badge-green">In Stock</span>
                : <span className="badge badge-red">Out of Stock</span>
              }
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--green-900)', marginBottom: '0.5rem' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>🌱</span>
              <span>{product.seller?.farmName || product.seller?.name}</span>
              {product.seller?.pinCode && <span>· PIN {product.seller.pinCode}</span>}
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-700)', marginBottom: '1rem' }}>
              ₹{product.price}
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}> / {product.unit}</span>
            </div>

            {product.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                {product.description}
              </p>
            )}

            {/* PIN check */}
            <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--green-800)' }}>
                📍 Check Availability at Your PIN Code
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input" placeholder="Enter 6-digit PIN code"
                  value={pinCode} onChange={(e) => setPinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkPin()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={checkPin}>Check</button>
              </div>
              {pinAvailable !== null && (
                <div style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '0.9rem', color: pinAvailable > 0 ? 'var(--green-600)' : 'var(--red-600)' }}>
                  {pinAvailable > 0
                    ? `✓ Available — ${pinAvailable} ${product.unit} in stock at this PIN`
                    : '✗ Not available at this PIN code'}
                </div>
              )}
            </div>

            {/* Qty + Add to cart */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
                <button
                  style={{ width: 36, height: 36, borderRadius: 6, border: 'none', background: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', color: 'var(--green-700)', boxShadow: 'var(--shadow-sm)' }}
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >−</button>
                <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button
                  style={{ width: 36, height: 36, borderRadius: 6, border: 'none', background: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', color: 'var(--green-700)', boxShadow: 'var(--shadow-sm)' }}
                  onClick={() => setQty(qty + 1)}
                >+</button>
              </div>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                🛒 Add to Cart · ₹{(product.price * qty).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
