# FloraDesigner — API Documentation

**Base URL:** `http://localhost:5000/api`

**Content-Type:** `application/json` for all request bodies.

> For the full presentation script and demo flow see [DEMO_GUIDE.md](./DEMO_GUIDE.md).

---

## Architecture Overview

The backend is a Node.js + Express REST API with the following layers:

```
server.js               — Express app, CORS, JSON parsing, mounts /api
routes/index.js         — Registers all sub-routers under /api
routes/*.js             — Route definitions per resource
middleware/
  requireDatabase.js    — Returns 503 if MongoDB is not connected
  requireAdmin.js       — Validates signed X-Admin-Key admin token and expiry
controllers/*.js        — Business logic, Mongoose calls, HTTP responses
models/*.js             — Mongoose schemas (see Collections section)
config/db.js            — mongoose.connect() using MONGO_URI
```

The API is stateless. Admin identity is proven per-request via a custom header — no sessions or cookies.

---

## Authentication

### Public routes
No authentication required. Any client can call them.

### Admin-protected routes
These routes require the header:
```
X-Admin-Key: <signed-admin-token>
```

**How to get the token:**

`POST /api/auth/admin/login` validates the submitted username and password against server environment variables. The preferred password setting is `ADMIN_PASSWORD_HASH` (PBKDF2); `ADMIN_PASSWORD` remains as a simple demo fallback when no hash is configured. On success the backend returns a signed short-lived admin token and `expiresAt`. The frontend stores this in `sessionStorage` and attaches it to every subsequent admin request.

The token is signed server-side and checked for expiry by `requireAdmin`. This remains a single-admin demo authentication system, not a complete customer account system.

---

## Endpoint Reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Server + database connectivity check |
| GET | `/api/products` | Public | Return all products, newest first |
| GET | `/api/products/:id` | Public | Return single product by MongoDB `_id` |
| POST | `/api/products` | Admin | Create a new product |
| PUT | `/api/products/:id` | Admin | Update an existing product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| GET | `/api/orders` | Public | Return all orders, newest first |
| GET | `/api/orders/:id` | Public | Return single order by MongoDB `_id` |
| POST | `/api/orders` | Public | Place a new order |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/contact` | Public | Submit a contact message |
| GET | `/api/contact` | Admin | Read all contact messages |
| POST | `/api/auth/admin/login` | Public | Validate credentials, return admin token |
| POST | `/api/designer/generate` | Public | Generate AI bouquet design (Gemini or simulated fallback) |
| POST | `/api/designer/save` | Public | Save selected design to database |
| GET | `/api/designer/designs` | Public | List all saved generated designs |
| GET | `/api/designer/designs/:id` | Public | Get a single generated design |

---

## Request & Response Examples

### GET /api/health

**Response 200:**
```json
{
  "status": "ok",
  "message": "FloraDesigner API is running",
  "database": "connected",
  "timestamp": "2026-06-16T12:00:00.000Z"
}
```
`database` is `"connected"` when Mongoose `readyState === 1`, otherwise `"offline"`.

---

### GET /api/products

**Response 200** — array of product documents:
```json
[
  {
    "_id": "6657a1f2e4b0c3a2d1e5f789",
    "name": "Rose Romance",
    "description": "A timeless arrangement of fresh red roses...",
    "price": 120,
    "category": "Romantic",
    "colors": ["Red", "Cream"],
    "flowers": ["Roses", "Baby's Breath"],
    "size": "Large",
    "occasion": "Anniversary",
    "imageUrl": "https://images.unsplash.com/...",
    "available": true,
    "deliveryInfo": "Same-day delivery available before 2 PM.",
    "createdAt": "2026-06-16T10:00:00.000Z",
    "updatedAt": "2026-06-16T10:00:00.000Z"
  }
]
```

---

### POST /api/auth/admin/login

**Request body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "token": "admin123",
  "username": "admin"
}
```

**Response 401** (wrong credentials):
```json
{ "message": "Invalid admin credentials." }
```

The returned `token` is a signed admin session token. Send it as `X-Admin-Key` on all subsequent admin requests.

---

### POST /api/products *(Admin)*

**Header:** `X-Admin-Key: <token>`

**Request body:**
```json
{
  "name": "Spring Garden",
  "description": "A fresh spring arrangement with tulips and daisies.",
  "price": 90,
  "category": "Seasonal",
  "colors": ["Pink", "Yellow"],
  "flowers": ["Tulips", "Daisies"],
  "size": "Medium",
  "occasion": "Birthday",
  "imageUrl": "https://images.unsplash.com/photo-example",
  "available": true,
  "deliveryInfo": "Next-day delivery."
}
```

**Response 201** — the created product document with `_id`, `createdAt`, `updatedAt`.

---

### PUT /api/products/:id *(Admin)*

**Header:** `X-Admin-Key: <token>`

**Request body** (send only fields to update):
```json
{
  "price": 95,
  "available": false
}
```

**Response 200** — the updated product document.

**Response 404:**
```json
{ "message": "Product not found" }
```

---

### POST /api/orders

**Request body:**
```json
{
  "customerName": "Ana Beridze",
  "phone": "+995 555 123 456",
  "address": "Tbilisi, Rustaveli Ave 1",
  "deliveryDate": "2026-06-20",
  "deliveryTime": "14:00 - 16:00",
  "paymentMethod": "Cash on Delivery",
  "note": "Please add a greeting card.",
  "totalPrice": 120,
  "orderType": "ready-made",
  "items": [
    {
      "id": "6657a1f2e4b0c3a2d1e5f789",
      "name": "Rose Romance",
      "price": 120,
      "quantity": 1,
      "category": "Romantic",
      "itemType": "ready-made",
      "imageUrl": "https://images.unsplash.com/..."
    }
  ]
}
```

**Response 201** — the saved order document with `_id`, `status: "Pending"`, `createdAt`.

---

### PUT /api/orders/:id/status *(Admin)*

**Header:** `X-Admin-Key: <token>`

**Request body:**
```json
{ "status": "Preparing" }
```

Valid status values used by the frontend: `Pending`, `Preparing`, `Ready`, `Delivered`, `Cancelled`.

**Response 200** — the updated order document.

---

### POST /api/contact

**Request body:**
```json
{
  "name": "Giorgi Tabatadze",
  "email": "giorgi@example.com",
  "message": "Do you deliver to Kutaisi?"
}
```

**Response 201:**
```json
{
  "_id": "6657b2c3e4b0c3a2d1e5f890",
  "name": "Giorgi Tabatadze",
  "email": "giorgi@example.com",
  "message": "Do you deliver to Kutaisi?",
  "createdAt": "2026-06-16T12:00:00.000Z"
}
```

**Response 400** (missing field):
```json
{ "message": "Name is required." }
```

---

### POST /api/designer/generate

**Request body** (all fields optional):
```json
{
  "occasion": "Birthday",
  "style": "Romantic",
  "preferredFlowers": ["Roses", "Peonies"],
  "preferredColors": ["Pink", "White"],
  "bouquetSize": "Medium",
  "wrappingStyle": "Kraft paper",
  "description": "Something soft and elegant for my mother."
}
```

**Response 200:**
```json
{
  "prompt": "Romantic style, Medium bouquet, in Pink and White tones, featuring Roses, Peonies, for Birthday, wrapped in Kraft paper, Something soft and elegant for my mother.",
  "images": [
    "https://images.unsplash.com/photo-1518621736915...",
    "https://images.unsplash.com/photo-1591886960571..."
  ],
  "estimatedPrice": 105,
  "imageSource": "simulated"
}
```

`imageSource` is `"gemini"` when real Gemini generation succeeds, `"simulated"` when the fallback pool is used.

`estimatedPrice` is calculated as `BASE_PRICES[size] * STYLE_MULTIPLIERS[style]`, rounded to the nearest whole GEL:

| Size | Base price |
|---|---|
| Small | ₾65 |
| Medium | ₾95 |
| Large | ₾130 |
| Extra Large | ₾160 |

Style multipliers: Luxury ×1.2, Romantic ×1.1, Classic ×1.05, others ×1.0.

---

## MongoDB Collections

| Collection | Mongoose Model | Purpose |
|---|---|---|
| `products` | `Product` | Bouquet catalog — name, price, category, colors, flowers, size, occasion, availability |
| `orders` | `Order` | Customer orders — delivery info, items array, total, status, orderType |
| `contactmessages` | `ContactMessage` | Contact form submissions — name, email, message |
| `generateddesigns` | `GeneratedDesign` | AI designer sessions — prompt, generated image URLs, selected image, preferences, estimated price |

All collections use Mongoose `timestamps: true`, which adds `createdAt` and `updatedAt` fields automatically.

---

## AI Image Generation (Gemini)

The `POST /api/designer/generate` endpoint follows this decision chain:

```
GEMINI_API_KEY present in environment?
  YES → attempt Gemini 2.5 Flash image generation
          success → return base64 data URL, imageSource: "gemini"
          fail / quota exceeded → fall through
  NO  ↓
      → pick 3 random images from the curated Unsplash pool (8 images)
      → return imageSource: "simulated"
```

The fallback is intentional and seamless — the frontend displays both Gemini and simulated images identically. For the demo, simulated images are expected and acceptable when Gemini quota is not active.

**The `GEMINI_API_KEY` is never sent to the browser.** All Gemini calls are server-side only.

---

## Known API Limitations

| Limitation | Detail |
|---|---|
| Admin authentication | Server-side admin login, optional PBKDF2 password hash, and signed expiring admin token. Still single-admin demo auth, not customer authentication. |
| Payment processing | All payment methods (Cash on Delivery, Demo Card, Bank Transfer) are simulated. No payment gateway is integrated. |
| Gemini quota | Real AI image generation requires a Gemini API key with active quota or billing enabled. Without it the app uses simulated images automatically. |
| No customer accounts | Orders are not tied to a logged-in user. Order history is stored per browser in `localStorage` on the frontend. |
| No pagination | `GET /api/products` and `GET /api/orders` return all documents. Suitable for a demo catalog of 12 products. |
| No input sanitization | Basic required-field validation only. Not production-hardened against injection or large payloads. |
