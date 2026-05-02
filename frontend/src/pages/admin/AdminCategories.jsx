import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', parent: '' });

  const fetchCategories = () => api.get('/categories').then((r) => setCategories(r.data));
  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { ...form, parent: form.parent || null });
      toast.success('Category created');
      setForm({ name: '', slug: '', parent: '' });
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Deleted');
    fetchCategories();
  };

  const roots = categories.filter((c) => !c.parent);
  const subs = categories.filter((c) => c.parent);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="serif">Category Management</h1>
          <p>Manage product categories and subcategories</p>
        </div>
      </div>
      <div className="container admin-content" style={{ maxWidth: 800 }}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--green-900)' }}>Add New Category</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input className="form-input" required placeholder="e.g. Fresh Produce" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slug</label>
                <input className="form-input" required placeholder="e.g. fresh-produce" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Parent (optional)</label>
                <select className="form-input" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                  <option value="">None (Root)</option>
                  {roots.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{ height: 42 }}>Add</button>
            </div>
          </form>
        </div>

        <h3 className="admin-section-title">Root Categories</h3>
        {roots.map((c) => (
          <div key={c._id} style={{ marginBottom: '0.5rem' }}>
            <div className="seller-card" style={{ marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '1.25rem' }}>🗂️</div>
              <div className="seller-info">
                <div className="seller-name">{c.name}</div>
                <div className="seller-meta">/{c.slug}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
            </div>
            {subs.filter((s) => s.parent?._id === c._id || s.parent === c._id).map((sub) => (
              <div key={sub._id} className="seller-card" style={{ marginLeft: '2rem', marginBottom: '0.25rem', background: 'var(--cream)' }}>
                <div style={{ fontSize: '1rem' }}>↳</div>
                <div className="seller-info">
                  <div className="seller-name" style={{ fontSize: '0.9rem' }}>{sub.name}</div>
                  <div className="seller-meta">/{sub.slug}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sub._id)}>Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
