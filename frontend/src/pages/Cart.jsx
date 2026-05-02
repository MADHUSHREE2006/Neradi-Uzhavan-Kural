import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, updateItem, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!cart.items.length)
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some fresh produce from our farmers</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <h1 className="serif" style={{ marginBottom: '2rem', color: 'var(--green-900)' }}>Shopping Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.product?._id} className="cart-item">
                <img
                  src={item.product?.images?.[0] || `https://placehold.co/100x100/e8f5e9/2e7d32?text=${encodeURIComponent(item.product?.name || '?')}`}
                  alt={item.product?.name}
                  className="cart-item__img"
                />
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.product?.name}</h3>
                  <p className="cart-item__unit">per {item.product?.unit}</p>
                </div>
                <div className="cart-item__qty">
                  <button className="qty-btn" onClick={() => updateItem(item.product._id, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateItem(item.product._id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item__price">₹{(item.product?.price * item.quantity).toFixed(2)}</div>
                <button className="cart-item__remove" onClick={() => updateItem(item.product._id, 0)} title="Remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary__title">Order Summary</div>
            <div className="cart-summary__row">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Delivery</span>
              <span className="text-green">Free</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__total">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: '1.25rem' }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
            <button className="btn btn-ghost btn-full" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
