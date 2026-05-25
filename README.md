# MERN E-commerce

A full-stack e-commerce app with a customer storefront, JWT-protected admin panel, image uploads, reviews & ratings, advanced search with filters, a wishlist, and Stripe Checkout payments.

## Tech stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (jsonwebtoken), bcryptjs
- multer (uploads)
- stripe (payments)
- express-async-handler, cors, dotenv

**Frontend**
- React 18 + Vite
- React Router v6
- Redux Toolkit + react-redux (slices: products, cart, user, order, wishlist)
- Axios (JWT interceptor)
- react-icons
- @stripe/stripe-js (kept available; checkout redirect uses the Session URL directly)
- Custom toast + error boundary

## Project structure

```
projetfinal/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # user, product, category, order, wishlist
│   ├── middleware/         # auth, error
│   ├── models/             # User (+ wishlist), Product (+ reviews), Category, Order
│   ├── routes/             # users, products, categories, orders, wishlist, upload
│   ├── uploads/
│   ├── utils/generateToken.js
│   ├── seeder.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Footer, Loader, Rating, ProductCard,
    │   │                   # PrivateRoute, AdminRoute, ErrorBoundary, Toast
    │   ├── pages/          # Home, Search, Product, Cart, Login, Register,
    │   │                   # Profile, Checkout, Wishlist, Order
    │   ├── pages/admin/    # Dashboard, ProductList, ProductEdit,
    │   │                   # CategoryList, OrderList, UserList
    │   ├── redux/slices/   # productSlice (paginated + reviews),
    │   │                   # cartSlice, userSlice, orderSlice, wishlistSlice
    │   ├── services/api.js
    │   ├── styles/         # global, toast, navbar, product, cart, forms,
    │   │                   # admin, reviews, search, wishlist, checkout
    │   ├── utils/imageUrl.js
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local install **or** an Atlas cluster)
- A Stripe account (for testing payments — free)
- The Stripe CLI (only for testing webhooks locally) — https://stripe.com/docs/stripe-cli

## Environment variables

### `backend/.env`

```env
MONGO_URI=mongodb://localhost:27017/mern_ecommerce
JWT_SECRET=<any long random string>
PORT=5000

# Stripe — get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# Printed by `stripe listen` (next section)
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> `CLIENT_URL` must match the actual URL the browser uses (Vite serves on `5173` by default).

## Install & run

```powershell
# Backend
cd backend
npm install
Copy-Item .env.example .env    # then edit the values above
npm run seed                   # populate sample data + admin
npm run dev                    # API on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                    # UI on http://localhost:5173
```

Default admin: **admin@shop.com** / **123456**.

## Testing Stripe locally

In a third terminal, with the Stripe CLI installed and `stripe login` run once:

```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
```

The CLI prints a `whsec_…` value — paste it into `backend/.env` as `STRIPE_WEBHOOK_SECRET`, then restart the backend.

To pay an order:
1. Sign in → add a product to cart → checkout → select **Stripe** → **Place Order & Pay**.
2. You land on Stripe Checkout. Use the test card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
3. On success Stripe redirects to `/order/:id?payment=success`. The webhook flips `isPaid=true` and the order page reflects it (it polls briefly for the update).

Other useful CLI commands:

```bash
stripe trigger checkout.session.completed   # replay a webhook
```

## API routes

Base URL: `http://localhost:5000/api`

### Users / Auth

| Method | Path                       | Auth        | Purpose                       |
| ------ | -------------------------- | ----------- | ----------------------------- |
| POST   | `/users`                   | public      | Register (returns JWT)        |
| POST   | `/users/login`             | public      | Login (returns JWT)           |
| GET    | `/users/profile`           | user        | Current user                  |
| PUT    | `/users/profile`           | user        | Update profile                |
| GET    | `/users`                   | admin       | List users                    |
| GET    | `/users/:id`               | admin       | Single user                   |
| PUT    | `/users/:id`               | admin       | Update (toggle `isAdmin`)     |
| DELETE | `/users/:id`               | admin       | Delete user                   |

### Wishlist

| Method | Path                          | Auth | Purpose                          |
| ------ | ----------------------------- | ---- | -------------------------------- |
| GET    | `/users/wishlist`             | user | Get wishlist (populated)         |
| POST   | `/users/wishlist/:productId`  | user | Add (idempotent via `$addToSet`) |
| DELETE | `/users/wishlist/:productId`  | user | Remove                           |

### Categories

| Method | Path              | Auth   |
| ------ | ----------------- | ------ |
| GET    | `/categories`     | public |
| GET    | `/categories/:id` | public |
| POST   | `/categories`     | admin  |
| PUT    | `/categories/:id` | admin  |
| DELETE | `/categories/:id` | admin  |

### Products

| Method | Path                                | Auth          | Purpose                                                              |
| ------ | ----------------------------------- | ------------- | -------------------------------------------------------------------- |
| GET    | `/products`                         | public        | List — supports `?keyword`, `?category`, `?minPrice`, `?maxPrice`, `?sortBy` (`newest \| price_asc \| price_desc \| rating \| popular`), `?page`, `?limit`. Returns `{ products, page, pages, total }` |
| GET    | `/products/:id`                     | public        | Single product (with `category`)                                     |
| POST   | `/products`                         | admin         | Create                                                               |
| PUT    | `/products/:id`                     | admin         | Update                                                               |
| DELETE | `/products/:id`                     | admin         | Delete                                                               |
| POST   | `/products/:id/reviews`             | user          | Add review (one per user, recomputes avg + count)                    |
| DELETE | `/products/:id/reviews/:reviewId`   | owner / admin | Delete review (recomputes avg + count)                               |

### Orders

| Method | Path                                  | Auth          | Purpose                              |
| ------ | ------------------------------------- | ------------- | ------------------------------------ |
| POST   | `/orders`                             | user          | Create order from cart               |
| GET    | `/orders/myorders`                    | user          | Current user's orders                |
| GET    | `/orders/:id`                         | owner / admin | Order details                        |
| PUT    | `/orders/:id/pay`                     | owner / admin | Mark paid (manual)                   |
| GET    | `/orders`                             | admin         | All orders                           |
| PUT    | `/orders/:id/deliver`                 | admin         | Mark delivered                       |
| POST   | `/orders/:id/create-checkout-session` | owner         | Returns `{ url }` — Stripe Checkout  |
| POST   | `/orders/webhook`                     | Stripe        | `checkout.session.completed` → paid  |

### Uploads

| Method | Path      | Auth  | Purpose                                                                |
| ------ | --------- | ----- | ---------------------------------------------------------------------- |
| POST   | `/upload` | admin | `multipart/form-data` field `image`; returns `{ path: "/uploads/..." }` |

## Frontend routes

| Path                          | Access | Page                                  |
| ----------------------------- | ------ | ------------------------------------- |
| `/`                           | public | Home (latest products)                |
| `/search`                     | public | Browse all with filters + pagination  |
| `/search/:keyword`            | public | Same with keyword (debounced from navbar) |
| `/product/:id`                | public | Product details + reviews + wishlist  |
| `/cart`                       | public | Cart                                  |
| `/login`, `/register`         | public | Auth (supports `?redirect=`)          |
| `/profile`                    | user   | Profile + my orders                   |
| `/checkout`                   | user   | Shipping + payment + place order      |
| `/wishlist`                   | user   | Wishlist grid                         |
| `/order/:id`                  | user   | Order details (Stripe redirect lands here) |
| `/admin`                      | admin  | Dashboard                             |
| `/admin/products`             | admin  | Product table                         |
| `/admin/products/new`         | admin  | Create product (upload image)         |
| `/admin/products/:id/edit`    | admin  | Edit product                          |
| `/admin/categories`           | admin  | Categories (inline CRUD)              |
| `/admin/orders`               | admin  | Orders + mark delivered               |
| `/admin/users`                | admin  | Users + toggle admin / delete         |

## Testing each feature manually

### Reviews & ratings
1. Sign in as any user, open a product page.
2. Submit a review (1–5 stars + comment). Form hides on success.
3. Star rating on the card and the detail page should reflect the new average.
4. Try to submit a second review → the form is replaced by an "already reviewed" notice.
5. Delete your own review (trash icon). Sign in as admin to delete any review.

### Search + filters
1. From the navbar, type a query (debounced 300 ms) — navigates to `/search/:keyword`.
2. Use the sidebar: category, min/max price, sort. URL query string updates and is shareable.
3. Use pagination at the bottom (Prev / numbers / Next).
4. "Reset filters" clears all and returns to page 1.

### Wishlist
1. As a signed-in user, click the heart on a card or product page.
2. Open `/wishlist` from the navbar — item is there with "Add to Cart" + "Remove".
3. Sign out and try to favorite — you're redirected to `/login`.
4. Heart button is idempotent; double-clicking toggles add/remove cleanly.

### Stripe Checkout
1. Make sure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL=http://localhost:5173` are set in `backend/.env`.
2. Run `stripe listen --forward-to localhost:5000/api/orders/webhook` in a separate terminal.
3. Cart → Checkout → choose **Stripe** → **Place Order & Pay**.
4. On Stripe Checkout, pay with `4242 4242 4242 4242`. Redirect lands on `/order/:id?payment=success`, a toast appears, and the page polls briefly until the webhook marks `isPaid=true`.
5. Try the Cancel button on Stripe → redirects back with `?payment=cancelled` and an error toast.

## Seeding

```powershell
cd backend
npm run seed             # wipe + seed sample data
npm run seed:destroy     # wipe only
```

Admin credentials: `admin@shop.com` / `123456`.
