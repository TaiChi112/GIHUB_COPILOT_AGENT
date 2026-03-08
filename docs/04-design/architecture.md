# System Architecture - E-commerce Platform MVP

## Overview

This document provides the complete technical architecture for ShopHub, including folder structure, database schema, API specifications, and system diagrams.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [Authentication Flow](#4-authentication-flow)
5. [Payment Flow](#5-payment-flow)
6. [Technology Stack Details](#6-technology-stack-details)
7. [Environment Variables](#7-environment-variables)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. Project Structure

### 1.1 Monorepo Organization

```
ecommerce-mvp/
├── packages/
│   ├── backend/              # Elysia API server
│   ├── frontend/             # Next.js application
│   └── shared/               # Shared TypeScript types
├── docs/                     # Documentation
│   ├── 01-planning/
│   ├── 02-requirements/
│   ├── 03-analysis/
│   └── 04-design/            # This file
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/            # CI/CD (optional)
├── .gitignore
├── package.json              # Root workspace config
├── bun.lockb
└── README.md
```

### 1.2 Backend Structure (`packages/backend/`)

```
packages/backend/
├── src/
│   ├── routes/               # API route handlers
│   │   ├── auth.ts           # /api/auth/* endpoints
│   │   ├── products.ts       # /api/products/* endpoints
│   │   ├── cart.ts           # /api/cart/* endpoints
│   │   ├── orders.ts         # /api/orders/* endpoints
│   │   └── payments.ts       # /api/payments/* and /api/webhooks/stripe
│   │
│   ├── services/             # Business logic layer
│   │   ├── authService.ts    # JWT generation, password hashing
│   │   ├── productService.ts # CRUD operations for products
│   │   ├── cartService.ts    # Cart management logic
│   │   ├── orderService.ts   # Order creation, status updates
│   │   └── paymentService.ts # Stripe integration
│   │
│   ├── db/                   # Database layer
│   │   ├── schema.ts         # Drizzle ORM schema definitions
│   │   ├── index.ts          # Database connection setup
│   │   └── migrations/       # SQL migration files
│   │
│   ├── middleware/           # Elysia middleware
│   │   ├── auth.ts           # JWT verification middleware
│   │   ├── validation.ts     # Zod schema validation
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── cors.ts           # CORS configuration
│   │
│   ├── types/                # Backend-specific types
│   │   └── index.ts          # Request/Response types
│   │
│   ├── utils/                # Utility functions
│   │   ├── jwt.ts            # JWT helper functions
│   │   └── validation.ts     # Custom validators
│   │
│   └── index.ts              # Elysia app entry point
│
├── .env.example              # Environment variables template
├── bunfig.toml               # Bun configuration
├── drizzle.config.ts         # Drizzle ORM config
├── package.json
└── tsconfig.json
```

### 1.3 Frontend Structure (`packages/frontend/`)

```
packages/frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth route group (no navbar)
│   │   │   ├── layout.tsx    # Auth layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx  # Login page
│   │   │   └── register/
│   │   │       └── page.tsx  # Registration page
│   │   │
│   │   ├── (dashboard)/      # Main app route group
│   │   │   ├── layout.tsx    # Main layout with navbar
│   │   │   ├── page.tsx      # Home/product listing
│   │   │   ├── products/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx  # Shopping cart
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx  # Checkout with Stripe
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx  # Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Order detail
│   │   │   └── admin/
│   │   │       ├── layout.tsx    # Admin-only wrapper
│   │   │       ├── products/
│   │   │       │   ├── page.tsx      # Product management list
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # Create product
│   │   │       │   └── [id]/
│   │   │       │       └── edit/
│   │   │       │           └── page.tsx  # Edit product
│   │   │       └── orders/
│   │   │           └── page.tsx      # All orders (admin view)
│   │   │
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   │
│   ├── components/           # Reusable React components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── ProductCard.tsx   # Product display card
│   │   ├── CartItem.tsx      # Cart item row
│   │   └── OrderSummary.tsx  # Order summary display
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Auth context hook
│   │   ├── useCart.ts        # Cart context hook
│   │   └── useApi.ts         # API client hook
│   │
│   ├── lib/                  # Library code
│   │   ├── api.ts            # API client (Axios/fetch wrapper)
│   │   ├── auth.ts           # Auth utilities (token management)
│   │   └── constants.ts      # App constants
│   │
│   ├── providers/            # React Context providers
│   │   ├── AuthProvider.tsx  # Auth state management
│   │   └── CartProvider.tsx  # Cart state management
│   │
│   └── types/                # Frontend-specific types
│       └── index.ts          # Component prop types
│
├── public/                   # Static assets
│   ├── images/
│   └── favicon.ico
│
├── .env.local.example        # Environment variables template
├── next.config.js            # Next.js configuration
├── package.json
├── postcss.config.js         # PostCSS config (Tailwind)
├── tailwind.config.js        # Tailwind CSS config
└── tsconfig.json
```

### 1.4 Shared Package Structure (`packages/shared/`)

```
packages/shared/
├── src/
│   └── types/                # Shared TypeScript types
│       ├── user.ts           # User, LoginDTO, RegisterDTO
│       ├── product.ts        # Product, CreateProductDTO, UpdateProductDTO
│       ├── cart.ts           # CartItem, AddToCartDTO
│       ├── order.ts          # Order, OrderItem, CreateOrderDTO
│       ├── payment.ts        # PaymentIntent, PaymentStatus
│       └── index.ts          # Export all types
│
├── package.json
└── tsconfig.json
```

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │──┐
│ email           │  │
│ password_hash   │  │
│ role            │  │
│ full_name       │  │
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
                     │
        ┌────────────┴────────────┬─────────────────────────┐
        │                         │                         │
        │ created_by              │ user_id                 │ user_id
        │                         │                         │
┌───────▼──────────┐    ┌─────────▼──────┐    ┌───────────▼─────────┐
│    products      │    │  cart_items    │    │      orders         │
├──────────────────┤    ├────────────────┤    ├─────────────────────┤
│ id (PK)          │──┐ │ id (PK)        │    │ id (PK)             │──┐
│ sku              │  │ │ user_id (FK)   │──┐ │ user_id (FK)        │  │
│ name             │  │ │ product_id (FK)│  │ │ status              │  │
│ description      │  │ │ quantity       │  │ │ total_amount        │  │
│ price            │  │ │ added_at       │  │ │ payment_method      │  │
│ stock_quantity   │  │ └────────────────┘  │ │ stripe_payment_...  │  │
│ category         │  │         │           │ │ created_at          │  │
│ created_by (FK)  │  │         └───────────┘ │ updated_at          │  │
│ created_at       │  │                       └─────────────────────┘  │
│ updated_at       │  │                                  │ order_id    │
└──────────────────┘  │                                  │             │
         │            │                       ┌──────────▼──────────┐  │
         └────────────┴───────────────────────┤   order_items       │  │
                      product_id              ├─────────────────────┤  │
                                              │ id (PK)             │  │
                                              │ order_id (FK)       │──┘
                                              │ product_id (FK)     │
                                              │ quantity            │
                                              │ unit_price          │
                                              │ created_at          │
                                              └─────────────────────┘

┌─────────────────────┐
│  refresh_tokens     │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │──→ users.id
│ token_hash          │
│ expires_at          │
│ created_at          │
└─────────────────────┘
```

### 2.2 Table Definitions (PostgreSQL)

#### 2.2.1 `users` Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Columns:**
- `id`: UUID primary key
- `email`: Unique email address (lowercase)
- `password_hash`: Bcrypt hashed password
- `role`: User role ('customer' or 'admin')
- `full_name`: User's full name
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

#### 2.2.2 `products` Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0.01),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  category VARCHAR(100),
  image_url VARCHAR(500),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_products_sku ON products(UPPER(sku));
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
```

**Columns:**
- `id`: UUID primary key
- `sku`: Unique stock keeping unit (case-insensitive)
- `name`: Product name
- `description`: Optional product description
- `price`: Product price (USD, 2 decimal places)
- `stock_quantity`: Available inventory
- `category`: Optional category for filtering
- `image_url`: Optional product image URL
- `created_by`: Foreign key to admin user who created product
- `created_at`: Product creation timestamp
- `updated_at`: Last update timestamp

#### 2.2.3 `cart_items` Table

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_product UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_added_at ON cart_items(added_at);
```

**Columns:**
- `id`: UUID primary key
- `user_id`: Foreign key to user who owns cart
- `product_id`: Foreign key to product in cart
- `quantity`: Number of items
- `added_at`: When item was added to cart

**Constraints:**
- Unique combination of (user_id, product_id) prevents duplicate items
- CASCADE delete when user or product is deleted

#### 2.2.4 `orders` Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
```

**Columns:**
- `id`: UUID primary key
- `user_id`: Foreign key to customer who placed order
- `status`: Order status (pending, paid, shipped, delivered, cancelled)
- `total_amount`: Total order amount (USD)
- `payment_method`: Payment method used (e.g., "Card")
- `stripe_payment_intent_id`: Stripe PaymentIntent ID for correlation
- `created_at`: Order creation timestamp
- `updated_at`: Last status update timestamp

#### 2.2.5 `order_items` Table

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

**Columns:**
- `id`: UUID primary key
- `order_id`: Foreign key to parent order
- `product_id`: Foreign key to product (snapshot, not deleted if product deleted)
- `quantity`: Number of items ordered
- `unit_price`: Price per item at time of order (frozen)
- `created_at`: Item creation timestamp

**Note:** `unit_price` preserves historical pricing

#### 2.2.6 `refresh_tokens` Table

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

**Columns:**
- `id`: UUID primary key
- `user_id`: Foreign key to user who owns token
- `token_hash`: Hashed refresh token (never store plain token)
- `expires_at`: Token expiration timestamp (7 days from creation)
- `created_at`: Token creation timestamp

**Cleanup Job:**
```sql
-- Run periodically (cron job)
DELETE FROM refresh_tokens WHERE expires_at < NOW();
```

---

## 3. API Endpoints

### 3.1 Authentication Endpoints

#### POST `/api/auth/register`
**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer"
  }
}
```

**Errors:**
- 400: Validation error (invalid email, weak password)
- 409: Email already registered

---

#### POST `/api/auth/login`
**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer"
  }
}
```

**Set-Cookie Header:**
```
refreshToken=abc123...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Errors:**
- 400: Invalid email or password
- 401: Invalid credentials

---

#### POST `/api/auth/refresh`
**Description:** Refresh access token using refresh token

**Request:** Refresh token sent via httpOnly cookie

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
}
```

**Set-Cookie Header:** New refresh token (rotation)

**Errors:**
- 401: Invalid or expired refresh token

---

#### GET `/api/auth/me`
**Description:** Get current user profile

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "created_at": "2026-03-07T10:00:00Z"
}
```

**Errors:**
- 401: Unauthorized (no token or invalid token)

---

#### POST `/api/auth/logout`
**Description:** Logout and revoke refresh token

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Set-Cookie Header:** Clear refresh token cookie

---

### 3.2 Product Endpoints

#### GET `/api/products`
**Description:** List all products (public, paginated)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` (optional filter)
- `search` (optional search term)

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "uuid",
      "sku": "LAPTOP-001",
      "name": "MacBook Pro",
      "description": "...",
      "price": 1999.99,
      "stock_quantity": 10,
      "category": "Electronics",
      "image_url": "https://...",
      "created_at": "2026-03-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### GET `/api/products/:id`
**Description:** Get product details by ID (public)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "sku": "LAPTOP-001",
  "name": "MacBook Pro",
  "description": "High-performance laptop...",
  "price": 1999.99,
  "stock_quantity": 10,
  "category": "Electronics",
  "image_url": "https://...",
  "created_at": "2026-03-07T10:00:00Z",
  "updated_at": "2026-03-07T10:00:00Z"
}
```

**Errors:**
- 404: Product not found

---

#### POST `/api/admin/products` (Admin Only)
**Description:** Create new product

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "sku": "LAPTOP-002",
  "name": "Dell XPS 15",
  "description": "Windows laptop",
  "price": 1499.99,
  "stock_quantity": 5,
  "category": "Electronics",
  "image_url": "https://..."
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "sku": "LAPTOP-002",
  "name": "Dell XPS 15",
  ...
}
```

**Errors:**
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (not admin)
- 409: SKU already exists

---

#### PUT `/api/admin/products/:id` (Admin Only)
**Description:** Update existing product

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:** (partial update supported)
```json
{
  "price": 1299.99,
  "stock_quantity": 15
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "sku": "LAPTOP-002",
  "name": "Dell XPS 15",
  "price": 1299.99,
  "stock_quantity": 15,
  ...
}
```

**Errors:**
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Product not found

---

#### DELETE `/api/admin/products/:id` (Admin Only)
**Description:** Delete product

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "message": "Product deleted successfully"
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Product not found

---

### 3.3 Shopping Cart Endpoints

#### GET `/api/cart`
**Description:** Get current user's cart

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "MacBook Pro",
        "price": 1999.99,
        "stock_quantity": 10,
        "image_url": "https://..."
      },
      "quantity": 2,
      "added_at": "2026-03-07T10:00:00Z"
    }
  ],
  "total": 3999.98
}
```

**Errors:**
- 401: Unauthorized

---

#### POST `/api/cart/items`
**Description:** Add item to cart

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "message": "Item added to cart",
  "cart_item": {
    "id": "uuid",
    "product_id": "uuid",
    "quantity": 2
  }
}
```

**Errors:**
- 400: Invalid quantity or insufficient stock
- 401: Unauthorized
- 404: Product not found

---

#### PUT `/api/cart/items/:itemId`
**Description:** Update cart item quantity

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200 OK):**
```json
{
  "message": "Cart item updated",
  "cart_item": {
    "id": "uuid",
    "quantity": 5
  }
}
```

**Errors:**
- 400: Invalid quantity or insufficient stock
- 401: Unauthorized
- 404: Cart item not found

---

#### DELETE `/api/cart/items/:itemId`
**Description:** Remove item from cart

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "message": "Item removed from cart"
}
```

**Errors:**
- 401: Unauthorized
- 404: Cart item not found

---

#### DELETE `/api/cart`
**Description:** Clear entire cart

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "message": "Cart cleared successfully"
}
```

**Errors:**
- 401: Unauthorized

---

### 3.4 Order Endpoints

#### POST `/api/orders`
**Description:** Create order from cart (before payment)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (201 Created):**
```json
{
  "order": {
    "id": "uuid",
    "status": "pending",
    "total_amount": 3999.98,
    "items": [
      {
        "product_id": "uuid",
        "product_name": "MacBook Pro",
        "quantity": 2,
        "unit_price": 1999.99
      }
    ],
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

**Errors:**
- 400: Cart is empty or validation failed
- 401: Unauthorized

---

#### GET `/api/orders`
**Description:** Get user's order history

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "status": "paid",
      "total_amount": 3999.98,
      "created_at": "2026-03-07T10:00:00Z"
    }
  ]
}
```

**Errors:**
- 401: Unauthorized

---

#### GET `/api/orders/:id`
**Description:** Get order details

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "paid",
  "total_amount": 3999.98,
  "payment_method": "Card",
  "stripe_payment_intent_id": "pi_...",
  "items": [
    {
      "product_name": "MacBook Pro",
      "quantity": 2,
      "unit_price": 1999.99,
      "subtotal": 3999.98
    }
  ],
  "created_at": "2026-03-07T10:00:00Z",
  "updated_at": "2026-03-07T10:05:00Z"
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (not owner and not admin)
- 404: Order not found

---

### 3.5 Payment Endpoints

#### POST `/api/payments/create-intent`
**Description:** Create Stripe PaymentIntent for order

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "order_id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "client_secret": "pi_..._secret_...",
  "payment_intent_id": "pi_..."
}
```

**Errors:**
- 400: Invalid order or order already paid
- 401: Unauthorized
- 500: Stripe API error

---

#### POST `/api/webhooks/stripe`
**Description:** Stripe webhook handler (payment events)

**Headers:**
```
Stripe-Signature: t=...,v1=...
```

**Request Body:** Stripe event JSON (varies by event type)

**Handled Events:**
- `payment_intent.succeeded`: Update order status to "paid", deduct stock, clear cart
- `payment_intent.payment_failed`: Update order status to "cancelled"

**Response (200 OK):**
```json
{
  "received": true
}
```

**Errors:**
- 400: Invalid signature

---

## 4. Authentication Flow

### 4.1 Registration & Login Flow Diagram

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│ Browser │                 │ Backend │                │ Database │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │  POST /api/auth/register  │                          │
     ├──────────────────────────>│                          │
     │  {email, password, name}  │                          │
     │                           │  Hash password (bcrypt)  │
     │                           │                          │
     │                           │  INSERT INTO users       │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │  User created            │
     │                           │<─────────────────────────┤
     │  201 Created              │                          │
     │<──────────────────────────┤                          │
     │  {user}                   │                          │
     │                           │                          │
     │  POST /api/auth/login     │                          │
     ├──────────────────────────>│                          │
     │  {email, password}        │                          │
     │                           │  SELECT user WHERE email │
     │                           ├─────────────────────────>│
     │                           │  User record             │
     │                           │<─────────────────────────┤
     │                           │                          │
     │                           │  Verify password         │
     │                           │  (bcrypt.compare)        │
     │                           │                          │
     │                           │  Generate JWT tokens:    │
     │                           │  - Access (30min)        │
     │                           │  - Refresh (7days)       │
     │                           │                          │
     │                           │  INSERT refresh_token    │
     │                           ├─────────────────────────>│
     │                           │                          │
     │  200 OK                   │                          │
     │<──────────────────────────┤                          │
     │  {accessToken, user}      │                          │
     │  Set-Cookie: refreshToken │                          │
     │                           │                          │
```

### 4.2 Token Refresh Flow

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│ Browser │                 │ Backend │                │ Database │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │  API call with expired    │                          │
     │  access token             │                          │
     ├──────────────────────────>│                          │
     │  Authorization: Bearer... │  Verify JWT              │
     │                           │  (token expired)         │
     │  401 Unauthorized         │                          │
     │<──────────────────────────┤                          │
     │                           │                          │
     │  POST /api/auth/refresh   │                          │
     ├──────────────────────────>│                          │
     │  Cookie: refreshToken     │                          │
     │                           │  Hash token              │
     │                           │                          │
     │                           │  SELECT FROM refresh_... │
     │                           ├─────────────────────────>│
     │                           │  Token record            │
     │                           │<─────────────────────────┤
     │                           │                          │
     │                           │  Validate expiry         │
     │                           │                          │
     │                           │  DELETE old token        │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │  Generate new tokens     │
     │                           │                          │
     │                           │  INSERT new refresh_...  │
     │                           ├─────────────────────────>│
     │                           │                          │
     │  200 OK                   │                          │
     │<──────────────────────────┤                          │
     │  {accessToken}            │                          │
     │  Set-Cookie: new refresh  │                          │
     │                           │                          │
     │  Retry original API call  │                          │
     ├──────────────────────────>│                          │
     │  Authorization: Bearer... │                          │
     │  (new access token)       │                          │
     │                           │                          │
```

---

## 5. Payment Flow

### 5.1 Checkout & Payment Flow Diagram

```
┌─────────┐         ┌─────────┐        ┌─────────┐        ┌──────────┐
│ Browser │         │ Backend │        │  Stripe │        │ Database │
└────┬────┘         └────┬────┘        └────┬────┘        └────┬─────┘
     │                   │                   │                  │
     │  User clicks      │                   │                  │
     │  "Checkout"       │                   │                  │
     │                   │                   │                  │
     │  POST /api/orders │                   │                  │
     ├──────────────────>│                   │                  │
     │                   │  Validate cart    │                  │
     │                   ├──────────────────────────────────────>│
     │                   │  (stock, prices)  │                  │
     │                   │                   │                  │
     │                   │  INSERT INTO orders                  │
     │                   │  (status:'pending')                  │
     │                   ├──────────────────────────────────────>│
     │  201 Created      │                   │                  │
     │<──────────────────┤                   │                  │
     │  {order}          │                   │                  │
     │                   │                   │                  │
     │  POST /payments/  │                   │                  │
     │  create-intent    │                   │                  │
     ├──────────────────>│                   │                  │
     │  {order_id}       │                   │                  │
     │                   │  stripe.paymentIntents.create        │
     │                   ├──────────────────>│                  │
     │                   │  {amount, metadata}                  │
     │                   │                   │                  │
     │                   │  PaymentIntent    │                  │
     │                   │<──────────────────┤                  │
     │                   │  {client_secret}  │                  │
     │                   │                   │                  │
     │                   │  UPDATE orders    │                  │
     │                   │  SET stripe_payment_intent_id        │
     │                   ├──────────────────────────────────────>│
     │  200 OK           │                   │                  │
     │<──────────────────┤                   │                  │
     │  {client_secret}  │                   │                  │
     │                   │                   │                  │
     │  Display Stripe   │                   │                  │
     │  card form        │                   │                  │
     │                   │                   │                  │
     │  User submits     │                   │                  │
     │  card details     │                   │                  │
     │                   │                   │                  │
     │  stripe.confirmCardPayment            │                  │
     ├──────────────────────────────────────>│                  │
     │  {client_secret, card_number}         │                  │
     │                   │                   │                  │
     │                   │                   │  Process payment │
     │                   │                   │                  │
     │  Payment result   │                   │                  │
     │<──────────────────────────────────────┤                  │
     │  {status: 'succeeded'}                │                  │
     │                   │                   │                  │
     │  Redirect to      │                   │                  │
     │  order confirmation                   │                  │
     │                   │                   │                  │
     │                   │  Webhook:         │                  │
     │                   │  payment_intent.succeeded            │
     │                   │<──────────────────┤                  │
     │                   │                   │                  │
     │                   │  Verify signature │                  │
     │                   │                   │                  │
     │                   │  BEGIN TRANSACTION                   │
     │                   ├──────────────────────────────────────>│
     │                   │  UPDATE orders SET status='paid'     │
     │                   │                                      │
     │                   │  UPDATE products                     │
     │                   │  SET stock_quantity -= quantity      │
     │                   │  (for each order item)               │
     │                   │                                      │
     │                   │  DELETE FROM cart_items              │
     │                   │  WHERE user_id = ...                 │
     │                   │                                      │
     │                   │  COMMIT                              │
     │                   │<──────────────────────────────────────┤
     │                   │                   │                  │
     │                   │  200 OK           │                  │
     │                   ├──────────────────>│                  │
     │                   │  {received: true} │                  │
     │                   │                   │                  │
```

### 5.2 Payment Failure Flow

```
┌─────────┐         ┌─────────┐        ┌─────────┐        ┌──────────┐
│ Browser │         │ Backend │        │  Stripe │        │ Database │
└────┬────┘         └────┬────┘        └────┬────┘        └────┬─────┘
     │                   │                   │                  │
     │  (Payment fails   │                   │                  │
     │   in Stripe UI)   │                   │                  │
     │                   │                   │                  │
     │  Error displayed  │                   │                  │
     │  (insufficient    │                   │                  │
     │   funds, etc.)    │                   │                  │
     │                   │                   │                  │
     │                   │  Webhook:         │                  │
     │                   │  payment_intent.payment_failed       │
     │                   │<──────────────────┤                  │
     │                   │                   │                  │
     │                   │  UPDATE orders    │                  │
     │                   │  SET status='cancelled'              │
     │                   ├──────────────────────────────────────>│
     │                   │                   │                  │
     │                   │  200 OK           │                  │
     │                   ├──────────────────>│                  │
     │                   │                   │                  │
     │  User can retry   │                   │                  │
     │  with different   │                   │                  │
     │  payment method   │                   │                  │
     │                   │                   │                  │
```

---

## 6. Technology Stack Details

### 6.1 Backend Dependencies

**Primary Framework:**
- `elysia`: ^1.0.0 (Web framework for Bun)

**Database:**
- `drizzle-orm`: ^0.30.0 (TypeScript ORM)
- `postgres`: ^3.4.0 (PostgreSQL client for Drizzle)

**Authentication:**
- `jose`: ^5.2.0 (JWT implementation)
- `bcrypt`: ^5.1.1 (Password hashing)

**Validation:**
- `zod`: ^3.22.0 (Schema validation)

**Payment:**
- `stripe`: ^14.0.0 (Stripe SDK)

**Utilities:**
- `@elysiajs/cors`: ^1.0.0 (CORS middleware)

### 6.2 Frontend Dependencies

**Primary Framework:**
- `next`: ^14.2.0 (React framework)
- `react`: ^18.3.0
- `react-dom`: ^18.3.0

**Styling:**
- `tailwindcss`: ^3.4.0
- `autoprefixer`: ^10.4.0
- `postcss`: ^8.4.0

**Payment:**
- `@stripe/stripe-js`: ^3.0.0 (Stripe frontend SDK)
- `@stripe/react-stripe-js`: ^2.6.0 (React components for Stripe)

**API Client:**
- `axios`: ^1.6.0 (HTTP client)

**Validation:**
- `zod`: ^3.22.0 (Client-side validation)

**Utilities:**
- `clsx`: ^2.1.0 (Conditional classNames)

### 6.3 Development Dependencies

**TypeScript:**
- `typescript`: ^5.3.0
- `@types/node`: ^20.11.0
- `@types/react`: ^18.2.0

**Tools:**
- `drizzle-kit`: ^0.20.0 (Database migrations)
- `eslint`: ^8.56.0
- `prettier`: ^3.2.0

---

## 7. Environment Variables

### 7.1 Backend Environment Variables (`.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_mvp

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# JWT Expiration
JWT_ACCESS_EXPIRATION=30m
JWT_REFRESH_EXPIRATION=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### 7.2 Frontend Environment Variables (`.env.local`)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 8. Deployment Architecture

### 8.1 Development Environment

```
┌─────────────────────────────────────────┐
│          Developer Machine              │
│                                         │
│  ┌─────────────┐    ┌────────────────┐ │
│  │  Frontend   │    │    Backend     │ │
│  │  (Next.js)  │    │   (Elysia)     │ │
│  │  Port 3000  │◄───┤   Port 4000    │ │
│  └─────────────┘    └────────┬───────┘ │
│                              │         │
│                     ┌────────▼───────┐ │
│                     │   PostgreSQL   │ │
│                     │   Port 5432    │ │
│                     └────────────────┘ │
└─────────────────────────────────────────┘
```

### 8.2 Production Environment (Recommended)

```
┌──────────────┐
│   Client     │
│  (Browser)   │
└──────┬───────┘
       │
       │ HTTPS
       │
       ▼
┌─────────────────────────────────────────┐
│           Vercel (Frontend)             │
│  ┌────────────────────────────────────┐ │
│  │   Next.js App (Static + SSR)      │ │
│  │   Edge CDN (Global distribution)   │ │
│  └──────────────┬─────────────────────┘ │
└─────────────────┼───────────────────────┘
                  │ API Calls
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Railway / Render (Backend)         │
│  ┌────────────────────────────────────┐ │
│  │   Elysia API Server (Bun runtime) │ │
│  └──────────────┬─────────────────────┘ │
│                 │                       │
│  ┌──────────────▼─────────────────────┐ │
│  │   PostgreSQL (Managed Database)   │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │ Webhooks
               │
        ┌──────▼──────┐
        │   Stripe    │
        │  (Payments) │
        └─────────────┘
```

**Production Checklist:**
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Set `NODE_ENV=production`
- [ ] Use production Stripe keys (not test keys)
- [ ] Configure CORS to allow only production frontend URL
- [ ] Enable database connection pooling
- [ ] Setup database backups (daily)
- [ ] Configure Stripe webhook endpoint URL
- [ ] Setup monitoring (error tracking, uptime)
- [ ] Enable rate limiting on API endpoints
- [ ] Review and rotate secrets (JWT keys, database passwords)

---

## 9. File Naming Conventions

**Backend:**
- Route files: `camelCase.ts` (e.g., `auth.ts`, `products.ts`)
- Service files: `camelCaseService.ts` (e.g., `authService.ts`)
- Types: `PascalCase` (e.g., `User`, `Product`)

**Frontend:**
- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `ProductCard.tsx`)
- Pages: `page.tsx` (Next.js App Router convention)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `api.ts`, `auth.ts`)

---

**Document Version:** 1.0  
**Last Updated:** March 7, 2026  
**Status:** ✅ Complete
