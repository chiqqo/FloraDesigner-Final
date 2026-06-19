# FloraDesigner

A full-stack AI-assisted bouquet marketplace built as a bachelor graduation project. FloraDesigner demonstrates a complete e-commerce workflow — from browsing a curated catalog and AI-assisted custom bouquet design, through cart and checkout, to order history and admin management.

> For the presentation script, demo credentials, and step-by-step demo flow see [DEMO_GUIDE.md](./DEMO_GUIDE.md).
> For the full REST API reference, request/response examples, and MongoDB schema overview see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## Documentation

| Document | Description |
|---|---|
| [TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md) | Bachelor project technical report — architecture, database design, API design, AI strategy, testing, security, and diagrams |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Full REST API reference — all endpoints, request/response examples, Mongoose schemas |
| [USER_MANUAL.md](./USER_MANUAL.md) | Step-by-step user manual — setup, customer flow, admin flow, Gemini behavior, MongoDB behavior, troubleshooting |
| [DEMO_GUIDE.md](./DEMO_GUIDE.md) | Presentation script — demo credentials, suggested demo order, known limitations |

---

## Features

- **Bilingual UI** — Georgian (default) and English, switchable via the Navbar toggle. Language preference persists in `localStorage`.
- **Product catalog** — 12 handcrafted bouquets with search and filters (category, color, flower type, size, occasion, price range, in-stock).
- **Product detail pages** — image, description, metadata, quantity selector, add to cart.
- **AI Bouquet Designer** — choose occasion, style, size, flowers, colors, and wrapping; the backend generates a design via Gemini if an API key is present, or falls back to curated simulated images automatically.
- **Cart** — add/remove items, adjust quantities, order summary.
- **Checkout** — delivery form, three simulated payment methods (no real transactions).
- **Order success & history** — order confirmation, full order history with status badges and expandable detail panels.
- **Contact form** — saves to MongoDB when connected, falls back to `localStorage`.
- **Admin dashboard** — view orders, update statuses, read contact messages.
- **Admin product management** — add, edit, and delete bouquets.
- **GEL currency** — all prices in Georgian Lari (₾60–₾200). Georgian display: `₾120`. English display: `120 GEL`.
- **Offline fallback** — every feature degrades gracefully to `localStorage` when the backend is unavailable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State / i18n | React Context API (`CartContext`, `LanguageContext`) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI image generation | Google Gemini API (optional, server-side only) |
| Offline fallback | `localStorage` |

---

## Project Structure

```
FloraDesigner/
├── backend/
│   ├── controllers/       # Express route handlers
│   ├── middleware/        # requireAdmin, requireDatabase
│   ├── models/            # Mongoose schemas (Product, Order, GeneratedDesign, ContactMessage)
│   ├── routes/            # API route definitions
│   ├── config/            # MongoDB connection
│   ├── server.js          # Express entry point
│   ├── seedProducts.js    # Seeds 12 demo products (deletes existing first)
│   ├── .env               # Real secrets — never commit (covered by .gitignore)
│   └── .env.example       # Variable names only, safe to commit
└── frontend/
    ├── src/
    │   ├── context/       # CartContext, LanguageContext (translations + currency)
    │   ├── pages/         # All page components
    │   ├── components/    # Navbar, Layout, shared components
    │   ├── data/          # products.js (local fallback data)
    │   ├── services/      # api.js (all fetch calls to backend)
    │   └── utils/         # imageFallback.js
    ├── index.html
    └── vite.config.js     # Dev proxy: /api → http://localhost:5000
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB — either [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) or a local MongoDB Community Server

### 1 — Clone

```bash
git clone <your-repo-url>
cd FloraDesigner
```

### 2 — Backend

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/floradesigner
CLIENT_ORIGIN=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_PASSWORD_HASH=
ADMIN_TOKEN_SECRET=some-long-random-secret
ADMIN_API_KEY=legacy-fallback-key
ALLOW_LEGACY_ADMIN_KEY=false
GEMINI_API_KEY=           # optional — omit to use simulated images
```

Start the backend:

```bash
npm run dev      # development (nodemon)
npm start        # production / demo machine
```

The API runs on **http://localhost:5000**.

### 3 — Seed the database

```bash
npm run seed
```

This inserts 12 demo bouquets. **Warning:** it calls `Product.deleteMany({})` first, so any previously inserted products are removed.

### 4 — Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

The Vite dev proxy forwards all `/api` requests to `http://localhost:5000` automatically.

---

## Environment Variables

All backend secrets live in `backend/.env`. The frontend has no `.env` file — it communicates with the backend only through the Vite proxy (dev) or the same origin (production build). **The `GEMINI_API_KEY` never reaches the browser.**

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port, default `5000` |
| `MONGO_URI` | Yes | MongoDB connection string (Atlas or local) |
| `CLIENT_ORIGIN` | No | CORS allowed origin, default `http://localhost:3000` |
| `ADMIN_USERNAME` | Yes | Username for `POST /api/auth/admin/login` |
| `ADMIN_PASSWORD` | Yes* | Demo fallback password for admin login |
| `ADMIN_PASSWORD_HASH` | No | Preferred PBKDF2 password hash generated with `npm run hash-admin-password -- "password"` |
| `ADMIN_TOKEN_SECRET` | Yes | Secret used to sign short-lived admin tokens |
| `ADMIN_API_KEY` | Yes | Legacy fallback secret; also used if `ADMIN_TOKEN_SECRET` is not set |
| `ALLOW_LEGACY_ADMIN_KEY` | No | Set to `true` only if static admin-key compatibility is needed |
| `GEMINI_API_KEY` | No | Google Gemini API key for real AI image generation; omit to use simulated images |

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Database connectivity check |
| GET | `/api/products` | — | List all products |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/orders` | — | List all orders |
| POST | `/api/orders` | — | Create order |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/designer/generate` | — | Generate AI bouquet design |
| POST | `/api/designer/save` | — | Save selected design |
| GET | `/api/designer` | Admin | List generated designs |
| POST | `/api/contact` | — | Submit contact message |
| GET | `/api/contact` | Admin | Read contact messages |
| POST | `/api/auth/admin/login` | — | Admin login, returns signed short-lived admin token |

Admin routes require the `X-Admin-Key: <signed admin token>` header.

---

## Frontend Pages

| Path | Page |
|---|---|
| `/` | Home |
| `/products` | Product catalog with filters |
| `/products/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Delivery form + payment |
| `/order-success` | Order confirmation |
| `/orders` | Order history |
| `/designer` | AI Bouquet Designer |
| `/contact` | Contact form |
| `/about` | About / tech stack |
| `/admin` | Admin login |
| `/admin/dashboard` | Admin order management |
| `/admin/products` | Admin product management |

---

## Admin Access

Navigate to `/admin` and sign in with the credentials set in `backend/.env`.

Default demo values (change before any public deployment):

| Field | Default |
|---|---|
| Username | `admin` |
| Password | `admin123` |

The backend validates credentials server-side and returns a signed admin token with an expiry time. The frontend stores it in `sessionStorage` and sends it as `X-Admin-Key` on all admin API requests. The backend verifies the token signature and expiry on every protected route. Passwords can use `ADMIN_PASSWORD_HASH` for PBKDF2 hashing, while `ADMIN_PASSWORD` remains as a simple demo fallback.

---

## AI Image Generation

The backend tries Gemini image generation when `GEMINI_API_KEY` is set and quota is available. If the key is missing, Gemini is unavailable, quota is exhausted, or generation fails for any reason, the app automatically falls back to a pool of curated Unsplash bouquet images. The fallback is seamless and expected during demos without active billing.

---

## Currency

All prices are in Georgian Lari (GEL). Range: ₾60 – ₾190.

- Georgian language: `₾120`
- English language: `120 GEL`

No dollar signs appear anywhere in the UI. Backend stores prices as plain numbers.

---

## Known Limitations

| Area | Detail |
|---|---|
| Authentication | Server-side admin login with signed expiring tokens and optional PBKDF2 password hash. Still single-admin demo auth, not a full customer account system. |
| Payment | All payment methods are simulated. No real transactions occur. |
| AI generation | Requires a Gemini API key with active quota. Falls back to simulated images otherwise. |
| Customer accounts | No registration or login. Order history is per-browser via `localStorage`. |
| Data persistence | Without a running MongoDB instance, orders and products fall back to `localStorage` automatically. |

---

## Scripts

### Backend

```bash
npm run dev    # Start with nodemon (auto-restart on change)
npm start      # Start with plain node
npm run seed   # Delete existing products and insert 12 demo bouquets
npm run smoke  # Run smoke tests against the running backend (requires server on port 5000)
```

### Frontend

```bash
npm run dev      # Vite dev server on port 3000
npm run build    # Production build → frontend/dist/
npm run preview  # Preview the production build locally
```
