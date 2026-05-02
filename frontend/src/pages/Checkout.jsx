import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const FIELDS = [
  { key: 'fullName', label: 'Full Name', placeholder: 'Recipient name' },
  { key: 'phone', label: 'Phone', placeholder: '+91 XXXXX XXXXX' },
  { key: 'address', label: 'Address', placeholder: 'Street, Area' },
  { key: 'city', label: 'City', placeholder: 'City' },
  { key: 'state', label: 'State', placeholder: 'State' },
  { key: 'pinCode', label: 'PIN Code', placeholder: '6-digit PIN' },
];

export default function Checkout() {
  const { cart, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: '', phone: '', address: '', city: '', state: '', pinCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cart.items.map((i) => ({ product: i.product._id, quantity: i.quantity }));
      const { data } = await api.post('/orders', { items, shippingAddress: address, paymentMethod });
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="serif" style={{ marginBottom: '2rem', color: 'var(--green-900)' }}>Checkout</h1>
        <form onSubmit={handlePlaceOrder} className="checkout-layout">

          <div className="checkout-left">
            {/* Shipping */}
            <div className="checkout-section">
              <div className="checkout-section__header">
                <span className="checkout-step">1</span>
                <h2>Shipping Address</h2>
              </div>
              <div className="checkout-fields">
                {FIELDS.map((f) => (
                  <div className="form-group" key={f.key} style={f.key === 'address' ? { gridColumn: '1 / -1' } : {}}>
                    <label className="form-label">{f.label}</label>
                    <input
                      className="form-input" required
                      placeholder={f.placeholder}
                      value={address[f.key]}
                      onChange={(e) => setAddress({ ...address, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-section">
              <div className="checkout-section__header">
                <span className="checkout-step">2</span>
                <h2>Payment Method</h2>
              </div>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'wallet' ? 'payment-option--active' : ''}`}>
                  <input type="radio" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                  <div className="payment-option__icon">💳</div>
                  <div>
                    <div className="payment-option__title">Digital Wallet</div>
                    <div className="payment-option__sub">Balance: ₹{user?.walletBalance?.toFixed(2) || '0.00'}</div>
                  </div>
                  {paymentMethod === 'wallet' && <span className="payment-option__check">✓</span>}
                </label>
                <label className={`payment-option ${paymentMethod === 'cod' ? 'payment-option--active' : ''}`}>
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className="payment-option__icon">💵</div>
                  <div>
                    <div className="payment-option__title">Cash on Delivery</div>
                    <div className="payment-option__sub">Pay when you receive</div>
                  </div>
                  {paymentMethod === 'cod' && <span className="payment-option__check">✓</span>}
                </label>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="checkout-summary">
            <div className="checkout-summary__title">
              <span className="checkout-step">3</span>
              <h2>Order Summary</h2>
            </div>
            <div className="checkout-items">
              {cart.items.map((item) => (
                <div key={item.product?._id} className="checkout-item">
                  <img
                    src={item.product?.images?.[0] || `https://placehold.co/56x56/e8f5e9/2e7d32?text=?`}
                    alt={item.product?.name}
                    className="checkout-item__img"
                  />
                  <div className="checkout-item__info">
                    <div className="checkout-item__name">{item.product?.name}</div>
                    <div className="checkout-item__qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="checkout-item__price">₹{(item.product?.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <div className="checkout-summary__row"><span>Delivery</span><span style={{ color: 'var(--green-600)', fontWeight: 600 }}>Free</span></div>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__total"><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <button className="btn btn-primary btn-full" style={{ marginTop: '1.5rem', padding: '0.85rem' }} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : `Place Order · ₹${cartTotal.toFixed(2)}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
