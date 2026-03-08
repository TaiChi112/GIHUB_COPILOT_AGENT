# ShopHub - E-commerce Platform MVP

A modern e-commerce platform built with Bun, TypeScript, Next.js, Elysia, and PostgreSQL. Designed for small business owners to easily manage products and accept payments online.

## 🚀 Features

### For Customers
- Browse products with search and category filters
- Shopping cart with persistent storage
- Secure checkout via Stripe
- Order history and tracking

### For Business Owners
- Product management (Create, Edit, Delete)
- Inventory tracking
- Order management
- Admin dashboard

## 🛠 Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Stripe.js

**Backend:**
- Elysia (Bun framework)
- Bun runtime
- TypeScript
- Drizzle ORM
- PostgreSQL

**Payment Processing:**
- Stripe

**Authentication:**
- JWT (Access + Refresh tokens)

## 📋 Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 15
- [Stripe Account](https://stripe.com) (for payments)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-mvp
```

### 2. Install dependencies

```bash
bun install
```

### 3. Setup PostgreSQL database

Create a new PostgreSQL database:

```bash
createdb ecommerce_mvp
```

Or using psql:

```sql
CREATE DATABASE ecommerce_mvp;
```

### 4. Configure environment variables

#### Backend (`packages/backend/.env`)

```bash
cd packages/backend
cp .env.example .env
```

Edit `.env` and configure:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_mvp
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Generate secure secrets:**

```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

#### Frontend (`packages/frontend/.env.local`)

```bash
cd packages/frontend
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Run database migrations

```bash
bun db:generate  # Generate migration files
bun db:migrate   # Apply migrations to database
```

### 6. Start development servers

```bash
bun dev
```

This starts:
- **Backend API**: http://localhost:4000
- **Frontend**: http://localhost:3000

Or start individually:

```bash
bun dev:backend   # Backend only (port 4000)
bun dev:frontend  # Frontend only (port 3000)
```

### 7. Create an admin user

Connect to your database and update a user's role:

```sql
-- First, register a user via the frontend
-- Then, promote them to admin:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 📁 Project Structure

```
ecommerce-mvp/
├── packages/
│   ├── backend/          # Elysia API server
│   ├── frontend/         # Next.js application
│   └── shared/           # Shared TypeScript types
├── docs/                 # Documentation
│   ├── 01-planning/
│   ├── 02-requirements/
│   ├── 03-analysis/
│   └── 04-design/
└── package.json          # Root workspace config
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start both backend and frontend in development mode |
| `bun dev:backend` | Start backend only (port 4000) |
| `bun dev:frontend` | Start frontend only (port 3000) |
| `bun build` | Build both backend and frontend for production |
| `bun db:generate` | Generate Drizzle migration files |
| `bun db:migrate` | Apply database migrations |
| `bun db:studio` | Open Drizzle Studio (database GUI) |
| `bun lint` | Run ESLint on all packages |
| `bun clean` | Remove all node_modules and build artifacts |

## 🔐 Authentication Flow

1. **Registration**: Users register with email, password, and full name
2. **Login**: Returns JWT access token (30min) + refresh token (7 days, httpOnly cookie)
3. **Token Refresh**: Automatically refreshes access token when expired
4. **Logout**: Revokes refresh token and clears cookies

## 💳 Payment Flow

1. User adds items to cart
2. Proceeds to checkout
3. System creates order with "pending" status
4. Stripe PaymentIntent is created
5. User enters card details (processed by Stripe)
6. Webhook confirms payment → order status set to "paid"
7. Stock is deducted, cart is cleared

## 📚 API Documentation

### Base URL: `http://localhost:4000`

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Product Endpoints

- `GET /api/products` - List products (public, paginated)
- `GET /api/products/:id` - Get product details (public)
- `POST /api/admin/products` - Create product (admin only)
- `PUT /api/admin/products/:id` - Update product (admin only)
- `DELETE /api/admin/products/:id` - Delete product (admin only)

### Cart Endpoints

- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update quantity
- `DELETE /api/cart/items/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Order Endpoints

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

### Payment Endpoints

- `POST /api/payments/create-intent` - Create Stripe PaymentIntent
- `POST /api/webhooks/stripe` - Stripe webhook handler

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (cost factor 10)
- ✅ JWT-based authentication (stateless)
- ✅ httpOnly, secure cookies for refresh tokens
- ✅ Token rotation (refresh tokens are one-time use)
- ✅ SQL injection protection via Drizzle ORM
- ✅ CORS configured for specific frontend origin
- ✅ Stripe webhook signature verification
- ✅ Input validation with Zod schemas

## 🧪 Testing with Stripe

Use Stripe test cards in development:

**Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Payment failure:**
- Card: `4000 0000 0000 0002`

[Full list of test cards](https://stripe.com/docs/testing)

## 🚀 Deployment

### Recommended Setup

**Frontend:** Deploy to [Vercel](https://vercel.com)
```bash
cd packages/frontend
vercel deploy
```

**Backend:** Deploy to [Railway](https://railway.app) or [Render](https://render.com)

### Configuration for Production

1. Set environment variables in hosting platform
2. Update `FRONTEND_URL` in backend .env to production URL
3. Update `NEXT_PUBLIC_API_URL` in frontend .env to backend API URL
4. Use production Stripe keys (not test keys)
5. Configure Stripe webhook URL: `https://your-backend.com/api/webhooks/stripe`
6. Enable database backups

## 📖 Documentation

For detailed documentation, see:

- [Vision & Scope](docs/01-planning/vision.md)
- [User Stories](docs/02-requirements/user-stories.md)
- [Business Rules](docs/03-analysis/business-rules.md)
- [Architecture Design](docs/04-design/architecture.md)

## 🤝 Contributing

This is an MVP project. For feature requests or bug reports, please open an issue.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Bun](https://bun.sh)
- [Next.js](https://nextjs.org)
- [Elysia](https://elysiajs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Stripe](https://stripe.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ for small business owners**
