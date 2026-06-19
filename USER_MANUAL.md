# FloraDesigner â€” User Manual

**Version:** 1.0  
**Project:** FloraDesigner â€” AI-assisted floral e-commerce platform  
**Repository:** https://github.com/chiqqo/FloraDesigner-Final  

---

## Table of Contents

1. [Starting the Application Locally](#starting-the-application-locally)
2. [Customer Flow](#customer-flow)
   - [Home Page](#home-page)
   - [Shop (Product Catalog)](#shop-product-catalog)
   - [Product Details](#product-details)
   - [Cart](#cart)
   - [Checkout](#checkout)
   - [Order Success](#order-success)
   - [My Orders](#my-orders)
   - [AI Bouquet Designer](#ai-bouquet-designer)
   - [Contact](#contact)
3. [Admin Flow](#admin-flow)
   - [Admin Login](#admin-login)
   - [Admin Dashboard](#admin-dashboard)
   - [Order Status Updates](#order-status-updates)
   - [Product Management](#product-management)
   - [Contact Messages](#contact-messages)
4. [Gemini AI Behavior](#gemini-ai-behavior)
5. [MongoDB Behavior](#mongodb-behavior)
6. [Troubleshooting](#troubleshooting)

---

## Starting the Application Locally

### Prerequisites

- **Node.js 18 or later** installed on your machine
- **MongoDB** â€” either a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster or a local MongoDB Community Server
- A terminal (PowerShell, Command Prompt, or Bash)

### Step 1 â€” Clone the repository

```bash
git clone https://github.com/chiqqo/FloraDesigner-Final.git
cd FloraDesigner
```

### Step 2 â€” Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/floradesigner
CLIENT_ORIGIN=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_API_KEY=some-random-string
GEMINI_API_KEY=          # optional â€” leave blank to use simulated images
```

> **Never commit `backend/.env`.** It is listed in `.gitignore` and excluded from the repository.

### Step 3 â€” Install and start the backend

```bash
cd backend
npm install
npm run dev        # development (auto-restarts on file changes)
# or
npm start          # stable run (no nodemon required)
```

The backend starts on **http://localhost:5000**.

### Step 4 â€” Seed the product catalog

Run once after setting up the database for the first time, or to reset to the 12 demo products:

```bash
cd backend
npm run seed
```

> This deletes all existing products and inserts 12 fresh demo bouquets.

### Step 5 â€” Install and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Step 6 â€” Verify everything is running

Run the smoke test to confirm the backend API is healthy:

```bash
cd backend
npm run smoke
```

All 15 checks should pass. If the product count check fails, run `npm run seed` and restart the backend.

---

## Customer Flow

[SCREENSHOT: Home page]

### Home Page

**URL:** `http://localhost:3000/`

The Home page is the entry point for all customers. It opens in **Georgian by default**. The language can be switched to **English** using the toggle in the top-right corner of the navigation bar. The selected language is remembered across page visits.

What you will see:
- **Hero section** â€” headline, subtitle, and two action buttons: "Browse Bouquets" and "Try AI Designer."
- **Featured arrangements** â€” a grid of highlighted bouquets from the catalog.
- **How AI Bouquet Design Works** â€” three-step explanation of the AI designer flow.
- **Why FloraDesigner?** â€” platform benefits section.
- **Footer** â€” links to catalog, AI designer, contact, and about pages.

---

### Shop (Product Catalog)

**URL:** `http://localhost:3000/products`

[SCREENSHOT: Product catalog]

The catalog displays all 12 available bouquets. Products are loaded from the backend API. If the backend is offline, the page falls back to the hardcoded local product list.

**Search:** Type any word (product name, flower type, color) into the search bar. Results update in real time.

**Filters (click "Filters" to expand the panel):**

| Filter | Options |
|---|---|
| Category | Romantic, Classic, Seasonal, Wildflower, Tropical, Modern |
| Color | Red, Pink, White, Yellow, Orange, Purple, Blue, Lavender, and more |
| Flower type | Roses, Peonies, Lilies, Tulips, Sunflowers, and more |
| Size | Small, Medium, Large, Extra Large |
| Occasion | Birthday, Anniversary, Wedding, Sympathy, Graduation, and more |
| Price range | â‚¾0â€“â‚¾100, â‚¾100â€“â‚¾150, â‚¾150â€“â‚¾200 |
| In-stock only | Toggle to hide unavailable bouquets |

**Clearing filters:** Click "Clear filters" to reset all filters and see the full catalog.

---

### Product Details

**URL:** `http://localhost:3000/products/:id`

Click **View Details** or the product image on any catalog card to open the detail page.

What you will see:
- Full-size bouquet image
- Georgian product name and description
- Metadata badges: flowers, colors, size, occasion, availability, delivery information
- **Quantity selector** â€” use `âˆ’` and `+` to choose how many to add
- **Add to Cart** button â€” adds the selected quantity to your cart and shows a green success notification

---

### Cart

**URL:** `http://localhost:3000/cart`

The cart shows all items you have added, whether from the product catalog or the AI Designer. Items persist in `localStorage` across page refreshes.

What you can do:
- **Adjust quantity** â€” use `âˆ’` and `+` next to each item
- **Remove an item** â€” click the trash icon
- **See the order summary** â€” item count, subtotal, and total displayed on the right (or below on mobile)
- **Proceed to Checkout** â€” button in the order summary panel

If the cart is empty, a prompt with links to the catalog and AI Designer is shown.

---

### Checkout

**URL:** `http://localhost:3000/checkout`

Fill in the delivery form:

| Field | Notes |
|---|---|
| Full name | Required |
| Phone number | Required |
| Delivery address | Required |
| Delivery date | Required; cannot be in the past |
| Delivery time slot | Required; select from 4 time windows |
| Florist note | Optional â€” special instructions for the bouquet maker |
| Payment method | Choose one: Cash on Delivery, Demo Card, Bank Transfer |

> All payment methods are **simulated**. No real transaction occurs. Do not enter real card numbers.

Click **Place Order** to submit. If any required field is missing, an error message appears in the form (in the current language). The form will not submit until all required fields are filled.

---

### Order Success

**URL:** `http://localhost:3000/order-success`

After a successful order, you will see:
- A green check mark and confirmation heading
- Your order details: customer name, address, delivery date and time, payment method, and florist note
- An itemized list of what you ordered
- The total price in GEL
- A status indicator: "Saved to backend database" (when MongoDB is connected) or "Demo order saved locally" (localStorage fallback)

From here:
- **View My Orders** â€” goes to the full order history
- **Continue Shopping** â€” returns to the product catalog

---

### My Orders

**URL:** `http://localhost:3000/orders`

[SCREENSHOT: Order history]

Shows all orders placed in this browser, merged from the backend database and `localStorage`. Orders are sorted newest first.

**Filter by type:**
- All
- Ready-made
- AI-generated
- Mixed

**Filter by status:**
- All statuses
- Pending, Preparing, Ready, Delivered, Cancelled

**Expanding an order card:** Click **View details** to see:
- Delivery address and time
- Payment method and florist note
- Full item list with individual prices
- For AI-generated orders: the bouquet prompt used to generate it
- Source badge: "Loaded from database," "Database + local fallback," or "Loaded locally"

---

### AI Bouquet Designer

**URL:** `http://localhost:3000/designer`

[SCREENSHOT: AI Designer]

The AI Designer lets you describe your ideal bouquet and receive a generated image concept with an estimated price.

**Step 1 â€” Choose your preferences:**

| Selector | Type | Options |
|---|---|---|
| Occasion | Single choice | Birthday, Anniversary, Wedding, Romantic Gift, Sympathy, Graduation, General Gift |
| Style | Single choice | Romantic, Classic, Luxury, Wildflower, Modern, Minimal |
| Bouquet size | Single choice | Small, Medium, Large, Extra Large |
| Wrapping | Single choice | Kraft paper, Satin ribbon, Luxury box, Transparent wrap, Minimal white wrap |
| Preferred flowers | Multiple choice | Roses, Peonies, Tulips, Sunflowers, Lilies, Lavender, Orchids, Dahlias, Wildflowers |
| Preferred colors | Multiple choice | Red, Pink, White, Yellow, Orange, Purple, Lavender, Blue, Peach |

In **Georgian mode**, all chip labels display in Georgian. In **English mode**, they display in English. The selected values sent to the backend are always in English for consistency.

**Step 2 â€” Add an optional description:**

Type any free-form text: "Something soft and elegant," "White flowers for a sympathy arrangement," and so on. This text is included in the AI prompt and the tag-matching algorithm.

**Step 3 â€” Click Generate Bouquet:**

A loading indicator appears for 1.5â€“2 seconds. The backend processes your request and returns:
- 4 bouquet images (Gemini-generated or curated fallback â€” see [Gemini AI Behavior](#gemini-ai-behavior))
- An estimated price in GEL
- A text prompt summarizing your preferences

**Step 4 â€” Select an image:**

Click any of the 4 images to select it. The selected design opens in a detail panel with prompt, price, and Add to Cart action.

**Step 5 â€” Add to Cart:**

Click **Add to Cart**. The AI design is added to your cart as an "AI-generated bouquet" item with the prompt and preferences attached. You can then proceed to checkout normally.

---

### Contact

**URL:** `http://localhost:3000/contact`

Fill in your name, email address, and message, then click **Send Message**. All three fields are required.

On success, a green confirmation screen shows with a note indicating whether your message was saved to the backend database or stored locally. The form resets and you can submit another message if needed.

---

## Admin Flow

### Admin Login

**URL:** `http://localhost:3000/admin`

Enter the admin username and password. The default demo credentials are:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

Click **Sign In**. On success, you are redirected to the Admin Dashboard. The admin session is stored in `sessionStorage` and expires when the browser tab is closed.

If wrong credentials are entered, a red error message appears. The form does not submit to the dashboard.

---

### Admin Dashboard

**URL:** `http://localhost:3000/admin/dashboard`

[SCREENSHOT: Admin dashboard]

The dashboard shows four summary stat cards at the top:
- **Total Products** â€” count of products in the database
- **Total Orders** â€” count of all orders
- **Total Revenue** â€” sum of all order totals in GEL
- **AI Designs** â€” count of saved AI-generated designs

Below the stats, the **Orders** section lists all orders, newest first. Each order card shows:
- Customer name, total price, order date
- Status badge with color coding
- Expand button for full delivery details and item list
- Status update dropdown (see below)

The **Contact Messages** section at the bottom shows all submitted contact form messages with their date, sender email, and a "Saved" (backend) or "Local" badge.

---

### Order Status Updates

In the Admin Dashboard, each order card has a **status dropdown**. Available statuses:

| Status | Meaning |
|---|---|
| Pending | Order placed, not yet acknowledged |
| Preparing | Florist is preparing the bouquet |
| Ready | Ready for pickup or handoff to delivery |
| Delivered | Successfully delivered to customer |
| Cancelled | Order cancelled |

Select a new status from the dropdown. The update is sent immediately to the backend (`PUT /api/orders/:id/status`). The badge color on the card updates in real time.

---

### Product Management

**URL:** `http://localhost:3000/admin/products`

**Viewing products:**
- A stats row shows Total Products, Available, Unavailable, and Average Price.
- The product list shows all bouquets with name, price, category, availability badge, and action buttons.
- Use the **Search** field to find products by name.
- Use the **Availability** filter to show all, available only, or unavailable only.

**Adding a product:**
1. Click **Add Product** (top right).
2. A modal opens with fields: Name, Description, Price (â‚¾), Category, Colors, Flowers, Size, Occasion, Image URL, Delivery Info, and Available toggle.
3. Fill in the required fields and click **Save**.
4. The new product appears in the list and immediately in the customer-facing catalog.

**Editing a product:**
1. Click **Edit** on any product row.
2. The same modal opens pre-filled with current values.
3. Make your changes and click **Save**.

**Deleting a product:**
1. Click **Delete** on any product row.
2. A confirmation prompt appears. Click **OK** to confirm.
3. The product is removed from the database and disappears from the catalog.

---

### Contact Messages

Contact messages are visible in the lower section of the Admin Dashboard. Each message shows:
- Sender name and email
- Submission date
- Full message text
- Source badge (Saved / Local)

There is no reply or delete action in the current version. Messages are read-only in the admin view.

---

## Gemini AI Behavior

The AI Bouquet Designer can use Google's Gemini API to generate a photorealistic bouquet image based on your preferences. The behavior depends on whether a valid API key is configured and whether quota is available.

### Real Gemini generation

**When it works:**
- `GEMINI_API_KEY` is set in `backend/.env`
- The API key has active quota or billing is enabled on the Google Cloud project

**What happens:**
1. The backend sends your bouquet preferences to Gemini 2.5 Flash Image.
2. If that model fails, it automatically retries with Imagen 4.
3. A base64-encoded image is returned to the browser and displayed.
4. The response includes `provider: "gemini"`.

The image is generated fresh every time and is unique to your input. Generation typically takes 5â€“15 seconds.

### Simulated fallback

**When it activates:**
- `GEMINI_API_KEY` is not set in `.env`
- Gemini API key is invalid
- API quota is exhausted
- Gemini returns an error for any reason

**What happens:**
1. The backend runs the `scoreImages()` tag-matching algorithm over 8 curated Unsplash bouquet photos.
2. Each photo has English and Georgian keyword tags (occasion, flowers, colors, style).
3. The 4 best-matching photos are returned.
4. The response includes `provider: "simulated"`.

The fallback is seamless â€” the customer sees 4 bouquet images regardless of whether Gemini is available. For demo and presentation purposes, the simulated images are appropriate and expected.

> **Note:** There is no error message shown to the customer when simulated images are used. The experience is intentionally identical.

---

## MongoDB Behavior

### When MongoDB is connected

All data (products, orders, contact messages, AI designs) is stored in and loaded from MongoDB Atlas. The backend health endpoint (`GET /api/health`) returns `"database": "connected"`.

The smoke test requires exactly 8 products. If a different count is returned:
```bash
cd backend
npm run seed   # reseed 8 products
# then restart the backend
```

### When MongoDB is offline or unreachable

The `requireDatabase` middleware detects that Mongoose is not connected (`readyState !== 1`) and returns HTTP 503 for all database-dependent routes.

The frontend handles 503 responses gracefully:

| Feature | Fallback |
|---|---|
| Product catalog | Loads from hardcoded mock product list (`data/products.js`) |
| Orders (place) | Saves to `localStorage` under key `floradesigner_orders` |
| Orders (list) | Reads from `localStorage` |
| Contact form | Saves to `localStorage` under key `floradesigner_contact_messages` |
| Admin dashboard | Shows demo data from `localStorage` |

The AI Designer endpoint (`POST /api/designer/generate`) does not require MongoDB and works regardless of database state.

---

## Troubleshooting

### Backend unavailable

**Symptom:** Products page shows mock data, orders saved locally, "Demo order saved locally" on order success.

**Cause:** The backend server is not running.

**Fix:**
```bash
cd backend
npm run dev
```

Verify it is running: open `http://localhost:5000/api/health` in your browser. You should see `{ "status": "ok" }`.

---

### MongoDB offline

**Symptom:** Backend is running but product catalog shows mock data; smoke test shows `FAIL MongoDB not connected`.

**Cause:** MongoDB Atlas cluster is unreachable (network issue, paused cluster, or wrong `MONGO_URI`).

**Fix:**
1. Check your `MONGO_URI` in `backend/.env`.
2. Log in to MongoDB Atlas and verify the cluster is running (free-tier clusters pause after 60 days of inactivity â€” click **Resume** to wake it).
3. Ensure your IP address is in the Atlas IP allowlist (Network Access â†’ Add IP Address).
4. Restart the backend after fixing the connection string.

---

### Images not loading

**Symptom:** Product images show a broken image icon or generic placeholder.

**Causes and fixes:**

| Cause | Fix |
|---|---|
| Local product image file missing | Verify all 8 files exist in `frontend/public/product-images/`. Run `ls frontend/public/product-images/` to check. |
| Unsplash URL blocked | Some networks or ad blockers block `images.unsplash.com`. Disable the blocker for localhost or use a different network. |
| Image URL in database is wrong | Edit the product in Admin Products and update the `imageUrl` field. |

---

### Gemini quota unavailable

**Symptom:** AI Designer shows 4 images but the response says `provider: "simulated"`.

**Cause:** `GEMINI_API_KEY` is not set, or the key has no remaining quota.

**This is expected behavior.** The simulated fallback images are curated Unsplash bouquet photos selected by a tag-matching algorithm. For a demo or presentation, this is acceptable.

To enable real Gemini generation:
1. Create a Google Cloud project and enable the Gemini API.
2. Generate an API key.
3. Add it to `backend/.env` as `GEMINI_API_KEY=your-key-here`.
4. Restart the backend.

---

### Product count is not 12

**Symptom:** Smoke test `FAIL Expected exactly 8 products, got N`.

**Fix:**
```bash
cd backend
npm run seed
```

Then restart the backend (stop the process and run `npm run dev` or `npm start` again). The seed script deletes all existing products and inserts the 12 demo bouquets.

---

### Frontend build fails

**Symptom:** `npm run build` exits with errors.

**Common causes:**

| Error | Fix |
|---|---|
| `Cannot find module` | Run `npm install` in the `frontend/` directory |
| JSX syntax error | Check recent edits to page components for unclosed tags |
| Import path error | Verify file names match their imports (case-sensitive on Linux/macOS) |

A clean build output should show:
```
âœ“ 55 modules transformed.
âœ“ built in ~10s
```

---

### Git / GitHub notes

The following are excluded from version control via `.gitignore`:

| Item | Reason |
|---|---|
| `backend/.env` | Contains real secrets (MongoDB URI, admin password, Gemini API key) |
| `backend/node_modules/` | Installed via `npm install` |
| `frontend/node_modules/` | Installed via `npm install` |
| `frontend/dist/` | Generated by `npm run build` |

If you clone the repository on a new machine:
1. `npm install` in both `backend/` and `frontend/`
2. Create `backend/.env` from `backend/.env.example`
3. Run `npm run seed` to populate the database
4. Start the backend, then the frontend

The repository is public at **https://github.com/chiqqo/FloraDesigner-Final**.

---

*FloraDesigner User Manual â€” Bachelor Graduation Project â€” Goga Chiqovani â€” June 2026*



