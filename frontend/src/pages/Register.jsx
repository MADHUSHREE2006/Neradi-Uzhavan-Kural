import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', farmName: '', pinCode: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created successfully!');
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side__content">
          <div className="auth-side__logo">🌱</div>
          <h2 className="serif">Join India's Largest Farm-to-Consumer Network</h2>
          <p>Whether you're a farmer looking to sell or a consumer seeking fresh produce — you're in the right place.</p>
          <div className="auth-side__features">
            <div className="auth-side__feature"><span>🆓</span> Free to register</div>
            <div className="auth-side__feature"><span>✅</span> Verified & trusted platform</div>
            <div className="auth-side__feature"><span>📦</span> Real-time order tracking</div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1 className="serif">Create Account</h1>
            <p>Join thousands of farmers and consumers</p>
          </div>

          {/* Role toggle */}
          <div className="role-toggle">
            {[{ value: 'customer', icon: '🛒', label: 'I\'m a Buyer' }, { value: 'seller', icon: '🚜', label: 'I\'m a Farmer' }].map((r) => (
              <label key={r.value}>
                <input type="radio" name="role" value={r.value} className="role-option" checked={role === r.value} onChange={() => setRole(r.value)} />
                <span className="role-label">
                  <span className="role-label-icon">{r.icon}</span>
                  <span className="role-label-text">{r.label}</span>
                </span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required placeholder="Your full name" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" required placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <input className="form-input" type={showPass ? 'text' : 'password'} required minLength={6} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {role === 'seller' && (
              <div className="seller-fields">
                <div className="seller-fields-title">Farm Details</div>
                <div className="form-group">
                  <label className="form-label">Farm / Business Name</label>
                  <input className="form-input" required value={form.farmName} onChange={set('farmName')} placeholder="e.g. Ravi's Organic Farm" />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input className="form-input" required value={form.pinCode} onChange={set('pinCode')} placeholder="6-digit PIN code" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Farm Address</label>
                  <textarea className="form-input" rows={2} value={form.address} onChange={set('address')} placeholder="Village, District, State" />
                </div>
                <div className="seller-note">
                  <span>⚠️</span>
                  <span>Seller accounts require admin approval before you can list products. You'll be notified once approved.</span>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{ marginTop: '0.75rem' }} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : `Create ${role === 'seller' ? 'Seller' : ''} Account`}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
