import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [pinCode, setPinCode] = useState('');
  const [pinAvailable, setPinAvailable] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Wishlist state
  const [wishlists, setWishlists] = useState([]);
  const [showWishlistPicker, setShowWishlistPicker] = useState(false);

  useEffect(() => { api.get(`/products/${id}`).then((r) => setProduct(r.data)); }, [id]);
  useEffect(() => {
    if (user) api.get('/wishlist').then((r) => setWishlists(r.data)).catch(() => {});
  }, [user]);

  const isInAnyWishlist = () =>
    wishlists.some((l) => l.products.some((p) => (p._id || p) === id));

  const handleWishlistToggle = async () => {
    if (!user) { toast.error('Login to use wishlist'); return; }
    if (wishlists.length === 0) {
      const { data: newList } = await api.post('/wishlist', { name: 'My Wishlist' });
      await api.post(`/wishlist/${newList._id}/add`, { productId: id });
      api.get('/wishlist').then((r) => setWishlists(r.data));
      toast.success('Added to wishlist');
      return;
    }
    if (wishlists.length === 1) {
      const list = wishlists[0];
      const already = list.products.some((p) => (p._id || p) === id);
      if (already) {
        await api.delete(`/wishlist/${list._id}/remove/${id}`);
        api.get('/wishlist').then((r) => setWishlists(r.data));
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${list._id}/add`, { productId: id });
        api.get('/wishlist').then((r) => setWishlists(r.data));
        toast.success('Added to wishlist');
      }
      return;
    }
    setShowWishlistPicker(true);
  };

  const addToWishlistFromPicker = async (listId) => {
    await api.post(`/wishlist/${listId}/add`, { productId: id });
    api.get('/wishlist').then((r) => setWishlists(r.data));
    setShowWishlistPicker(false);
    toast.success('Added to wishlist');
  };

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
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                {' '}/ {product.isRental ? (product.rentalUnit === 'per_hour' ? 'hour' : 'day') : product.unit}
              </span>
              {product.isRental && (
                <span className="badge badge-amber" style={{ marginLeft: '0.75rem', fontSize: '0.75rem', verticalAlign: 'middle' }}>
                  🚜 Rental · {product.rentalUnit === 'per_hour' ? 'Per Hour' : 'Per Day'}
                </span>
              )}
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

            {/* Qty + Add to cart + Wishlist */}
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
              <button
                onClick={handleWishlistToggle}
                title={isInAnyWishlist() ? 'In Wishlist' : 'Add to Wishlist'}
                style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-sm)', border: '2px solid #e53e3e',
                  background: isInAnyWishlist() ? '#e53e3e' : '#fff',
                  color: isInAnyWishlist() ? '#fff' : '#e53e3e',
                  fontSize: '1.4rem', cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{isInAnyWishlist() ? '♥' : '♡'}</button>
            </div>

            {/* Wishlist picker */}
            {showWishlistPicker && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowWishlistPicker(false)}>
                <div className="card" style={{ minWidth: 320, maxWidth: 400, padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--green-900)' }}>Add to Wishlist</h3>
                  {wishlists.map((l) => (
                    <button key={l._id} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', textAlign: 'left' }}
                      onClick={() => addToWishlistFromPicker(l._id)}>
                      ♡ {l.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({l.products.length} items)</span>
                    </button>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }} onClick={() => setShowWishlistPicker(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
