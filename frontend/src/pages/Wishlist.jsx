import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function Wishlist() {
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const fetchLists = () => api.get('/wishlist').then((r) => setLists(r.data));
  useEffect(() => { fetchLists(); }, []);

  const createList = async () => {
    if (!newName.trim()) return;
    await api.post('/wishlist', { name: newName });
    setNewName(''); fetchLists();
    toast.success('Wishlist created');
  };

  const removeProduct = async (listId, productId) => {
    await api.delete(`/wishlist/${listId}/remove/${productId}`);
    toast.success('Removed'); fetchLists();
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="serif" style={{ marginBottom: '2rem', color: 'var(--green-900)' }}>My Wishlists</h1>

        {/* Create new */}
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">New Wishlist Name</label>
            <input
              className="form-input" placeholder="e.g. Weekly Vegetables"
              value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createList()}
            />
          </div>
          <button className="btn btn-primary" onClick={createList}>Create</button>
        </div>

        {lists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♡</div>
            <h3>No wishlists yet</h3>
            <p>Create a wishlist to save your favourite products</p>
          </div>
        ) : lists.map((list) => (
          <div key={list._id} className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--green-900)' }}>
                ♡ {list.name}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {list.products.length} item{list.products.length !== 1 ? 's' : ''}
                </span>
              </h3>
            </div>

            {list.products.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No products saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {list.products.map((p) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                    <img
                      src={p.images?.[0] || `https://placehold.co/56x56/e8f5e9/2e7d32?text=?`}
                      alt={p.name}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${p._id}`)}
                    />
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/products/${p._id}`)}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.name}</div>
                      <div style={{ color: 'var(--green-600)', fontWeight: 700, fontSize: '0.9rem' }}>₹{p.price}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => removeProduct(list._id, p._id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
