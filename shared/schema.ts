import { pgTable, text, integer, serial, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cities table - المدن/المحافظات
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  province: text("province"), // المنطقة
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

// Warehouses table - المستودعات
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cityId: integer("city_id").notNull().references(() => cities.id),
  address: text("address"),
  phone: text("phone"),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true, createdAt: true });
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  password: text("password"),
  facilityName: text("facility_name"),
  facilityType: text("facility_type"),
  commercialRegister: text("commercial_register"),
  taxNumber: text("tax_number"),
  cityId: integer("city_id").references(() => cities.id),
  avatarKey: text("avatar_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Addresses table
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cityId: integer("city_id").references(() => cities.id),
  title: text("title").notNull(),
  details: text("details").notNull(),
  type: text("type").notNull(), // محل تجاري, مستودع
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

// Favorites table - المفضلة
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Brands table
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
});

export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  minOrder: integer("min_order").notNull(),
  unit: text("unit").notNull(), // كرتون, كيس, حبة
  stock: integer("stock").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product Inventory per Warehouse - مخزون المنتجات لكل مستودع
export const productInventory = pgTable("product_inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id, { onDelete: "cascade" }),
  stock: integer("stock").default(0).notNull(),
  priceOverride: decimal("price_override", { precision: 10, scale: 2 }),
  minOrderOverride: integer("min_order_override"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertProductInventorySchema = createInsertSchema(productInventory).omit({ id: true });
export type InsertProductInventory = z.infer<typeof insertProductInventorySchema>;
export type ProductInventory = typeof productInventory.$inferSelect;

// Cart Items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  addressId: integer("address_id").notNull().references(() => addresses.id),
  bannerId: integer("banner_id").references(() => banners.id), // Track which promo banner the order came from
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"), // رسوم التوصيل
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // wallet, card, cash
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Payment Cards table
export const paymentCards = pgTable("payment_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // Visa, Mastercard
  last4: text("last4").notNull(),
  expiry: text("expiry").notNull(),
  holder: text("holder").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentCardSchema = createInsertSchema(paymentCards).omit({ id: true, createdAt: true });
export type InsertPaymentCard = z.infer<typeof insertPaymentCardSchema>;
export type PaymentCard = typeof paymentCards.$inferSelect;

// Wallet table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, updatedAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// Wallet Transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // deposit, payment, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  title: text("title").notNull(),
  method: text("method").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true, createdAt: true });
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  cartItems: many(cartItems),
  orders: many(orders),
  paymentCards: many(paymentCards),
  wallet: one(wallets),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentCardsRelations = relations(paymentCards, ({ one }) => ({
  user: one(users, {
    fields: [paymentCards.userId],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
}));

// Staff/Employees table
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(), // admin, manager, sales, support, warehouse
  department: text("department"), // sales, support, warehouse, accounting
  permissions: text("permissions").array(), // ['orders', 'products', 'customers', 'reports']
  status: text("status").default("active").notNull(), // active, inactive
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  assignedTo: integer("assigned_to").references(() => staff.id),
  category: text("category").notNull(), // order, payment, product, technical, other
  priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
  status: text("status").default("open").notNull(), // open, in_progress, resolved, closed
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Ticket Messages table
export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull(),
  senderType: text("sender_type").notNull(), // user, staff
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({ id: true, createdAt: true });
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TicketMessage = typeof ticketMessages.$inferSelect;

// Loyalty Points table
export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  totalPoints: integer("total_points").default(0).notNull(),
  tier: text("tier").default("bronze").notNull(), // bronze, silver, gold, platinum
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints).omit({ id: true, createdAt: true });
export type InsertLoyaltyPoints = z.infer<typeof insertLoyaltyPointsSchema>;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;

// Loyalty Transactions table
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  loyaltyId: integer("loyalty_id").notNull().references(() => loyaltyPoints.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id),
  type: text("type").notNull(), // earned, redeemed, expired, bonus
  points: integer("points").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({ id: true, createdAt: true });
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // percentage, fixed
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true, usageCount: true });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;


// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  userId: integer("user_id").notNull().references(() => users.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("unpaid").notNull(), // unpaid, paid, cancelled
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  staffId: integer("staff_id").references(() => staff.id),
  type: text("type").notNull(), // order, payment, stock, system, promotion
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  data: text("data"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Notification Preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  ordersEnabled: boolean("orders_enabled").default(true).notNull(),
  promotionsEnabled: boolean("promotions_enabled").default(true).notNull(),
  systemEnabled: boolean("system_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, updatedAt: true });
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id),
  action: text("action").notNull(), // created, updated, deleted, viewed
  entity: text("entity").notNull(), // order, product, user, etc
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Promotions/Campaigns table
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // banner, flash_sale, bundle, free_shipping
  description: text("description"),
  image: text("image"),
  discountType: text("discount_type"), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  targetType: text("target_type"), // all, category, product, customer_tier
  targetIds: text("target_ids").array(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  priority: integer("priority").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true, createdAt: true });
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  taxNumber: text("tax_number"),
  paymentTerms: text("payment_terms"), // net_30, net_60, cod
  rating: integer("rating").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Supplier Transactions table - tracks imports, exports, sales, and payments
export const supplierTransactions = pgTable("supplier_transactions", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  productId: integer("product_id").references(() => products.id),
  type: text("type").notNull(), // import, export, sale, payment
  quantity: integer("quantity").default(0), // for product transactions
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }), // price per unit
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // total transaction value
  paymentMethod: text("payment_method"), // cash, bank_transfer, check - for payments
  referenceNumber: text("reference_number"), // invoice/receipt number
  notes: text("notes"),
  createdBy: integer("created_by").references(() => staff.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierTransactionSchema = createInsertSchema(supplierTransactions).omit({ id: true, createdAt: true });
export type InsertSupplierTransaction = z.infer<typeof insertSupplierTransactionSchema>;
export type SupplierTransaction = typeof supplierTransactions.$inferSelect;

// Supplier Stock Positions - tracks how much stock from each supplier is in each warehouse
export const supplierStockPositions = pgTable("supplier_stock_positions", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  productId: integer("product_id").notNull().references(() => products.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  quantity: integer("quantity").default(0).notNull(), // current stock from this supplier
  avgCost: decimal("avg_cost", { precision: 10, scale: 2 }), // average purchase cost
  lastImportDate: timestamp("last_import_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierStockPositionSchema = createInsertSchema(supplierStockPositions).omit({ id: true, updatedAt: true });
export type InsertSupplierStockPosition = z.infer<typeof insertSupplierStockPositionSchema>;
export type SupplierStockPosition = typeof supplierStockPositions.$inferSelect;

// Supplier Balances - cached summary of supplier financial position
export const supplierBalances = pgTable("supplier_balances", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id).unique(),
  totalImports: decimal("total_imports", { precision: 12, scale: 2 }).default("0").notNull(), // total value of imported goods
  totalExports: decimal("total_exports", { precision: 12, scale: 2 }).default("0").notNull(), // total value of returned goods
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0").notNull(), // total sales from their goods
  totalPayments: decimal("total_payments", { precision: 12, scale: 2 }).default("0").notNull(), // total payments made to supplier
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(), // amount we owe them (imports - exports - payments)
  totalStockValue: decimal("total_stock_value", { precision: 12, scale: 2 }).default("0").notNull(), // current value of their goods in our warehouse
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierBalanceSchema = createInsertSchema(supplierBalances).omit({ id: true, updatedAt: true });
export type InsertSupplierBalance = z.infer<typeof insertSupplierBalanceSchema>;
export type SupplierBalance = typeof supplierBalances.$inferSelect;

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  status: text("status").default("draft").notNull(), // draft, pending, approved, received, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  expectedDate: timestamp("expected_date"),
  receivedDate: timestamp("received_date"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => staff.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Returns/Refunds table
export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  returnNumber: text("return_number").notNull().unique(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reason: text("reason").notNull(), // defective, wrong_item, damaged, not_as_described, other
  status: text("status").default("pending").notNull(), // pending, approved, rejected, refunded
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundMethod: text("refund_method"), // wallet, original_payment
  notes: text("notes"),
  images: text("images").array(),
  processedBy: integer("processed_by").references(() => staff.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const insertReturnSchema = createInsertSchema(returns).omit({ id: true, createdAt: true });
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returns.$inferSelect;

// Shipments/Tracking table
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  carrier: text("carrier").notNull(), // in_house, aramex, smsa, dhl
  status: text("status").default("preparing").notNull(), // preparing, picked_up, in_transit, out_for_delivery, delivered, failed
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  currentLocation: text("current_location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;

// Customer Segments table
export const customerSegments = pgTable("customer_segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  criteria: text("criteria"), // JSON string for segment rules
  customerCount: integer("customer_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSegmentSchema = createInsertSchema(customerSegments).omit({ id: true, createdAt: true });
export type InsertCustomerSegment = z.infer<typeof insertCustomerSegmentSchema>;
export type CustomerSegment = typeof customerSegments.$inferSelect;

// Reports/Exports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // sales, inventory, customers, orders, financial
  format: text("format").notNull(), // pdf, excel, csv
  parameters: text("parameters"), // JSON string
  fileUrl: text("file_url"),
  status: text("status").default("pending").notNull(), // pending, processing, completed, failed
  generatedBy: integer("generated_by").references(() => staff.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Drivers table - السائقين
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  licenseNumber: text("license_number"),
  vehiclePlate: text("vehicle_plate"),
  vehicleType: text("vehicle_type"), // شاحنة صغيرة, فان توصيل, شاحنة كبيرة, دراجة نارية
  cityId: integer("city_id").references(() => cities.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  status: text("status").default("available").notNull(), // available, on_delivery, offline, on_break
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  completedDeliveries: integer("completed_deliveries").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true, createdAt: true });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

// Vehicles table - المركبات
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  type: text("type").notNull(), // فان توصيل, شاحنة صغيرة, شاحنة كبيرة, دراجة نارية, سيارة
  brand: text("brand"), // الماركة
  model: text("model"), // الموديل
  year: integer("year"), // سنة الصنع
  color: text("color"), // اللون
  capacity: decimal("capacity", { precision: 10, scale: 2 }), // السعة بالطن
  fuelType: text("fuel_type"), // بنزين, ديزل, كهرباء, هجين
  driverId: integer("driver_id").references(() => drivers.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  status: text("status").default("available").notNull(), // available, in_use, maintenance, out_of_service
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  insuranceExpiryDate: timestamp("insurance_expiry_date"),
  licenseExpiryDate: timestamp("license_expiry_date"),
  mileage: integer("mileage").default(0),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Banners/Slides table - الشرائح الإعلانية
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  colorClass: text("color_class").default("from-primary to-purple-800"),
  position: integer("position").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  viewCount: integer("view_count").default(0).notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  purchaseCount: integer("purchase_count").default(0).notNull(), // عدد المشتريات من الباقة
  purchaseTotal: decimal("purchase_total", { precision: 12, scale: 2 }).default("0").notNull(), // إجمالي المبيعات
  targetAudience: text("target_audience").default("all"), // all, vip, new, returning
  targetCityId: integer("target_city_id").references(() => cities.id), // null = all cities, otherwise specific city
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

// Banner Views tracking - تتبع مشاهدات الشرائح
export const bannerViews = pgTable("banner_views", {
  id: serial("id").primaryKey(),
  bannerId: integer("banner_id").notNull().references(() => banners.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  clicked: boolean("clicked").default(false).notNull(),
  clickedAt: timestamp("clicked_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertBannerViewSchema = createInsertSchema(bannerViews).omit({ id: true, viewedAt: true });
export type InsertBannerView = z.infer<typeof insertBannerViewSchema>;
export type BannerView = typeof bannerViews.$inferSelect;

// Banner Products table - منتجات الباقات الإعلانية
export const bannerProducts = pgTable("banner_products", {
  id: serial("id").primaryKey(),
  bannerId: integer("banner_id").notNull().references(() => banners.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  promoPrice: decimal("promo_price", { precision: 10, scale: 2 }).notNull(), // سعر العرض الخاص
  quantity: integer("quantity").default(1).notNull(), // الكمية في الباقة
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBannerProductSchema = createInsertSchema(bannerProducts).omit({ id: true, createdAt: true });
export type InsertBannerProduct = z.infer<typeof insertBannerProductSchema>;
export type BannerProduct = typeof bannerProducts.$inferSelect;

// Expense Categories table - فئات المصاريف
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").default("Receipt"),
  color: text("color").default("#6366f1"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true, createdAt: true });
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

// Expenses table - المصاريف
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  paymentMethod: text("payment_method").default("cash"), // cash, bank_transfer, check
  reference: text("reference"), // رقم مرجعي (شيك، حوالة، إلخ)
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Delivery Settings table - إعدادات التوصيل
export const deliverySettings = pgTable("delivery_settings", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).unique(),
  cityId: integer("city_id").references(() => cities.id),
  baseFee: decimal("base_fee", { precision: 10, scale: 2 }).notNull().default("0"), // رسوم التوصيل الأساسية
  freeThresholdAmount: decimal("free_threshold_amount", { precision: 10, scale: 2 }), // الحد الأدنى للتوصيل المجاني (بالمبلغ)
  freeThresholdQuantity: integer("free_threshold_quantity"), // الحد الأدنى للتوصيل المجاني (بالكمية)
  isEnabled: boolean("is_enabled").default(true).notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliverySettingSchema = createInsertSchema(deliverySettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeliverySetting = z.infer<typeof insertDeliverySettingSchema>;
export type DeliverySetting = typeof deliverySettings.$inferSelect;

// Customer Credits table - رصيد الآجل للعملاء
// مدة الآجل حسب مستوى العميل:
// برونزي: 7 أيام | فضي: 14 يوم | ذهبي: 21 يوم | ماسي: 30 يوم
export const customerCredits = pgTable("customer_credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalPurchases: decimal("total_purchases", { precision: 14, scale: 2 }).default("0").notNull(), // إجمالي المشتريات لتحديد المستوى
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0").notNull(), // الحد الأقصى للآجل
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0").notNull(), // الرصيد المستحق الحالي
  loyaltyLevel: text("loyalty_level").default("bronze").notNull(), // bronze, silver, gold, diamond
  creditPeriodDays: integer("credit_period_days").default(7).notNull(), // مدة الآجل بالأيام
  isEligible: boolean("is_eligible").default(true).notNull(), // هل مؤهل للآجل
  lastPaymentDate: timestamp("last_payment_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerCreditSchema = createInsertSchema(customerCredits).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomerCredit = z.infer<typeof insertCustomerCreditSchema>;
export type CustomerCredit = typeof customerCredits.$inferSelect;

// Credit Transactions table - معاملات الآجل
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id),
  type: text("type").notNull(), // purchase (شراء بالآجل), payment (سداد), adjustment (تعديل)
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(), // الرصيد بعد العملية
  dueDate: timestamp("due_date"), // تاريخ الاستحقاق
  paidDate: timestamp("paid_date"), // تاريخ السداد
  status: text("status").default("pending").notNull(), // pending, paid, overdue
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({ id: true, createdAt: true });
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

// Site Settings table - إعدادات الموقع (الشروط والأحكام، الدعم)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // terms, support_phone, support_email, support_whatsapp, faq
  value: text("value").notNull(),
  label: text("label"), // وصف للمفتاح بالعربي
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
