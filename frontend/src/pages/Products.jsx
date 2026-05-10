import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const category = searchParams.get('category') || '';

  // Wishlist state
  const [wishlists, setWishlists] = useState([]);
  const [wishlistModal, setWishlistModal] = useState(null); // productId being added

  const fetchWishlists = useCallback(() => {
    if (user) api.get('/wishlist').then((r) => setWishlists(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => { fetchWishlists(); }, [fetchWishlists]);

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (pinCode) params.pinCode = pinCode;
    api.get('/products', { params })
      .then((r) => setProducts(r.data.products))
      .finally(() => setLoading(false));
  }, [category, search, pinCode]);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try { await addToCart(productId); toast.success('Added to cart'); }
    catch { toast.error('Login to add to cart'); }
  };

  const isInAnyWishlist = (productId) =>
    wishlists.some((l) => l.products.some((p) => p._id === productId || p === productId));

  const handleWishlistClick = (e, productId) => {
    e.stopPropagation();
    if (!user) { toast.error('Login to use wishlist'); return; }
    if (wishlists.length === 0) {
      // Auto-create a default list and add
      api.post('/wishlist', { name: 'My Wishlist' }).then((r) => {
        api.post(`/wishlist/${r.data._id}/add`, { productId }).then(() => {
          fetchWishlists(); toast.success('Added to wishlist');
        });
      });
    } else if (wishlists.length === 1) {
      const list = wishlists[0];
      const already = list.products.some((p) => (p._id || p) === productId);
      if (already) {
        api.delete(`/wishlist/${list._id}/remove/${productId}`).then(() => { fetchWishlists(); toast.success('Removed from wishlist'); });
      } else {
        api.post(`/wishlist/${list._id}/add`, { productId }).then(() => { fetchWishlists(); toast.success('Added to wishlist'); });
      }
    } else {
      setWishlistModal(productId);
    }
  };

  const addToWishlistFromModal = async (listId, productId) => {
    await api.post(`/wishlist/${listId}/add`, { productId });
    fetchWishlists(); setWishlistModal(null); toast.success('Added to wishlist');
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="container">
          <h1 className="serif">Fresh from the Farm</h1>
          <p>Browse products directly from verified farmers across India</p>
        </div>
      </div>

      <div className="container products-layout">
        {/* Sidebar */}
        <aside className="products-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Search</div>
            <div className="search-box">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="search-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">PIN Code</div>
            <input
              className="form-input"
              placeholder="Check availability"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Category</div>
            <div className="category-filters">
              <button
                className={`cat-filter-btn ${!category ? 'cat-filter-btn--active' : ''}`}
                onClick={() => setSearchParams({})}
              >All Products</button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  className={`cat-filter-btn ${category === c._id ? 'cat-filter-btn--active' : ''}`}
                  onClick={() => setSearchParams({ category: c._id })}
                >{c.name}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="products-main">
          <div className="products-toolbar">
            <span className="products-count">{products.length} products found</span>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setPinCode(''); setSearchParams({}); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div key={p._id} className="product-card" onClick={() => navigate(`/products/${p._id}`)}>
                  <div className="product-card__img-wrap">
                    <img
                      src={p.images?.[0] || `https://placehold.co/400x280/e8f5e9/2e7d32?text=${encodeURIComponent(p.name)}`}
                      alt={p.name}
                    />
                    <div className="product-card__overlay">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => handleAddToCart(e, p._id)}
                      >+ Cart</button>
                      <button
                        className="btn btn-sm"
                        title={isInAnyWishlist(p._id) ? 'In Wishlist' : 'Add to Wishlist'}
                        onClick={(e) => handleWishlistClick(e, p._id)}
                        style={{
                          background: isInAnyWishlist(p._id) ? '#e53e3e' : 'rgba(255,255,255,0.9)',
                          color: isInAnyWishlist(p._id) ? '#fff' : '#e53e3e',
                          border: '1px solid #e53e3e',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.6rem',
                          fontSize: '1rem',
                          lineHeight: 1,
                        }}
                      >{isInAnyWishlist(p._id) ? '♥' : '♡'}</button>
                    </div>
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__category">{p.category?.name}</div>
                    <h3 className="product-card__name">{p.name}</h3>
                    <div className="product-card__seller">
                      <span>🌱</span> {p.seller?.farmName || p.seller?.name}
                    </div>
                    <div className="product-card__footer">
                      <div className="product-card__price">
                        ₹{p.price}<span>/{p.isRental ? (p.rentalUnit === 'per_hour' ? 'hr' : 'day') : p.unit}</span>
                      </div>
                      {p.isRental
                        ? <span className="badge badge-amber">🚜 Rental</span>
                        : p.totalStock > 0
                          ? <span className="badge badge-green">In Stock</span>
                          : <span className="badge badge-red">Out of Stock</span>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Wishlist picker modal */}
      {wishlistModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setWishlistModal(null)}>
          <div className="card" style={{ minWidth: 320, maxWidth: 400, padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--green-900)' }}>Add to Wishlist</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Choose a wishlist:</p>
            {wishlists.map((l) => (
              <button key={l._id} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem', textAlign: 'left' }}
                onClick={() => addToWishlistFromModal(l._id, wishlistModal)}>
                ♡ {l.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({l.products.length} items)</span>
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }} onClick={() => setWishlistModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
