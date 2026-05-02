# Neradi Uzhavan Kural — F2C Agricultural Marketplace

MERN stack implementation of Phase 1 (Core Marketplace MVP).

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000  
Backend API on http://localhost:5000

## Roles
- **Customer** — browse, cart, checkout, wallet, wishlist, order tracking
- **Seller** — register (pending approval), list products with PIN-based stock, manage orders
- **Admin** — approve/block sellers, manage categories, view all orders & stock

## Seeding an Admin
Use MongoDB shell or Compass to set a user's role to `"admin"` directly.
