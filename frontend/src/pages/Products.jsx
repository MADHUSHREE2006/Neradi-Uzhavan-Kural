import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const category = searchParams.get('category') || '';

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
                        ₹{p.price}<span>/{p.unit}</span>
                      </div>
                      {p.totalStock > 0
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
    </div>
  );
}
