import { pgTable, uuid, varchar, text, timestamp, decimal, integer, unique, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== Enums ====================

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
]);

// ==================== Users Table ====================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('customer').notNull(),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  cart_items: many(cartItems),
  orders: many(orders),
  refresh_tokens: many(refreshTokens),
}));

// ==================== Products Table ====================

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').default(0).notNull(),
  category: varchar('category', { length: 100 }),
  image_url: varchar('image_url', { length: 500 }),
  created_by: uuid('created_by')
    .notNull()
    .references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.created_by],
    references: [users.id],
  }),
  cart_items: many(cartItems),
  order_items: many(orderItems),
}));

// ==================== Cart Items Table ====================

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    added_at: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    unique_user_product: unique().on(table.user_id, table.product_id),
  })
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.product_id],
    references: [products.id],
  }),
}));

// ==================== Orders Table ====================

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum('status').default('pending').notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: varchar('payment_method', { length: 50 }),
  stripe_payment_intent_id: varchar('stripe_payment_intent_id', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  order_items: many(orderItems),
}));

// ==================== Order Items Table ====================

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

// ==================== Refresh Tokens Table ====================

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token_hash: varchar('token_hash', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.user_id],
    references: [users.id],
  }),
}));

// Export all tables for use in queries
export const schema = {
  users,
  products,
  cartItems,
  orders,
  orderItems,
  refreshTokens,
  usersRelations,
  productsRelations,
  cartItemsRelations,
  ordersRelations,
  orderItemsRelations,
  refreshTokensRelations,
};
