# FloraDesigner — Bachelor Defense Presentation Outline

**Student:** Goga Chiqovani  
**Project:** FloraDesigner — AI-assisted floral e-commerce platform  
**Estimated duration:** 12–15 minutes + Q&A  
**Slide count:** 15 slides  

---

## Timing Guide

| Section | Slides | Time |
|---|---|---|
| Introduction | 1–3 | 2.5 min |
| Architecture & technology | 4–7 | 4 min |
| Features | 8–10 | 3 min |
| Testing & verification | 11 | 1 min |
| Live demo | 12 | 3 min |
| Limitations, future work, conclusion | 13–15 | 2 min |

---

---

## Slide 1 — Title

### Slide content

```
FloraDesigner
AI-Assisted Floral E-Commerce Platform

Goga Chiqovani
Bachelor Graduation Project
June 2026

GitHub: github.com/chiqqo/FloraDesigner
```

### Speaker notes

> "Good morning. My name is Goga Chiqovani and today I will be presenting FloraDesigner — a full-stack AI-assisted e-commerce platform for an online flower shop. The project covers the complete stack: a React frontend, a Node.js REST API backend, a MongoDB database, and an integration with the Google Gemini AI API for image generation."

### Demo moment
None. Keep this slide brief — move quickly.

---

## Slide 2 — Problem Statement

### Slide content

**The problem with buying flowers online:**

- Fixed catalogs with no personalization
- Customers have an occasion in mind, not a product name
- No easy way to specify: color preference, flowers, style, budget
- Most Georgian flower shop websites are not bilingual
- No real order tracking for the customer

**FloraDesigner solves this by:**
- Offering a filtered catalog _and_ an AI-assisted custom design tool
- Supporting Georgian and English in a single bilingual interface
- Providing a full order lifecycle with real backend persistence

### Speaker notes

> "The problem I wanted to solve is straightforward: existing online flower shops offer a fixed catalog. If you want roses for your mother's birthday but the catalog only shows preset arrangements, you are forced to either call the shop or pick something generic. There is also the language barrier — most local websites are Georgian-only, which excludes English-speaking customers.
>
> FloraDesigner addresses this with two shopping paths: a filtered catalog for customers who know what they want, and an AI designer for customers who need help expressing their preferences."

### Demo moment
None. This is a talking slide.

---

## Slide 3 — Project Goals

### Slide content

| Goal | Result |
|---|---|
| Full-stack web application with all CRUD operations | Achieved |
| Optional Google Gemini integration with automatic fallback | Achieved |
| Graceful offline fallback for all features | Achieved |
| Bilingual Georgian / English UI with GEL currency | Achieved |
| Role-based admin access control | Achieved |
| Automated smoke test suite | Achieved — 15 checks |
| Clean production build | Achieved — zero errors |
| Consistent 12-product demo catalog in MongoDB | Achieved |

### Speaker notes

> "I set eight concrete goals at the start of the project and all eight were achieved. I want to highlight three in particular.
>
> First, the Gemini integration — the system attempts real Gemini generation first, then falls back automatically if quota or access is unavailable. Either way the customer receives four bouquet images. I will show this in the demo.
>
> Second, the offline fallback architecture — every single data-fetching operation in the app degrades gracefully to browser localStorage when the backend is unreachable. The application is fully demonstrable even with no internet connection.
>
> Third, the automated smoke test — I built a 15-check test suite that verifies the entire API surface on every backend restart."

### Demo moment
None.

---

## Slide 4 — System Architecture

### Slide content

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                              │
│  React 18 SPA (port 3000)    localStorage (fallback)    │
└───────────────────┬─────────────────────────────────────┘
                    │  HTTP /api/*
┌───────────────────▼─────────────────────────────────────┐
│           Backend — Node.js + Express (port 5000)        │
│  Routes → Middleware (requireAdmin, requireDatabase)     │
│           → Controllers → Mongoose Models                │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
    ┌──────────▼──────┐    ┌──────────▼──────────┐
    │  MongoDB Atlas  │    │  Google Gemini API  │
    │  (4 collections)│    │  (optional, server  │
    └─────────────────┘    │   side only)        │
                           └─────────────────────┘
```

**Three tiers:**
- Frontend SPA — React 18 + Vite
- REST API — Node.js + Express
- Data — MongoDB Atlas + Gemini (optional)

### Speaker notes

> "The system follows a classic three-tier architecture. The browser hosts the React single-page application. All backend communication goes through the `/api` prefix — in development Vite proxies these requests to port 5000, in production the frontend is built as static files.
>
> The backend is a stateless Node.js REST API. Importantly, the Google Gemini API key is held exclusively on the server — it never reaches the browser. All AI generation happens server-side.
>
> MongoDB Atlas is the primary data store. There are four collections: products, orders, contact messages, and generated designs.
>
> When MongoDB is unreachable, the backend returns a 503 status code and the frontend switches to localStorage automatically."

### Demo moment
Show the architecture diagram from `TECHNICAL_REPORT.md` if displaying from a browser, or copy the ASCII version onto the slide.

---

## Slide 5 — Technology Stack

### Slide content

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State / i18n | React Context API (no Redux, no i18n library) |
| Backend | Node.js 18 + Express 4 |
| Database ORM | Mongoose 8 |
| Database | MongoDB Atlas (free tier) |
| AI generation | Google Gemini API (`@google/genai`) |
| Config | dotenv |
| Dev tooling | nodemon, Vite dev proxy |
| Version control | Git + GitHub |

**No third-party payment SDK. No customer auth library. No i18n framework.**  
Everything custom-built where possible.

### Speaker notes

> "I chose this stack deliberately. React with Vite gives a fast development cycle and a clean production build. Tailwind CSS keeps styling consistent without a large CSS framework dependency.
>
> On the backend, Express gives me full control over middleware and routing without the overhead of a more opinionated framework like NestJS.
>
> I want to point out three things I did NOT use: I wrote my own translation system instead of importing i18n-next, I implemented my own token-based admin auth instead of using Passport.js, and I built my own smoke test instead of using a test framework like Jest. These choices kept the dependency footprint small and forced me to understand the underlying mechanics."

### Demo moment
None. This is a quick overview slide.

---

## Slide 6 — Backend and REST API

### Slide content

**Express app structure:**
```
server.js  →  routes/  →  middleware/  →  controllers/  →  models/
```

**Two middleware layers protect the API:**

| Middleware | Trigger | Response |
|---|---|---|
| `requireDatabase` | MongoDB not connected | 503 Database unavailable |
| `requireAdmin` | Missing / wrong X-Admin-Key header | 403 Forbidden |

**17 REST endpoints across 6 resources:**
- `/api/health` — connectivity check
- `/api/products` — full CRUD (admin-protected writes)
- `/api/orders` — create, list, status update (admin-protected update)
- `/api/contact` — submit / read (admin-protected read)
- `/api/auth/admin/login` — credential validation → token
- `/api/designer/generate` — AI bouquet generation (no DB required)

### Speaker notes

> "The backend is organized in a classic Express pattern: routes define URL paths, middleware handles cross-cutting concerns like authentication and database availability, and controllers contain the business logic.
>
> The two middleware functions are particularly important. `requireDatabase` checks Mongoose's connection state before any database operation — this is what makes the 503 fallback work. `requireAdmin` validates the `X-Admin-Key` header on every admin request, so even if someone discovers the API URL, they cannot modify products or read contact messages without the admin token.
>
> The designer/generate endpoint is special — it does not require MongoDB at all, so it always works regardless of database connectivity."

### Demo moment
Optional: open `http://localhost:5000/api/health` in the browser to show the live JSON response.

---

## Slide 7 — MongoDB Database Design

### Slide content

**4 collections — all with automatic `createdAt` / `updatedAt` timestamps:**

**`products`**
`name · description · price · category · colors[] · flowers[] · size · occasion · imageUrl · available · deliveryInfo`

**`orders`**
`customerName · phone · address · deliveryDate · deliveryTime · paymentMethod · note · totalPrice · status · orderType · items[]`

**`orders.items` (embedded subdocument)**
`id · name · price · quantity · itemType · prompt · style · generatedDesignId`

**`contactmessages`**
`name · email · message · status`

**`generateddesigns`**
`prompt · generatedImages[] · selectedImageUrl · style · occasion · preferredFlowers[] · preferredColors[] · bouquetSize · wrappingStyle · estimatedPrice`

**Key design decisions:**
- Order items are **embedded** in the order document — snapshot at checkout time, immune to product edits
- `GeneratedDesign` is saved separately so admin can review AI usage

### Speaker notes

> "All four Mongoose schemas use the `timestamps: true` option, which automatically adds `createdAt` and `updatedAt` fields to every document without me writing that logic manually.
>
> The most interesting design decision is the order items. I chose to embed them directly in the order document rather than referencing the product by ID. This means when an order is placed, a snapshot of the item's name, price, and details is saved. If an admin later changes a product's price, old orders are not affected. This is a common pattern in e-commerce and it was a deliberate architectural choice.
>
> The `GeneratedDesign` collection records every AI designer session — the prompt, all four generated image URLs, which one the customer selected, and the estimated price. This gives the admin visibility into how the AI feature is being used."

### Demo moment
Optional: show MongoDB Atlas in the browser — click on the `orders` collection to show a real document with embedded items.

---

## Slide 8 — Gemini AI Integration and Fallback

### Slide content

**POST /api/designer/generate — decision chain:**

```
1. Is GEMINI_API_KEY set in .env?
   NO  → skip to step 4

2. Call Gemini 2.5 Flash Image (generateContent, IMAGE modality)
   SUCCESS → return base64 data URL, provider: "gemini"
   FAIL / quota exceeded → continue

3. Call Imagen 4 (generateImages)
   SUCCESS → return base64 data URL, provider: "gemini"
   FAIL → continue

4. Run scoreImages() over IMAGE_POOL (8 curated Unsplash photos)
   → return top 4 URLs by tag-match score, provider: "simulated"
```

**Tag-based image scoring:**
- Each pool image has English + Georgian keyword tags
- Input = all form fields joined as a single string
- Score = number of tag substring matches
- Ties broken by deterministic hash of the input
- Georgian-language form entries match correctly

### Speaker notes

> "This is one of the technically interesting parts of the project. The AI designer tries two Gemini models in sequence before falling back. This matters because different API quota tiers have access to different models.
>
> The fallback is not random — it uses a scoring algorithm. Each of the 8 curated bouquet images has a list of tags in both English and Georgian. The system scores each image based on how many of its tags appear in the combined form input, then returns the 4 highest-scoring images. So if a user selects 'White' and 'Lilies' and 'Wedding', the algorithm will correctly rank the white lily image highest.
>
> Importantly, this same algorithm runs on both the frontend and the backend — the frontend uses it for instant preview while the backend uses it for the API response. The Gemini API key never leaves the server."

### Demo moment
**Show this on screen:** `/designer` page — fill in occasion, flowers, colors, generate. Point out the `provider` field (simulated or gemini) in the API response if inspecting Network tab.

---

## Slide 9 — Customer Flow

### Slide content

**Path 1 — Ready-made bouquet:**

`Home → Products (filter/search) → Product Detail (add to cart) → Cart → Checkout → Order Success → My Orders`

**Path 2 — AI-designed bouquet:**

`Home → AI Designer (select preferences → generate → select image) → Cart → Checkout → Order Success → My Orders`

**Key UX decisions:**
- Language toggle in Navbar — all UI strings switch, Georgian default
- Cart persists in localStorage across page refreshes
- Checkout validates all required fields before submission
- Order saved to MongoDB first; falls back to localStorage on failure
- Order history merges backend + localStorage orders (deduped)

### Speaker notes

> "There are two customer journeys and they converge at the cart. A customer who knows what they want browses the catalog, filters by category or color, and adds a ready-made bouquet to cart. A customer who wants something custom uses the AI designer, receives generated images with a price estimate, selects one, and adds it to cart.
>
> After checkout, the order is sent to `POST /api/orders`. If MongoDB is connected, it gets a real database `_id`. If not, it falls back to localStorage. On the Order History page, both sources are merged and deduplicated — the customer sees one unified list regardless of where the data came from."

### Demo moment
**Show this live:** Browse to `/products`, apply a filter, click a product, add to cart, go to `/cart`. This takes about 60 seconds.

---

## Slide 10 — Admin Flow

### Slide content

**Admin URL:** `http://localhost:3000/admin`  
**Credentials:** `admin` / `admin123`

**Authentication mechanism:**
1. `POST /api/auth/admin/login` validates username + password against `.env`
2. Backend returns `{ token: ADMIN_API_KEY }`
3. Frontend stores token in `sessionStorage` (cleared on tab close)
4. All admin requests include `X-Admin-Key: <token>` header
5. `requireAdmin` middleware validates on every protected route

**Admin capabilities:**

| Page | Actions |
|---|---|
| Dashboard | View stats (products, orders, revenue, AI designs), update order status, read contact messages |
| Products | Add product, edit product (name, price, description, availability), delete product |

**Protected routes:** product write/delete, order status update, contact messages read

### Speaker notes

> "Admin authentication is demo-level but it is real server-side validation. The credentials are not checked in the frontend — they are posted to the backend, which compares them against environment variables and returns a token. The frontend then sends that token as a custom header on every admin request.
>
> The session is stored in `sessionStorage`, not `localStorage`, which means it expires when the browser tab is closed. This was a deliberate security choice for the demo context.
>
> The admin can manage the full product catalog — add, edit, delete — and update order statuses in real time. When an order status changes in the admin dashboard, the change is persisted in MongoDB immediately."

### Demo moment
**Show this live:** Navigate to `/admin`, log in, change an order status to "Preparing," then go to `/admin/products` and show the product list.

---

## Slide 11 — Bilingual UI and Currency Support

### Slide content

**Built without any third-party i18n library.**

Custom `LanguageContext.jsx` provides:
- `t(key, vars)` — looks up a translation key; supports `{variable}` interpolation
- `formatCurrency(amount)` — locale-aware GEL formatting
- `toggleLanguage()` — switches Georgian ↔ English; persists to `localStorage`

**~200 translation keys** covering all 14 pages.

**Currency formatting:**

| Language | Display |
|---|---|
| Georgian (default) | ₾120 |
| English | 120 GEL |

**AI Designer chip pattern:**
- `{ value: 'Anniversary', label: t('ai.occ.Anniversary') }`
- `value` (English) → sent to backend for Gemini prompt
- `label` (Georgian/English) → shown in UI
- Backend compatibility is preserved regardless of UI language

### Speaker notes

> "I built the translation system from scratch. It is a single JavaScript object with about 200 keys, one set for Georgian and one for English. The `t()` function does a simple lookup and replaces `{variable}` placeholders, similar to how professional i18n libraries work but without the dependency.
>
> Currency is handled by `formatCurrency()` — Georgian mode prepends the Lari symbol, English mode appends the ISO code. All prices are stored as plain numbers in MongoDB.
>
> The bilingual chip pattern for the AI designer is worth mentioning because it solves a specific problem: the form labels need to display in Georgian, but the values submitted to the backend need to be in English so the Gemini prompt is correct. I solved this with a `{value, label}` object pattern — the user sees their language, the backend receives English."

### Demo moment
**Show this:** Click the language toggle on any page and watch all text switch simultaneously, including prices.

---

## Slide 12 — Testing and Verification

### Slide content

**Smoke test (`backend/smokeTest.js`):**

```
npm run smoke   ← from the backend/ directory
```

15 automated checks on the running API:

| Check | Verifies |
|---|---|
| GET /api/health | Status 200, MongoDB connected |
| GET /api/products | **Exactly 12 products** returned |
| Price range | All prices ₾60–₾200 |
| Admin login | Correct creds accepted; wrong creds → 401 |
| POST /api/contact | Created (201); missing email → 400 |
| POST /api/orders | Order created with status Pending |
| PUT status (with token) | Status updated to Preparing |
| PUT status (no token) | Rejected with 403 |
| POST /api/designer/generate | Returns prompt, images, price, provider |

**Latest result: 15/15 passed**

**Production build:** `npm run build` — 55 modules, zero errors

**API documentation:** `API_DOCUMENTATION.md` — all 17 endpoints documented with request/response examples

### Speaker notes

> "I built a custom smoke test instead of using a testing framework because I wanted to test the running server, not mocked functions. The smoke test makes real HTTP requests to the API and validates real responses.
>
> The product count check is particularly strict — it requires exactly 12 products, not 'at least 1'. If someone reseeds the database with the wrong data, the smoke test immediately catches it.
>
> The 403 check is also important — it verifies that the admin token validation actually works. A test that only checks happy paths misses half the story.
>
> Every significant change to the project was followed by running the smoke test and a production build. All 15 checks pass and the build is clean."

### Demo moment
Optional: run `npm run smoke` in the terminal during the presentation to show the live output. Takes about 5 seconds.

---

## Slide 13 — Live Demo Plan

### Slide content

**Suggested 3-minute demo sequence:**

| Step | Action | Shows |
|---|---|---|
| 1 | Open `http://localhost:3000` | Home page in Georgian |
| 2 | Toggle language to English | Bilingual UI switch |
| 3 | Toggle back to Georgian | Georgian as default |
| 4 | Go to `/products`, filter by "Romantic" category | Filter system, 12 products |
| 5 | Click one product → Add to Cart | Product detail, cart toast |
| 6 | Go to `/designer`, fill preferences, Generate | AI designer, image scoring |
| 7 | Add AI design to cart | Mixed cart |
| 8 | Go to `/cart` → Checkout → fill form → Place Order | Full checkout flow |
| 9 | Show `/order-success` | Backend persistence badge |
| 10 | Go to `/orders` | Order history, merged data |
| 11 | Go to `/admin`, log in | Admin auth |
| 12 | Change order status → Products page | Admin management |

**Gemini behavior:** The system attempts real Gemini generation when `GEMINI_API_KEY` is configured and quota/model access is available. If Gemini is unavailable, quota-limited, or fails for any reason, the backend automatically returns scored fallback bouquet images. The fallback is intentional and makes the demo reliable regardless of API state.

### Speaker notes

> "For the live demo I will follow this sequence. The goal is to show the complete user journey — from browsing to checkout — and then switch to the admin view to show the backend side.
>
> I want to highlight two moments specifically: step 9, the order success page, where the badge shows whether the order was saved to MongoDB or fell back to localStorage — this makes the backend behavior visible; and step 12, the admin status update, which shows a live database write followed by an immediate UI update.
>
> If the committee wants to see the API directly, I can open the browser Network tab during the demo to show the raw JSON requests and responses."

### Demo moment
**This entire slide IS the demo.** Run through the steps in the order listed.

---

## Slide 14 — Limitations and Future Improvements

### Slide content

**Known limitations (by design for the scope of this project):**

| Area | Current state |
|---|---|
| Admin authentication | Demo-level: plain-text credential comparison, no bcrypt, no JWT |
| Customer accounts | No registration/login — order history is per-browser |
| Payment | Fully simulated — no real payment gateway |
| AI generation | Requires Gemini API key with active quota; fallback is seamless |
| Data scale | No pagination — works for 12-product demo catalog |

**Planned future improvements:**

- Production authentication: bcrypt + JWT with token expiry
- Customer registration and login — bind orders to accounts
- Real payment gateway (Stripe or Georgian bank API: TBC Pay / Bank of Georgia)
- Cloudinary or AWS S3 for product image hosting
- Email/SMS order notifications
- Inventory management with real-time stock counts
- Server-side rendering (Next.js) for SEO

### Speaker notes

> "I am transparent about the limitations of this project. The most significant is the authentication model — credentials are compared as plain text against environment variables. This is appropriate for a demonstration but not for production. In a production system I would use bcrypt for password hashing and JWT for token management with expiry.
>
> The payment simulation is intentional — integrating a real payment gateway was outside the scope of a bachelor project, but the checkout flow, form validation, and order creation pipeline are all production-ready patterns.
>
> The Gemini fallback is not a limitation — it is a feature. The application is designed to work with or without AI generation."

### Demo moment
None. This is a talking slide.

---

## Slide 15 — Conclusion and Q&A

### Slide content

**FloraDesigner delivers:**

- A complete full-stack e-commerce application with real backend persistence
- Integration with an external AI API (Google Gemini) with robust fallback logic
- A bilingual Georgian/English interface built without third-party i18n dependencies
- Role-based admin access control with server-side token validation
- An automated 15-check API smoke test suite
- Graceful degradation to localStorage at every data boundary

**Repository:** https://github.com/chiqqo/FloraDesigner

**Documentation:**
- `TECHNICAL_REPORT.md` — full architecture and design document
- `API_DOCUMENTATION.md` — all 17 endpoints with request/response examples
- `USER_MANUAL.md` — setup guide, user flows, troubleshooting
- `DEMO_GUIDE.md` — presentation script and demo credentials

**Thank you. I am ready for questions.**

### Speaker notes

> "To summarize: FloraDesigner is a production-structured full-stack application that demonstrates real-world engineering practices — RESTful API design, Mongoose schema modeling, Context-based state management in React, internationalization, role-based access control, and automated testing.
>
> The project is fully functional, documented, and available on GitHub. The backend has been smoke-tested, the frontend builds cleanly, and all features degrade gracefully when external services are unavailable.
>
> Thank you. I am ready to take your questions."

**Anticipated committee questions:**

| Question | Key point in your answer |
|---|---|
| Why not use JWT? | Scope decision — demo auth is sufficient; bcrypt + JWT is identified as first future improvement |
| How does the Gemini fallback work? | Tag-scoring algorithm over IMAGE_POOL — show the TECHNICAL_REPORT diagram |
| How do you handle MongoDB being offline? | `requireDatabase` middleware → 503 → frontend localStorage fallback |
| Why no customer login system? | Out of scope; order history works per-browser via localStorage; noted as future improvement |
| What does the smoke test test? | 15 checks: health, product count, admin auth (good + bad creds), contact, order create, status update with/without token, AI designer |
| What happens with 1000 products? | No pagination — acknowledged limitation; cursor-based pagination is in future improvements |
| Where is the Gemini key stored? | Server-side only in `backend/.env` — never sent to browser |

---

## Appendix — Pre-Demo Checklist

Run these before the presentation begins:

```
☐ cd backend && npm start             ← backend running on port 5000
☐ cd frontend && npm run dev          ← frontend running on port 3000
☐ cd backend && npm run smoke         ← confirm 15/15 pass
☐ Open http://localhost:3000          ← confirm home page loads
☐ Open http://localhost:3000/admin    ← confirm admin login works
☐ MongoDB Atlas cluster is active     ← not paused (check Atlas dashboard)
☐ Browser is in Georgian mode         ← localStorage key 'floradesigner_language' = 'ka'
☐ Cart is empty                       ← open cart, clear if needed
☐ Close DevTools                      ← clean presentation view
```

---

*FloraDesigner — Bachelor Defense Presentation — Goga Chiqovani — June 2026*
