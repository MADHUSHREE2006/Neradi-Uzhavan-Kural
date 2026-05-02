import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">🌾</span>
          <span className="navbar__brand-text">
            <span className="navbar__brand-main">Neradi Uzhavan</span>
            <span className="navbar__brand-sub">Kural</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <NavLink to="/products" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            Shop
          </NavLink>
          {user?.role === 'seller' && (
            <NavLink to="/seller" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
              Seller Hub
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <NavLink to="/wishlist" className="navbar__icon-btn" title="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </NavLink>
              <NavLink to="/cart" className="navbar__icon-btn navbar__cart-btn" title="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
              </NavLink>
              <div className="navbar__user-menu">
                <button className="navbar__avatar">
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <div className="navbar__dropdown-name">{user.name}</div>
                    <div className="navbar__dropdown-role">{user.role}</div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link to="/orders" className="navbar__dropdown-item">My Orders</Link>
                  <Link to="/wallet" className="navbar__dropdown-item">Wallet</Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
