# User Stories - E-commerce Platform MVP

## Overview

This document defines all user interactions for the ShopHub MVP using the "As a... I want... So that..." format. Each story includes specific, testable Acceptance Criteria (AC) to validate implementation.

**User Roles:**
- **Customer:** General public user who browses and purchases products
- **Admin/Business Owner:** User who manages products and views orders
- **System:** Automated processes (payments, webhooks)

---

## Authentication & User Management

### US-001: User Registration (Customer)

**As a** visitor  
**I want to** create a customer account  
**So that** I can make purchases and track my orders

**Acceptance Criteria:**
- [ ] Registration form collects: email, password, full name
- [ ] Email must be unique (show error if already exists)
- [ ] Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number
- [ ] Password is hashed using bcrypt before storage (never stored in plain text)
- [ ] On successful registration, user is redirected to login page with success message
- [ ] User role is automatically set to "customer"
- [ ] All fields are validated (email format, required fields)
- [ ] Error messages are clear and specific (e.g., "Email already registered")

**Priority:** P0 (Critical)

---

### US-002: User Login

**As a** registered user (customer or admin)  
**I want to** login with my credentials  
**So that** I can access my account features

**Acceptance Criteria:**
- [ ] Login form collects: email and password
- [ ] On successful login, system issues JWT access token (30 min expiry) and refresh token (7 days expiry)
- [ ] Access token is stored in memory (React state/context)
- [ ] Refresh token is stored in httpOnly, secure cookie
- [ ] After login, customer is redirected to product listing page
- [ ] After login, admin is redirected to admin dashboard
- [ ] Invalid credentials show error: "Invalid email or password"
- [ ] Login attempts are case-insensitive for email
- [ ] User session persists across browser refresh (via refresh token)

**Priority:** P0 (Critical)

---

### US-003: Token Refresh

**As a** logged-in user  
**I want** my session to automatically extend  
**So that** I don't get logged out while actively using the site

**Acceptance Criteria:**
- [ ] When access token expires (after 30 minutes), system automatically calls refresh endpoint
- [ ] Refresh endpoint validates refresh token from httpOnly cookie
- [ ] If valid, system issues new access token + new refresh token (rotation)
- [ ] Old refresh token is invalidated (one-time use)
- [ ] If refresh token is invalid/expired, user is logged out and redirected to login
- [ ] Token refresh happens transparently (no user action required)
- [ ] API calls automatically retry with new token after refresh

**Priority:** P0 (Critical)

---

### US-004: User Logout

**As a** logged-in user  
**I want to** logout from my account  
**So that** I can secure my session on shared devices

**Acceptance Criteria:**
- [ ] Logout button is visible in navigation bar when logged in
- [ ] On logout click, system clears access token from memory
- [ ] System makes API call to revoke refresh token in database
- [ ] httpOnly cookie is cleared
- [ ] User is redirected to home/login page
- [ ] After logout, protected pages redirect to login if accessed
- [ ] Logout works even if API call fails (client-side cleanup still happens)

**Priority:** P1 (High)

---

### US-005: View My Profile

**As a** logged-in user  
**I want to** view my profile information  
**So that** I can verify my account details

**Acceptance Criteria:**
- [ ] Profile page displays: email, full name, account role, registration date
- [ ] Profile page is accessible from navigation menu
- [ ] Only authenticated users can access profile page
- [ ] Profile data is fetched from `/api/auth/me` endpoint
- [ ] Password is never displayed (only "********" or omitted)
- [ ] Non-authenticated users redirected to login page

**Priority:** P2 (Medium)

---

## Product Browsing (Customer)

### US-006: Browse Product Catalog

**As a** customer  
**I want to** see a list of all available products  
**So that** I can discover items to purchase

**Acceptance Criteria:**
- [ ] Product listing page displays products in a grid layout (3-4 columns on desktop)
- [ ] Each product card shows: image (or placeholder), name, price, stock status
- [ ] Products are paginated (20 items per page)
- [ ] Pagination controls (Previous, Next, page numbers) are visible at bottom
- [ ] Page loads in under 3 seconds with 50 products
- [ ] Out-of-stock products are visually indicated (grayed out or "Out of Stock" badge)
- [ ] Products are sorted by newest first (created_at DESC)
- [ ] Page is accessible to both logged-in and non-logged-in users

**Priority:** P0 (Critical)

---

### US-007: Filter Products by Category

**As a** customer  
**I want to** filter products by category  
**So that** I can quickly find specific types of items

**Acceptance Criteria:**
- [ ] Category filter dropdown/sidebar shows all available categories
- [ ] Selecting a category reloads product list showing only items in that category
- [ ] "All Categories" option shows all products (clears filter)
- [ ] Category filter persists when navigating between pages
- [ ] URL reflects selected category (e.g., `/products?category=electronics`)
- [ ] Empty category shows message: "No products found in this category"
- [ ] Category list is dynamically generated from products in database

**Priority:** P1 (High)

---

### US-008: Search Products

**As a** customer  
**I want to** search for products by name  
**So that** I can quickly find specific items

**Acceptance Criteria:**
- [ ] Search bar is visible in navigation or product listing page
- [ ] Search matches product name (case-insensitive, partial match)
- [ ] Search results appear after typing (debounced by 500ms)
- [ ] Search works across all products, not just current page
- [ ] Empty search results show: "No products match your search"
- [ ] Search query persists in URL (e.g., `/products?search=laptop`)
- [ ] Clear search button removes search and shows all products

**Priority:** P2 (Medium)

---

### US-009: View Product Details

**As a** customer  
**I want to** view detailed information about a product  
**So that** I can make an informed purchase decision

**Acceptance Criteria:**
- [ ] Product detail page displays: image(s), name, full description, price, stock quantity, SKU, category
- [ ] "Add to Cart" button is visible and enabled if stock > 0
- [ ] "Add to Cart" button is disabled with "Out of Stock" text if stock = 0
- [ ] Quantity selector allows choosing 1 to min(10, stock_quantity)
- [ ] Page is accessible via URL: `/products/[product-id]`
- [ ] Invalid product ID shows 404 error page
- [ ] Page is accessible to both logged-in and non-logged-in users
- [ ] Clicking "Add to Cart" adds item to cart (see US-011)

**Priority:** P0 (Critical)

---

## Shopping Cart (Customer)

### US-010: View Shopping Cart

**As a** customer  
**I want to** view items in my shopping cart  
**So that** I can review my purchase before checkout

**Acceptance Criteria:**
- [ ] Cart page displays all items: product name, image, unit price, quantity, subtotal
- [ ] Cart shows total price (sum of all subtotals)
- [ ] Cart page is accessible from navigation icon/link
- [ ] Cart icon shows item count badge (e.g., "3 items")
- [ ] Empty cart shows message: "Your cart is empty" with link to continue shopping
- [ ] Cart page is only accessible to logged-in users (redirect to login otherwise)
- [ ] Cart data persists across sessions (stored in database, not just browser)

**Priority:** P0 (Critical)

---

### US-011: Add Product to Cart

**As a** customer  
**I want to** add a product to my cart  
**So that** I can purchase it later

**Acceptance Criteria:**
- [ ] Clicking "Add to Cart" on product detail page adds item to cart
- [ ] User can select quantity (default: 1, max: stock quantity)
- [ ] If product already in cart, quantity is increased (not duplicate entry)
- [ ] System validates stock availability before adding (prevent adding if stock < requested qty)
- [ ] Success message appears: "Added to cart" (toast notification)
- [ ] Cart icon count updates immediately
- [ ] User must be logged in (redirect to login if not authenticated)
- [ ] After adding, user can continue shopping or go to cart

**Priority:** P0 (Critical)

---

### US-012: Update Cart Item Quantity

**As a** customer  
**I want to** change the quantity of items in my cart  
**So that** I can adjust my order before checkout

**Acceptance Criteria:**
- [ ] Each cart item has quantity input/selector (+ and - buttons or text input)
- [ ] Changing quantity updates subtotal and cart total immediately
- [ ] Quantity cannot exceed current stock availability (show error if attempted)
- [ ] Quantity cannot be less than 1 (minimum is 1)
- [ ] System makes API call to update cart item in database
- [ ] Error message shown if stock insufficient: "Only X items available"
- [ ] Quantity changes persist across page refresh

**Priority:** P0 (Critical)

---

### US-013: Remove Item from Cart

**As a** customer  
**I want to** remove items from my cart  
**So that** I can change my mind about purchases

**Acceptance Criteria:**
- [ ] Each cart item has "Remove" or "X" button
- [ ] Clicking remove immediately removes item from cart (with confirmation modal optional)
- [ ] Cart total recalculates after removal
- [ ] Removed item is deleted from database
- [ ] Cart icon count updates immediately
- [ ] If removing last item, cart shows empty state

**Priority:** P0 (Critical)

---

### US-014: Clear Entire Cart

**As a** customer  
**I want to** clear all items from my cart at once  
**So that** I can start fresh

**Acceptance Criteria:**
- [ ] "Clear Cart" button is visible on cart page
- [ ] Clicking button shows confirmation modal: "Are you sure you want to clear your cart?"
- [ ] Confirming removes all items from cart and database
- [ ] Cart total resets to $0.00
- [ ] Cart icon count resets to 0
- [ ] Cart shows empty state after clearing

**Priority:** P2 (Medium)

---

## Checkout & Payment (Customer)

### US-015: Initiate Checkout

**As a** customer  
**I want to** proceed to checkout from my cart  
**So that** I can complete my purchase

**Acceptance Criteria:**
- [ ] "Checkout" button is visible on cart page
- [ ] Button is disabled if cart is empty
- [ ] Clicking button redirects to checkout page
- [ ] Checkout page displays order summary: items, quantities, prices, total
- [ ] Checkout page includes Stripe card payment form (Stripe Elements)
- [ ] User must be logged in to access checkout
- [ ] System validates stock availability before allowing checkout (show error if any item out of stock)

**Priority:** P0 (Critical)

---

### US-016: Complete Payment

**As a** customer  
**I want to** pay securely with my credit card  
**So that** I can complete my purchase

**Acceptance Criteria:**
- [ ] Checkout page displays Stripe card input (card number, expiry, CVC)
- [ ] Clicking "Pay Now" button creates Stripe PaymentIntent on backend
- [ ] Payment is processed via Stripe (PCI compliant, no card data touches our servers)
- [ ] On successful payment, order status is set to "paid"
- [ ] User is redirected to order confirmation page showing order ID and details
- [ ] Cart is cleared after successful payment
- [ ] Stock quantities are reduced for purchased items
- [ ] On payment failure, user sees clear error message from Stripe
- [ ] Failed payments do not create orders

**Priority:** P0 (Critical)

---

### US-017: Payment Webhook Confirmation

**As the** system  
**I want to** receive payment confirmation from Stripe via webhook  
**So that** order status is reliably updated even if user closes browser

**Acceptance Criteria:**
- [ ] Backend has webhook endpoint: `/api/webhooks/stripe`
- [ ] Endpoint validates webhook signature (Stripe webhook secret)
- [ ] On `payment_intent.succeeded` event, order status is updated to "paid"
- [ ] On `payment_intent.payment_failed` event, order status is set to "cancelled"
- [ ] Webhook processing is idempotent (duplicate webhooks don't cause issues)
- [ ] Webhook endpoint responds with 200 OK to acknowledge receipt
- [ ] Invalid signatures are rejected with 400 error

**Priority:** P0 (Critical)

---

## Order Management (Customer)

### US-018: View Order History

**As a** customer  
**I want to** view all my past orders  
**So that** I can track my purchases and reorder items

**Acceptance Criteria:**
- [ ] Orders page lists all orders for logged-in user (newest first)
- [ ] Each order shows: order ID, date, total amount, status
- [ ] Order status values: pending, paid, shipped, delivered, cancelled
- [ ] Clicking an order navigates to order detail page
- [ ] Empty state shows: "You haven't placed any orders yet"
- [ ] Orders are paginated if user has > 20 orders
- [ ] Page is only accessible to logged-in users

**Priority:** P1 (High)

---

### US-019: View Order Details

**As a** customer  
**I want to** view details of a specific order  
**So that** I can verify what I purchased

**Acceptance Criteria:**
- [ ] Order detail page shows: order ID, order date, status, total amount
- [ ] Page lists all items in order: product name, quantity, unit price, subtotal
- [ ] Page shows payment method used (e.g., "Card ending in 4242")
- [ ] Page shows Stripe payment intent ID (for reference)
- [ ] User can only view their own orders (403 error if accessing another user's order)
- [ ] Invalid order ID shows 404 error

**Priority:** P1 (High)

---

## Product Management (Admin)

### US-020: Create New Product

**As an** admin/business owner  
**I want to** create a new product listing  
**So that** I can sell items on the platform

**Acceptance Criteria:**
- [ ] Admin panel has "Add Product" button/page
- [ ] Form collects: product name, description, price, stock quantity, category, SKU
- [ ] SKU must be unique (show error if duplicate)
- [ ] Price must be positive decimal (e.g., 19.99, max 2 decimal places)
- [ ] Stock quantity must be non-negative integer
- [ ] Category is selected from dropdown or free text (MVP can be text input)
- [ ] Product image is optional (placeholder used if not provided)
- [ ] Form validation shows clear error messages
- [ ] On successful creation, admin is redirected to product list with success message
- [ ] Only admin role users can access this feature (403 error for customers)

**Priority:** P0 (Critical)

---

### US-021: Edit Existing Product

**As an** admin/business owner  
**I want to** update product information  
**So that** I can correct mistakes or change prices/inventory

**Acceptance Criteria:**
- [ ] Admin product list has "Edit" button for each product
- [ ] Edit page pre-fills form with existing product data
- [ ] Admin can modify: name, description, price, stock quantity, category
- [ ] SKU cannot be changed after creation (field is disabled/readonly)
- [ ] Same validation as create product applies
- [ ] Saving updates database and shows success message
- [ ] Changes are immediately reflected on customer product pages
- [ ] Only admin role users can access this feature

**Priority:** P0 (Critical)

---

### US-022: Delete Product

**As an** admin/business owner  
**I want to** remove a product from the catalog  
**So that** I can stop selling discontinued items

**Acceptance Criteria:**
- [ ] Admin product list has "Delete" button for each product
- [ ] Clicking delete shows confirmation modal: "Are you sure? This cannot be undone."
- [ ] Confirming delete removes product from database
- [ ] Deleted products no longer appear in customer product listings
- [ ] Deleted products cannot be added to cart
- [ ] Existing orders with deleted products are unaffected (order history intact)
- [ ] Product IDs in cart that are deleted show error: "Product no longer available"
- [ ] Only admin role users can access this feature

**Priority:** P1 (High)

---

### US-023: View Product Inventory

**As an** admin/business owner  
**I want to** see stock levels for all products  
**So that** I can manage inventory

**Acceptance Criteria:**
- [ ] Admin product list displays stock quantity for each product
- [ ] Products with stock = 0 are highlighted or flagged
- [ ] Admin can sort products by stock level (low to high)
- [ ] Admin can filter to show only out-of-stock items
- [ ] List shows total product count
- [ ] Quick edit allows inline stock quantity updates

**Priority:** P2 (Medium)

---

### US-024: View All Orders (Admin)

**As an** admin/business owner  
**I want to** see all customer orders  
**So that** I can fulfill and track sales

**Acceptance Criteria:**
- [ ] Admin panel has "Orders" page listing all orders (all customers)
- [ ] Order list shows: order ID, customer email, date, total, status
- [ ] Orders are sorted by newest first
- [ ] Admin can filter orders by status (paid, shipped, etc.)
- [ ] Clicking an order shows detail page with items and customer info
- [ ] Admin can manually update order status (e.g., mark as "shipped")
- [ ] Only admin role users can access this feature

**Priority:** P2 (Medium)

---

## User Stories Summary

| ID | Title | Role | Priority | Complexity |
|----|-------|------|----------|------------|
| US-001 | User Registration | Customer | P0 | Low |
| US-002 | User Login | All | P0 | Low |
| US-003 | Token Refresh | All | P0 | Medium |
| US-004 | User Logout | All | P1 | Low |
| US-005 | View Profile | All | P2 | Low |
| US-006 | Browse Products | Customer | P0 | Medium |
| US-007 | Filter by Category | Customer | P1 | Low |
| US-008 | Search Products | Customer | P2 | Medium |
| US-009 | Product Details | Customer | P0 | Low |
| US-010 | View Cart | Customer | P0 | Medium |
| US-011 | Add to Cart | Customer | P0 | Medium |
| US-012 | Update Cart Quantity | Customer | P0 | Medium |
| US-013 | Remove from Cart | Customer | P0 | Low |
| US-014 | Clear Cart | Customer | P2 | Low |
| US-015 | Initiate Checkout | Customer | P0 | Medium |
| US-016 | Complete Payment | Customer | P0 | High |
| US-017 | Payment Webhook | System | P0 | High |
| US-018 | Order History | Customer | P1 | Low |
| US-019 | Order Details | Customer | P1 | Low |
| US-020 | Create Product | Admin | P0 | Medium |
| US-021 | Edit Product | Admin | P0 | Low |
| US-022 | Delete Product | Admin | P1 | Low |
| US-023 | View Inventory | Admin | P2 | Low |
| US-024 | View All Orders | Admin | P2 | Medium |

**Total User Stories:** 24  
**Priority P0 (Critical):** 13 stories  
**Priority P1 (High):** 5 stories  
**Priority P2 (Medium):** 6 stories

---

## Acceptance Testing Approach

**Definition of Done for Each Story:**
1. All acceptance criteria checkboxes can be verified as complete
2. Feature works on Chrome, Firefox, Safari (latest versions)
3. Mobile responsive (tested on viewport width 375px)
4. No console errors in browser or server logs
5. API endpoints return expected status codes and data structures
6. Error scenarios are handled gracefully with user-friendly messages

**Testing Priority:**
- P0 stories must be 100% complete for MVP launch
- P1 stories should be complete but can be deferred if critical issues arise
- P2 stories are nice-to-have and can be added post-MVP

---

**Document Version:** 1.0  
**Last Updated:** March 7, 2026  
**Status:** ✅ Complete
