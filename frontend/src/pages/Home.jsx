import { Link } from 'react-router-dom';
import './Home.css';

const categories = [
  { name: 'Fresh Produce', emoji: '🥦', slug: 'fresh-produce', desc: 'Vegetables & Fruits' },
  { name: 'Grains & Pulses', emoji: '🌾', slug: 'grains', desc: 'Rice, Wheat & Dal' },
  { name: 'Farm Tools', emoji: '🔧', slug: 'tools', desc: 'Equipment & Machinery' },
  { name: 'Dairy & Eggs', emoji: '🥛', slug: 'dairy', desc: 'Fresh from the farm' },
  { name: 'Spices', emoji: '🌶️', slug: 'spices', desc: 'Authentic flavours' },
  { name: 'Organic', emoji: '🌿', slug: 'organic', desc: 'Certified natural' },
];

const features = [
  { icon: '🚜', title: 'Direct from Farmers', desc: 'No middlemen. Buy straight from the source and support local agriculture.' },
  { icon: '📍', title: 'Hyperlocal Delivery', desc: 'PIN code–based availability ensures you get the freshest produce nearby.' },
  { icon: '💳', title: 'Instant Wallet', desc: 'Pay and get refunds instantly with your built-in digital wallet.' },
  { icon: '🔒', title: 'Verified Sellers', desc: 'Every farmer and vendor is admin-verified before listing products.' },
];

const stats = [
  { value: '10,000+', label: 'Farmers Onboarded' },
  { value: '50+', label: 'Cities Covered' },
  { value: '2L+', label: 'Orders Delivered' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function Home() {
  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg-pattern" />
        <div className="container hero__content">
          <div className="hero__text">
            <span className="hero__eyebrow">Farm to Consumer · Direct</span>
            <h1 className="hero__title serif">
              Fresh from the<br />
              <span className="hero__title-accent">Farm, Straight</span><br />
              to Your Table
            </h1>
            <p className="hero__desc">
              Neradi Uzhavan Kural connects farmers across India directly with consumers.
              No middlemen, fair prices, and the freshest produce delivered to your door.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Shop Now
              </Link>
              <Link to="/register" className="btn btn-ghost btn-lg">
                Sell on Platform →
              </Link>
            </div>
            <div className="hero__trust">
              <span className="hero__trust-item">✓ Free registration</span>
              <span className="hero__trust-item">✓ Secure payments</span>
              <span className="hero__trust-item">✓ Real-time tracking</span>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__card hero__card--main">
              <div className="hero__card-emoji">🥬</div>
              <div>
                <div className="hero__card-title">Fresh Spinach</div>
                <div className="hero__card-sub">Ravi's Organic Farm · Chennai</div>
              </div>
              <div className="hero__card-price">₹45/kg</div>
            </div>
            <div className="hero__card hero__card--secondary">
              <div className="hero__card-emoji">🌾</div>
              <div>
                <div className="hero__card-title">Basmati Rice</div>
                <div className="hero__card-sub">Punjab Harvest Co.</div>
              </div>
              <div className="hero__card-price">₹120/kg</div>
            </div>
            <div className="hero__badge-float hero__badge-float--1">
              <span>🚚</span> Delivered in 24h
            </div>
            <div className="hero__badge-float hero__badge-float--2">
              <span>⭐</span> 4.9 Rating
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="home-stats">
        <div className="container">
          <div className="home-stats__grid">
            {stats.map((s) => (
              <div key={s.label} className="home-stats__item">
                <div className="home-stats__value serif">{s.value}</div>
                <div className="home-stats__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="home-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore fresh produce, grains, tools and more — all sourced directly from farmers.</p>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="category-card">
                <div className="category-card__emoji">{cat.emoji}</div>
                <div className="category-card__name">{cat.name}</div>
                <div className="category-card__desc">{cat.desc}</div>
                <div className="category-card__arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-section home-section--alt">
        <div className="container">
          <h2 className="section-title">Why Neradi Uzhavan Kural?</h2>
          <p className="section-subtitle">Built for India's farmers and consumers — transparent, fair, and local.</p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="container">
          <div className="home-cta__inner">
            <div className="home-cta__text">
              <h2 className="serif">Are you a Farmer or Vendor?</h2>
              <p>Join thousands of sellers already earning more by selling directly to consumers across India.</p>
            </div>
            <Link to="/register" className="btn btn-amber btn-lg">
              Start Selling Today →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
