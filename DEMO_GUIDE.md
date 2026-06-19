# FloraDesigner - Presentation & Demo Guide

Bachelor Graduation Project

---

## 1. Project Overview

**FloraDesigner** is a full-stack AI-assisted bouquet marketplace built as a bachelor graduation project. It demonstrates a complete e-commerce workflow for an online flower shop, combining a curated ready-made product catalog with an AI-assisted bouquet designer featuring optional Gemini image generation and reliable simulated fallback images.

### Problem it solves

Buying flowers online is often generic - customers must choose from fixed catalog items that may not match their specific occasion, color preference, or style. FloraDesigner addresses this by letting customers either browse a curated catalog with detailed filters or describe their ideal bouquet in natural language and receive a custom design concept with a price estimate.

### Main idea

- **Ready-made shopping**: browse, filter, view details, and add handcrafted bouquets to cart.
- **AI bouquet designer**: describe an occasion, preferred flowers, colors, and style; the backend optionally generates a real image via Gemini, or falls back to curated bouquet images. Includes an estimated price.
- **Full order flow**: cart, checkout with delivery details and simulated payment, order history with status tracking.
- **Admin management**: manage orders and the product catalog from a dedicated admin dashboard.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| State | React Context API (CartContext) |
| Persistence fallback | localStorage (when backend is offline) |
| Gemini API | Optional server-side image generation (requires API key and quota) |
| Image fallback pool | Curated Unsplash images used when Gemini is unavailable |

**AI image generation**: The backend tries Gemini image generation when GEMINI_API_KEY is set and quota is available. If Gemini is missing, unavailable, out of quota, or fails for any reason, the app automatically falls back to curated simulated bouquet images. For this demo, fallback images are expected and acceptable.

**Payment processing** is simulated - no real transactions occur.

---

## 3. How to Run the Project

### Prerequisites

- Node.js installed
- MongoDB available - either MongoDB Atlas (cloud) or a local MongoDB Community Server. The backend reads the connection string from MONGO_URI in backend/.env.

### Backend

```bash
cd backend
npm install
npm run dev        # starts with nodemon on port 5000
```

To seed the database with sample products:

```bash
npm run seed
```

To start without nodemon (e.g. for a demo machine without devDependencies):

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts Vite dev server on port 3000
```

Open: **http://localhost:3000**

The Vite dev proxy forwards `/api` requests to `http://localhost:5000`, so the frontend and backend talk automatically when both are running.

### Demo without backend

If MongoDB is unavailable, the backend API still starts and serves requests. The frontend detects backend failures and falls back to:
- localStorage for orders and product management
- Hardcoded mock product data for the catalog
- All features remain functional for demonstration purposes

If the backend itself is not running, the frontend localStorage fallback activates automatically and the demo remains fully navigable.

---

## 4. Demo Credentials

### Admin Login

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

**How it works:** Admin credentials are submitted to the backend route `POST /api/auth/admin/login`. The backend validates the username and password against values set in environment variables, then returns a signed admin token with an expiry time. The frontend stores the token in sessionStorage and sends it as the `X-Admin-Key` header on admin-only API requests. Product create, edit, and delete; order status updates; and reading contact messages are all protected by this backend token check.

This is bachelor-project-level admin authentication. It includes server-side validation, optional PBKDF2 password hashing, signed expiring admin tokens, and protected backend routes. It is still not a full production identity system because there are no customer accounts, password reset flow, or role hierarchy.

Admin panel URL: **http://localhost:3000/admin**

---

## 5. Customer Demo Flow

### Step 1 - Home page (`/`)

- Show the hero section and the "Featured Arrangements" grid.
- Point out the two main actions: **Browse Bouquets** and **Try AI Designer**.
- Scroll down to show the "How AI Bouquet Design Works" steps and the "Why FloraDesigner?" benefits section.

### Step 2 - Products page (`/products`)

- Show the full catalog grid (8 bouquets).
- Demonstrate the search bar (search "rose" or "wedding").
- Use the filters: Category, Color, Flower Type, Size, Occasion, Price Range.
- Check "In-stock only" to filter unavailable items.
- Clear filters and show all products.

### Step 3 - Product details (`/products/:id`)

- Click "View Details" on any bouquet.
- Show the image, description, flower/color metadata, size, occasion, availability, and delivery info.
- Adjust quantity, click **Add to Cart**, and confirm the green success toast.

### Step 4 - Cart (`/cart`)

- Navigate to the cart.
- Show the item list with image, name, type badge, quantity controls, and per-item price.
- Show the order summary sidebar with the total.
- Demonstrate removing an item.
- Proceed to checkout.

### Step 5 - Checkout (`/checkout`)

- Fill in the delivery form: name, phone, address, delivery date, time slot.
- Optionally add a florist note.
- Select a payment method (all three are simulated - no real charge occurs).
- Click **Place Order**.

### Step 6 - Order success (`/order-success`)

- Show the confirmation screen with order details.
- Point out the "Saved to backend database" or "Demo order saved locally" indicator.
- Click **View My Orders**.

### Step 7 - Order history (`/orders`)

- Show all placed orders sorted newest first.
- Demonstrate the type filter pills (All, Ready-made, AI-generated, Mixed).
- Use the status dropdown filter.
- Expand an order card to see delivery address, items, and AI prompt if applicable.

### Step 8 - AI Designer (`/designer`)

- Select an occasion, preferred flowers (multi-select chips), colors, bouquet size, style, and wrapping.
- Optionally add a free-text description.
- Click **Generate Bouquet**.
- After the loading delay, show the generated image (real if Gemini is available and has quota, or a curated simulated image otherwise) and the prompt summary.
- Select an image to confirm the design.
- Click **Add to Cart** and complete a second checkout to show a mixed order in history.

### Step 9 - Contact page (`/contact`)

- Fill in name, email, and message.
- Submit and show the green success screen.
- Mention that messages are saved to the backend database when connected, or to localStorage as a fallback.

---

## 6. Admin Demo Flow

### Step 1 - Admin login (`/admin`)

- Enter username `admin` and password `admin123`.
- Click **Sign In** and land on the dashboard.
- Optionally show that wrong credentials display an error message.

### Step 2 - Admin dashboard (`/admin/dashboard`)

- Show the four stat cards: Total Products, Total Orders, Total Revenue, AI Designs.
- Point out the "Live from backend" or "Demo data" source badge on the Orders section.
- Explain that backend orders have a real database `_id`; localStorage orders are marked "Demo".

### Step 3 - Manage orders

- Show the order list, newest first.
- Point out the status color bar on the left edge of each card.
- Expand an order to see delivery address, items, and AI design info.
- Change an order status (e.g. Pending -> Preparing) using the dropdown.
- Show that the status updates immediately in the UI.

### Step 4 - Product management (`/admin/products`)

- Click **Products** in the dashboard header.
- Show the stats row: Total Products, Available, Unavailable, Avg. Price.
- Search for a product by name.
- Filter by availability.
- Click **Edit** on a bouquet, change the price or description, and save.
- Click **Add Product**, fill in the form, and save a new bouquet.
- Navigate back to the customer-facing Shop page and show the new product appears there.
- Return to admin and **Delete** the test product.

---

## 7. Known Limitations

| Limitation | Detail |
|---|---|
| AI image generation | The backend tries Gemini image generation when GEMINI_API_KEY is set. If Gemini is unavailable, out of quota, or requires billing it has not received, the app intentionally falls back to curated simulated bouquet images. This is expected and acceptable for the demo. |
| Payment processing | All three payment methods (Cash on Delivery, Demo Card, Bank Transfer) are simulated. No real transaction occurs. |
| Authentication | Admin credentials are validated server-side via `POST /api/auth/admin/login`. The backend returns a signed expiring token stored in sessionStorage and sent as `X-Admin-Key` on protected requests. Product create/edit/delete, order status updates, and contact message reads are backend-protected routes. This is single-admin demo auth, not a full customer account or role-based identity system. |
| localStorage fallback | When the backend is offline, orders, products, and contact messages are stored in the browser's localStorage. This data is per-browser and not shared. |
| MongoDB | The backend reads MONGO_URI from backend/.env and supports both MongoDB Atlas and local MongoDB. Without a running MongoDB instance, orders and products created via the API will not persist. The frontend falls back to localStorage automatically. |
| User accounts | There is no customer registration or login system. Order history is stored per browser session. |

---

## 8. Suggested Presentation Order

Follow this sequence for a smooth, end-to-end demonstration:

1. **Start both servers** - backend on port 5000, frontend on port 3000.
2. **Open http://localhost:3000** - briefly show the Home page.
3. **Browse Products** - run a search and apply one filter, then clear it.
4. **View a product detail page** - show metadata, add to cart.
5. **Open Cart** - show the item and proceed to Checkout.
6. **Fill Checkout** - complete the form, pick Cash on Delivery, place the order.
7. **Order Success** - show the confirmation, then go to Order History.
8. **Order History** - expand the order, show status badge and item details.
9. **AI Designer** - generate a bouquet, select an image, add to cart, complete a second order.
10. **Order History again** - show the new AI-generated order alongside the ready-made one.
11. **Admin Login** - navigate to `/admin`, sign in with `admin` / `admin123`.
12. **Admin Dashboard** - show stats, change the status of the first order to "Preparing".
13. **Admin Products** - edit a product price, then add a new product.
14. **Return to Shop** - show the new product appears in the catalog.
15. **Delete test product** from admin.
16. **Contact page** - submit the contact form, show the success screen.
17. **About page** - walk through the features list and tech stack as a closing summary.
