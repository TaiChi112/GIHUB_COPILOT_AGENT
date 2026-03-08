# Business Rules - E-commerce Platform MVP

## Overview

This document defines the business logic, validation rules, and system behavior constraints for ShopHub. These rules ensure data integrity, security, and consistent user experience.

---

## 1. Authentication & Security Rules

### 1.1 Password Requirements

**Rule:** User passwords must meet minimum security standards

**Validation:**
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one number (0-9)
- Special characters are allowed but not required

**Implementation:**
- Validation occurs on both client (immediate feedback) and server (enforcement)
- Error message: "Password must be at least 8 characters with uppercase, lowercase, and number"

**Example Valid Passwords:**
- `MyPass123`
- `SecureP@ss1`
- `Admin2024!`

**Example Invalid Passwords:**
- `short1` (too short)
- `lowercase123` (no uppercase)
- `UPPERCASE123` (no lowercase)
- `NoNumbers!` (no numbers)

---

### 1.2 Password Hashing

**Rule:** Passwords must never be stored in plain text

**Implementation:**
- Use bcrypt hashing algorithm with cost factor minimum 10
- Salt is automatically generated per password (bcrypt handles this)
- Password hash stored in `password_hash` column (VARCHAR 255)

**Technical Specification:**
```typescript
import bcrypt from 'bcrypt';

// On registration/password change
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// On login verification
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

### 1.3 Email Validation

**Rule:** Email addresses must be valid and unique

**Validation:**
- Must match standard email format: `user@domain.tld`
- Case-insensitive (stored as lowercase in database)
- Must be unique across all users
- Maximum length: 255 characters

**Implementation:**
- Frontend: Use HTML5 `type="email"` + regex validation
- Backend: Normalize to lowercase, check uniqueness before insert
- Database: UNIQUE constraint on `email` column

**Error Messages:**
- `"Please enter a valid email address"` (format validation)
- `"This email is already registered"` (uniqueness check)

---

### 1.4 JWT Token Expiration

**Rule:** Access tokens expire quickly, refresh tokens last longer

**Token Specifications:**

| Token Type | Expiration | Storage | Purpose |
|------------|------------|---------|---------|
| Access Token (JWT) | 30 minutes | Client memory (React state) | API authentication |
| Refresh Token | 7 days | httpOnly, secure cookie | Token renewal |

**Refresh Token Rotation:**
- When refresh endpoint is called, old refresh token is revoked
- New refresh token is issued (one-time use pattern)
- Revoked tokens stored in `refresh_tokens` table until expiry

**Security Implications:**
- Short access token lifespan limits damage from token theft
- httpOnly cookies prevent XSS attacks from stealing refresh tokens
- Token rotation prevents replay attacks

---

### 1.5 User Roles & Authorization

**Rule:** Users have roles that determine access permissions

**Available Roles:**
- `customer`: Default role for registered users
- `admin`: Business owner with product management access

**Permission Matrix:**

| Feature | Customer | Admin |
|---------|----------|-------|
| Browse products | ✅ | ✅ |
| Add to cart | ✅ | ✅ |
| Checkout & pay | ✅ | ✅ |
| View own orders | ✅ | ✅ |
| Create product | ❌ | ✅ |
| Edit product | ❌ | ✅ |
| Delete product | ❌ | ✅ |
| View all orders | ❌ | ✅ |
| View inventory | ❌ | ✅ |

**Enforcement:**
- Role checked in JWT payload (`user.role`)
- Middleware validates role before allowing access to admin endpoints
- Client-side UI conditionally shows/hides admin features

**Creating Admin Users:**
- For MVP: Manually set `role = 'admin'` in database
- Post-MVP: Add admin invitation system

---

### 1.6 Session Management

**Rule:** User sessions are stateless using JWT

**Behavior:**
- No server-side session storage (fully stateless)
- Access token contains user ID, email, and role
- Each API request includes access token in Authorization header: `Bearer <token>`
- If access token missing or expired: 401 Unauthorized response
- Frontend automatically attempts token refresh on 401, then retries request
- If refresh fails: Logout user and redirect to login

---

## 2. Product Management Rules

### 2.1 Product Creation Requirements

**Rule:** Products must have complete, valid information

**Required Fields:**
- `name`: VARCHAR(255), non-empty
- `sku`: VARCHAR(100), unique across all products
- `price`: DECIMAL(10,2), greater than 0
- `stock_quantity`: INTEGER, greater than or equal to 0
- `created_by`: UUID, references admin user who created product

**Optional Fields:**
- `description`: TEXT, can be null or empty
- `category`: VARCHAR(100), can be null (uncategorized)
- `image_url`: VARCHAR(500), can be null (uses placeholder)

**Validation Rules:**
- Price minimum: $0.01 (1 cent)
- Price maximum: $99,999.99 (five digits before decimal)
- Price must have exactly 2 decimal places
- Stock quantity range: 0 to 999,999

**Error Messages:**
- `"Product name is required"`
- `"SKU must be unique (already exists)"`
- `"Price must be between $0.01 and $99,999.99"`
- `"Stock quantity must be a positive number"`

---

### 2.2 SKU (Stock Keeping Unit) Rules

**Rule:** SKUs uniquely identify products

**Requirements:**
- Must be unique across all products (enforced by database)
- Format: Alphanumeric only (letters, numbers, hyphens allowed)
- Length: 3-100 characters
- Case-insensitive uniqueness (stored as uppercase)

**Examples:**
- `LAPTOP-001`
- `TSHIRT-RED-M`
- `SKU123456`

**Behavior:**
- SKU cannot be changed after product creation (immutable)
- If product is deleted, SKU becomes available again (no soft delete retention)

---

### 2.3 Stock Management Rules

**Rule:** Stock quantities must remain accurate and non-negative

**Stock Deduction:**
- Stock is only deducted when order status becomes "paid" (payment confirmed)
- Deduction happens atomically in database transaction
- If stock insufficient during checkout, order creation fails with error

**Stock Validation on Cart Operations:**
- When adding to cart: Check if `product.stock_quantity >= requested_quantity`
- When updating cart: Check if new quantity doesn't exceed current stock
- If stock drops below cart quantity (another user purchased): Show warning on checkout

**Out-of-Stock Behavior:**
- Products with `stock_quantity = 0` are still visible (not hidden)
- "Add to Cart" button disabled on product detail page
- Cart page shows "Out of Stock" warning if item stock becomes 0
- Checkout blocked if any cart item is out of stock

**Stock Replenishment:**
- Admin can increase stock via product edit page
- If order is cancelled, stock is NOT automatically restored (manual process for MVP)

---

### 2.4 Product Deletion Rules

**Rule:** Deleted products should not break existing data

**Behavior:**
- Products can be deleted at any time by admin
- Deleted products are removed from database (hard delete, not soft delete)
- **Existing orders**: Past orders retain product information (order_items table has snapshot of product name/price)
- **Active carts**: If product in user's cart is deleted, cart item becomes invalid
  - Show warning: "Some items in your cart are no longer available"
  - Remove invalid items automatically or let user remove them

**Cascade Behavior:**
- Deleting product does NOT delete past orders (order_items remain)
- Deleting product DOES delete cart_items referencing it (ON DELETE CASCADE)

---

### 2.5 Product Pricing Rules

**Rule:** Prices are fixed at time of order creation

**Price Snapshot:**
- When order is created, `order_items.unit_price` stores current product price
- If admin changes product price later, existing orders unaffected
- This prevents retroactive price changes from affecting financial records

**Currency:**
- MVP supports USD only
- All prices stored as DECIMAL(10,2) in database
- Display format: `$XX.XX` (e.g., $19.99)

**Tax & Shipping:**
- MVP does not calculate tax (prices are final)
- MVP does not include shipping costs (assume flat rate or digital products)
- Post-MVP: Add tax calculation and shipping integration

---

## 3. Shopping Cart Rules

### 3.1 Cart Ownership

**Rule:** Each user has one persistent cart

**Behavior:**
- Cart is tied to authenticated user (user_id)
- Cart persists in database (not browser localStorage)
- Cart survives logout/login (user sees same cart after logging back in)
- Guest carts not supported in MVP (must login to use cart)

---

### 3.2 Cart Item Quantity Limits

**Rule:** Cart quantities must be reasonable and within stock limits

**Limits:**
- Minimum quantity per item: 1
- Maximum quantity per item: Lesser of (10, current_stock_quantity)
- Per-item limit prevents hoarding and ensures fair distribution

**Validation:**
- Frontend enforces limits on quantity input
- Backend validates quantity on every cart operation
- Error message: `"Cannot add more than 10 items" or "Only X items in stock"`

---

### 3.3 Cart Item Uniqueness

**Rule:** Same product cannot appear twice in cart (only quantity increases)

**Implementation:**
- Database constraint: UNIQUE(user_id, product_id) on cart_items table
- When adding product already in cart:
  - Existing cart_item quantity is increased by requested amount
  - No duplicate rows created

**Example:**
1. User adds Product A (quantity 2) → cart_item: {product_id: A, quantity: 2}
2. User adds Product A (quantity 3) again → cart_item: {product_id: A, quantity: 5}

---

### 3.4 Cart Expiration

**Rule:** Old cart items are automatically removed

**Expiration Policy:**
- Cart items older than 7 days are deleted
- Cleanup happens via scheduled job (cron or database trigger)
- User notified if items removed: "Some items were removed due to inactivity"

**Rationale:**
- Prevents stale carts from blocking inventory
- Encourages timely purchases

**MVP Implementation:**
- Expiration can be deferred post-MVP if development time limited
- Manual cleanup via SQL script: `DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '7 days'`

---

### 3.5 Cart Validation at Checkout

**Rule:** Cart must pass all validations before order creation

**Pre-Checkout Validations:**
1. **Cart not empty**: At least one item required
2. **Stock availability**: All items must have sufficient stock
3. **Product exists**: All products in cart still exist in database (not deleted)
4. **Price consistency**: Current product prices fetched (cart may show outdated price)

**Validation Errors:**
- `"Your cart is empty"`
- `"Product XYZ is out of stock"`
- `"Product ABC is no longer available"`
- `"Price of Product DEF has changed from $10 to $12"`

**On Validation Failure:**
- Checkout blocked, user returned to cart page
- Clear error messages displayed
- Invalid items highlighted or removed

---

## 4. Order Processing Rules

### 4.1 Order Creation Workflow

**Rule:** Orders are created after payment intent, finalized after payment confirmation

**Order Lifecycle:**

```
1. User clicks "Checkout" (cart page)
   ↓
2. System creates Stripe PaymentIntent (backend API call)
   ↓
3. System creates Order with status = "pending" (database)
   ↓
4. Frontend displays Stripe payment form
   ↓
5. User enters card details and submits
   ↓
6. Stripe processes payment
   ↓
7a. SUCCESS: Webhook receives payment_intent.succeeded
    → Order status → "paid"
    → Stock deducted
    → Cart cleared
   ↓
7b. FAILURE: Webhook receives payment_intent.payment_failed
    → Order status → "cancelled"
    → Stock unchanged
```

**Important:**
- Order exists in database even before payment (with "pending" status)
- Stock is NOT reserved during pending (first-come-first-served on payment)
- If payment fails, order status becomes "cancelled" (not deleted)

---

### 4.2 Order Status Transitions

**Rule:** Order status follows defined state machine

**Valid Statuses:**
- `pending`: Order created, payment not yet confirmed
- `paid`: Payment successful, order confirmed
- `shipped`: Admin marked as shipped (manual update)
- `delivered`: Admin marked as delivered (manual update)
- `cancelled`: Payment failed or admin cancelled

**Allowed Transitions:**

```
pending → paid (via payment webhook)
pending → cancelled (payment failure or manual)
paid → shipped (manual by admin)
paid → cancelled (manual refund scenario)
shipped → delivered (manual by admin)
```

**Forbidden Transitions:**
- Cannot go from `delivered` back to `shipped`
- Cannot go from `cancelled` to any other status
- Cannot skip states (e.g., pending → shipped without paid)

**MVP Simplification:**
- Only `pending`, `paid`, and `cancelled` implemented initially
- `shipped` and `delivered` added post-MVP or as manual text field

---

### 4.3 Order Total Calculation

**Rule:** Order total is sum of all order items

**Calculation:**
```
order_total = SUM(order_items.quantity × order_items.unit_price)
```

**Price Freezing:**
- `unit_price` in `order_items` table stores price at time of order creation
- Total calculated once and stored in `orders.total_amount`
- Prevents retroactive price changes from affecting order totals

**No Dynamic Discounts in MVP:**
- No coupon codes, discounts, or promotions
- No tax calculation
- No shipping fees
- Post-MVP: Add promo_code, discount_amount, tax_amount, shipping_amount columns

---

### 4.4 Order Ownership

**Rule:** Users can only view their own orders (except admins)

**Authorization:**
- Customer: Can view orders where `order.user_id = current_user.id`
- Admin: Can view all orders (no restriction)

**Enforcement:**
- API endpoint `/api/orders/:id` checks ownership before returning data
- Attempting to access another user's order: 403 Forbidden error

---

### 4.5 Failed Order Handling

**Rule:** Failed payments result in cancelled orders

**Behavior:**
- If Stripe webhook reports `payment_intent.payment_failed`:
  - Order status set to "cancelled"
  - Stock NOT deducted
  - Cart NOT cleared (user can retry)
  - User shown error message with failure reason (from Stripe)

**Common Failure Reasons:**
- Insufficient funds
- Card declined
- Invalid card details
- Bank authentication required (3D Secure)

**User Action:**
- User can update payment method and retry
- User can return to cart and try again

---

## 5. Payment Processing Rules

### 5.1 Payment Method

**Rule:** Only Stripe credit/debit card payments supported in MVP

**Accepted Cards:**
- Visa
- Mastercard
- American Express
- Discover

**Not Supported in MVP:**
- PayPal
- Apple Pay / Google Pay
- Bank transfers
- Cryptocurrency
- Buy Now Pay Later (Affirm, Klarna)

---

### 5.2 Payment Intent Lifecycle

**Rule:** Each order has one Stripe PaymentIntent

**PaymentIntent Creation:**
- Created when user clicks "Pay Now" on checkout page
- Amount: `order.total_amount` multiplied by 100 (Stripe uses cents)
- Currency: `usd`
- Metadata includes: `order_id`, `user_id`

**PaymentIntent ID Storage:**
- Stored in `orders.stripe_payment_intent_id` column
- Used to correlate webhook events with orders

**Idempotency:**
- If payment intent creation fails, retry with same idempotency key
- Prevents duplicate charges

---

### 5.3 Webhook Signature Verification

**Rule:** All Stripe webhooks must be verified

**Security:**
- Stripe webhook secret stored in environment variable
- Each webhook includes signature in `Stripe-Signature` header
- Backend verifies signature using Stripe SDK
- Invalid signatures rejected immediately (400 Bad Request)

**Implementation:**
```typescript
import Stripe from 'stripe';

const signature = request.headers.get('stripe-signature');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

try {
  const event = stripe.webhooks.constructEvent(
    request.body,
    signature,
    webhookSecret
  );
  // Process event
} catch (err) {
  return new Response('Invalid signature', { status: 400 });
}
```

---

### 5.4 Refund Policy (Post-MVP)

**Rule:** Refunds not implemented in MVP

**Placeholder:**
- For MVP, refunds handled manually via Stripe Dashboard
- Admin can issue refund in Stripe, then manually update order status to "cancelled"
- Post-MVP: Add refund API endpoint and UI for admins

---

## 6. Data Validation Rules

### 6.1 Input Sanitization

**Rule:** All user inputs are validated and sanitized

**Validation Layers:**
1. **Client-side (Frontend):** Immediate feedback, better UX
2. **Server-side (Backend):** Enforcement, security (never trust client)

**Sanitization:**
- Trim whitespace from text inputs
- Escape HTML to prevent XSS attacks
- Validate data types (string vs number vs date)

**Tools:**
- Frontend: HTML5 validation attributes + Zod schemas
- Backend: Zod schemas for request validation

---

### 6.2 Required vs Optional Fields

**User Registration:**
- Required: email, password, full_name
- Optional: phone, address (not collected in MVP)

**Product Creation:**
- Required: name, sku, price, stock_quantity
- Optional: description, category, image_url

**Order Creation:**
- Required: user_id, payment_method, cart items
- Optional: shipping_address (not collected in MVP)

---

### 6.3 String Length Limits

**Database Column Limits:**

| Field | Max Length | Validation |
|-------|------------|------------|
| User email | 255 chars | Email format |
| User full_name | 255 chars | Non-empty |
| Product name | 255 chars | Non-empty |
| Product SKU | 100 chars | Alphanumeric |
| Product description | Unlimited (TEXT) | Optional |
| Product category | 100 chars | Optional |

**Enforcement:**
- Frontend: `maxLength` attribute on inputs
- Backend: Zod schema `.max()` constraint
- Database: VARCHAR length constraint

---

### 6.4 Numeric Validation

**Price:**
- Type: Positive decimal
- Min: 0.01
- Max: 99999.99
- Decimal places: Exactly 2

**Stock Quantity:**
- Type: Non-negative integer
- Min: 0
- Max: 999999

**Cart Quantity:**
- Type: Positive integer
- Min: 1
- Max: 10 or stock_quantity (whichever is less)

---

## 7. Error Handling Rules

### 7.1 HTTP Status Codes

**Standard Status Codes:**

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 OK | Success | Successful GET, PUT, DELETE |
| 201 Created | Resource created | Successful POST (user registration, product creation) |
| 400 Bad Request | Invalid input | Validation errors, malformed JSON |
| 401 Unauthorized | Authentication required | Missing or invalid JWT token |
| 403 Forbidden | Insufficient permissions | Customer trying to access admin endpoint |
| 404 Not Found | Resource doesn't exist | Invalid product ID, order ID |
| 409 Conflict | Duplicate resource | Email already registered, SKU already exists |
| 500 Internal Server Error | Server error | Database connection error, unexpected exceptions |

---

### 7.2 Error Response Format

**Rule:** All errors return consistent JSON structure

**Error Response Schema:**
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE_CONSTANT",
    "field": "fieldName" // Optional, for validation errors
  }
}
```

**Examples:**

**Validation Error:**
```json
{
  "error": {
    "message": "Price must be between $0.01 and $99,999.99",
    "code": "INVALID_PRICE",
    "field": "price"
  }
}
```

**Authentication Error:**
```json
{
  "error": {
    "message": "Invalid or expired token",
    "code": "UNAUTHORIZED"
  }
}
```

---

### 7.3 User-Friendly Error Messages

**Rule:** Error messages should be clear and actionable

**Bad Error Messages (Avoid):**
- "Error 500"
- "Database query failed"
- "Null reference exception"

**Good Error Messages (Use):**
- "This email is already registered. Please login or use a different email."
- "Cannot add to cart. Only 3 items remain in stock."
- "Payment failed. Please check your card details and try again."

**Implementation:**
- Backend sends generic error codes
- Frontend maps codes to user-friendly messages in appropriate language
- Never expose sensitive system details (file paths, SQL queries, stack traces)

---

## 8. Business Constraints & Assumptions

### 8.1 Single Currency

**Rule:** All prices in USD only

**Implications:**
- No currency conversion
- No multi-currency support
- Display format: `$XX.XX`

**Post-MVP:** Add currency field to products and orders for international support

---

### 8.2 No Shipping Management

**Rule:** Shipping addresses and tracking not collected in MVP

**Assumptions:**
- Products are digital (no physical shipping), OR
- Flat shipping rate determined offline, OR
- Shipping handled manually by business owner

**Post-MVP:** Add shipping_address fields to orders, integrate with shipping carriers

---

### 8.3 No Tax Calculation

**Rule:** Prices are final (tax-inclusive or not applicable)

**Implications:**
- No sales tax calculated at checkout
- Business owner responsible for tax compliance
- Order total = sum of product prices (no additional charges)

**Post-MVP:** Integrate tax calculation API (TaxJar, Avalara)

---

### 8.4 Admin User Creation

**Rule:** Admin users manually created in database

**Process:**
1. User registers normally (role = 'customer')
2. Developer manually updates database: `UPDATE users SET role = 'admin' WHERE email = 'owner@example.com'`
3. User logs in with admin privileges

**Security:**
- No self-service admin registration (prevents unauthorized admin access)

**Post-MVP:** Add admin invitation system with email verification

---

### 8.5 Product Images

**Rule:** Product images are external URLs (no file upload)

**Implementation:**
- `image_url` field stores HTTPS URL to external image
- No image hosting or CDN integration
- Placeholder image used if `image_url` is null

**Placeholder:**
- Use https://via.placeholder.com/400x400 or similar service

**Post-MVP:** Add image upload with S3/Cloudinary integration

---

## Summary: Critical Business Rules Checklist

**Before Launch, Validate:**
- [ ] Passwords are hashed with bcrypt (never plain text)
- [ ] JWT tokens expire correctly (30min access, 7day refresh)
- [ ] Stock quantities cannot go negative
- [ ] Order totals match sum of order items
- [ ] Only admins can create/edit/delete products
- [ ] Users can only view their own orders (except admins)
- [ ] Stripe webhook signatures are verified
- [ ] Failed payments do not deduct stock
- [ ] Cart items respect stock availability
- [ ] SKUs are unique across all products
- [ ] All user inputs are validated server-side
- [ ] Error messages do not expose sensitive data

---

**Document Version:** 1.0  
**Last Updated:** March 7, 2026  
**Status:** ✅ Complete
