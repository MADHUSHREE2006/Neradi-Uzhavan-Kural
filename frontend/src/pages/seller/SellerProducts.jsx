import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Seller.css';

const emptyForm = { name: '', description: '', category: '', price: '', unit: 'kg', stockByPin: [{ pinCode: '', quantity: '' }] };

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = () => api.get('/products/seller/my').then((r) => setProducts(r.data));

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/products/${editing}`, form); toast.success('Product updated'); }
      else { await api.post('/products', form); toast.success('Product created'); }
      setForm(emptyForm); setEditing(null); setShowForm(false); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`); toast.success('Deleted'); fetchProducts();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', category: p.category?._id || '', price: p.price, unit: p.unit, stockByPin: p.stockByPin.length ? p.stockByPin : [{ pinCode: '', quantity: '' }] });
    setEditing(p._id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updatePin = (i, field, val) => {
    const pins = [...form.stockByPin];
    pins[i] = { ...pins[i], [field]: val };
    setForm({ ...form, stockByPin: pins });
  };

  const removePin = (i) => setForm({ ...form, stockByPin: form.stockByPin.filter((_, idx) => idx !== i) });

  return (
    <div className="seller-page">
      <div className="seller-header">
        <div className="container">
          <div className="seller-header__inner">
            <div>
              <h1 className="serif">My Products</h1>
              <p>{products.length} products listed</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }}>
              {showForm ? '✕ Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>
      </div>

      <div className="container seller-content">
        {/* Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--green-900)' }}>
              {editing ? '✏️ Edit Product' : '🌱 New Product'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="seller-form-grid" style={{ marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input className="form-input" required placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input className="form-input" type="number" required min="0" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'quintal', 'bundle'].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Describe your product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Stock by PIN Code</label>
                {form.stockByPin.map((s, i) => (
                  <div key={i} className="pin-row">
                    <input className="form-input" placeholder="PIN Code (e.g. 600001)" value={s.pinCode} onChange={(e) => updatePin(i, 'pinCode', e.target.value)} />
                    <input className="form-input pin-qty" type="number" placeholder="Qty" min="0" value={s.quantity} onChange={(e) => updatePin(i, 'quantity', e.target.value)} />
                    {form.stockByPin.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removePin(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, stockByPin: [...form.stockByPin, { pinCode: '', quantity: '' }] })}>
                  + Add PIN Code
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn btn-primary">{editing ? 'Update Product' : 'Create Product'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌾</div>
            <h3>No products yet</h3>
            <p>Start by adding your first product listing</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Product</button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id} className="card card-hover" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{p.name}</h3>
                    <span className="tag">{p.category?.name}</span>
                  </div>
                  <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green-700)' }}>₹{p.price}/{p.unit}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock: {p.totalStock} {p.unit}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
