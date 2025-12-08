import {
  type User,
  type InsertUser,
  users,
  type Product,
  type InsertProduct,
  products,
  type Category,
  categories,
  type Brand,
  brands,
  type CartItem,
  type InsertCartItem,
  cartItems,
  type Order,
  type InsertOrder,
  orders,
  type OrderItem,
  type InsertOrderItem,
  orderItems,
  type Address,
  type InsertAddress,
  addresses,
  type PaymentCard,
  type InsertPaymentCard,
  paymentCards,
  type Wallet,
  type InsertWallet,
  wallets,
  type WalletTransaction,
  type InsertWalletTransaction,
  walletTransactions,
  type Promotion,
  type InsertPromotion,
  promotions,
  type Supplier,
  type InsertSupplier,
  suppliers,
  type Return,
  type InsertReturn,
  returns,
  type Shipment,
  type InsertShipment,
  shipments,
  type CustomerSegment,
  type InsertCustomerSegment,
  customerSegments,
  type Report,
  type InsertReport,
  reports,
  type Staff,
  type InsertStaff,
  staff,
  type SupportTicket,
  type InsertSupportTicket,
  supportTickets,
  type Coupon,
  type InsertCoupon,
  coupons,
  type Warehouse,
  type InsertWarehouse,
  warehouses,
  type Notification,
  type InsertNotification,
  notifications,
  type ActivityLog,
  type InsertActivityLog,
  activityLogs,
  type City,
  type InsertCity,
  cities,
  type ProductInventory,
  type InsertProductInventory,
  productInventory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte, count, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Products
  getProducts(categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id'>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Brands
  getBrands(): Promise<Brand[]>;
  createBrand(brand: Omit<Brand, 'id'>): Promise<Brand>;
  deleteBrand(id: number): Promise<void>;

  // Cart
  getCart(userId: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Addresses
  getAddresses(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<void>;
  setDefaultAddress(userId: number, addressId: number): Promise<void>;

  // Payment Cards
  getPaymentCards(userId: number): Promise<PaymentCard[]>;
  createPaymentCard(card: InsertPaymentCard): Promise<PaymentCard>;
  deletePaymentCard(id: number): Promise<void>;

  // Wallet
  getWallet(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: number, amount: string): Promise<Wallet | undefined>;
  getWalletTransactions(walletId: number): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;

  // Promotions
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: number): Promise<Promotion | undefined>;
  createPromotion(promo: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promo: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: number): Promise<void>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<void>;

  // Returns
  getReturns(): Promise<Return[]>;
  getReturn(id: number): Promise<Return | undefined>;
  createReturn(ret: InsertReturn): Promise<Return>;
  updateReturn(id: number, ret: Partial<InsertReturn>): Promise<Return | undefined>;

  // Shipments
  getShipments(): Promise<Shipment[]>;
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentByOrder(orderId: number): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: number, shipment: Partial<InsertShipment>): Promise<Shipment | undefined>;

  // Customer Segments
  getCustomerSegments(): Promise<CustomerSegment[]>;
  createCustomerSegment(segment: InsertCustomerSegment): Promise<CustomerSegment>;
  updateCustomerSegment(id: number, segment: Partial<InsertCustomerSegment>): Promise<CustomerSegment | undefined>;

  // Reports
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;

  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  getStaffByEmail(email: string): Promise<Staff | undefined>;
  createStaff(member: InsertStaff): Promise<Staff>;
  updateStaff(id: number, member: Partial<InsertStaff>): Promise<Staff | undefined>;

  // Support Tickets
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<void>;

  // Warehouses
  getWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  getWarehouseByCity(cityId: number): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: number): Promise<void>;

  // Cities
  getCities(): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: number, city: Partial<InsertCity>): Promise<City | undefined>;
  deleteCity(id: number): Promise<void>;

  // Product Inventory (per warehouse)
  getProductInventory(warehouseId: number): Promise<ProductInventory[]>;
  getProductInventoryByProduct(productId: number): Promise<ProductInventory[]>;
  getInventoryItem(productId: number, warehouseId: number): Promise<ProductInventory | undefined>;
  createProductInventory(inventory: InsertProductInventory): Promise<ProductInventory>;
  updateProductInventory(id: number, inventory: Partial<InsertProductInventory>): Promise<ProductInventory | undefined>;
  deleteProductInventory(id: number): Promise<void>;
  getProductsByCity(cityId: number): Promise<Product[]>;

  // Stats
  getDashboardStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    lowStockProducts: number;
  }>;
  getAllOrders(): Promise<Order[]>;
  getAllUsers(): Promise<User[]>;

  // Notifications
  getNotifications(userId?: number, staffId?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId?: number, staffId?: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId?: number, staffId?: number): Promise<void>;

  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Inventory
  getLowStockProducts(threshold?: number): Promise<Product[]>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Products
  async getProducts(categoryId?: number): Promise<Product[]> {
    if (categoryId) {
      return await db.select().from(products).where(eq(products.categoryId, categoryId));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    // Simple search implementation - could be improved with full-text search
    return await db.select().from(products);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async createBrand(brand: Omit<Brand, 'id'>): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  async deleteBrand(id: number): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
  }

  // Cart
  async getCart(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated || undefined;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Insert order items
    for (const item of items) {
      await db.insert(orderItems).values({ ...item, orderId: newOrder.id });
    }

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated || undefined;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Addresses
  async getAddresses(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: number, addressData: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(addresses).set(addressData).where(eq(addresses.id, id)).returning();
    return updated || undefined;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  async setDefaultAddress(userId: number, addressId: number): Promise<void> {
    // Reset all addresses to not default
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    // Set the selected address as default
    await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, addressId));
  }

  // Payment Cards
  async getPaymentCards(userId: number): Promise<PaymentCard[]> {
    return await db.select().from(paymentCards).where(eq(paymentCards.userId, userId));
  }

  async createPaymentCard(card: InsertPaymentCard): Promise<PaymentCard> {
    const [newCard] = await db.insert(paymentCards).values(card).returning();
    return newCard;
  }

  async deletePaymentCard(id: number): Promise<void> {
    await db.delete(paymentCards).where(eq(paymentCards.id, id));
  }

  // Wallet
  async getWallet(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet || undefined;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(wallets).values(wallet).returning();
    return newWallet;
  }

  async updateWalletBalance(userId: number, amount: string): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getWalletTransactions(walletId: number): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [newTransaction] = await db.insert(walletTransactions).values(transaction).returning();
    return newTransaction;
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return await db.select().from(promotions).orderBy(desc(promotions.createdAt));
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    const [promo] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promo || undefined;
  }

  async createPromotion(promo: InsertPromotion): Promise<Promotion> {
    const [newPromo] = await db.insert(promotions).values(promo).returning();
    return newPromo;
  }

  async updatePromotion(id: number, promoData: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const [updated] = await db.update(promotions).set(promoData).where(eq(promotions.id, id)).returning();
    return updated || undefined;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db.update(suppliers).set(supplierData).where(eq(suppliers.id, id)).returning();
    return updated || undefined;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  // Returns
  async getReturns(): Promise<Return[]> {
    return await db.select().from(returns).orderBy(desc(returns.createdAt));
  }

  async getReturn(id: number): Promise<Return | undefined> {
    const [ret] = await db.select().from(returns).where(eq(returns.id, id));
    return ret || undefined;
  }

  async createReturn(ret: InsertReturn): Promise<Return> {
    const [newReturn] = await db.insert(returns).values(ret).returning();
    return newReturn;
  }

  async updateReturn(id: number, retData: Partial<InsertReturn>): Promise<Return | undefined> {
    const [updated] = await db.update(returns).set(retData).where(eq(returns.id, id)).returning();
    return updated || undefined;
  }

  // Shipments
  async getShipments(): Promise<Shipment[]> {
    return await db.select().from(shipments).orderBy(desc(shipments.createdAt));
  }

  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async getShipmentByOrder(orderId: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.orderId, orderId));
    return shipment || undefined;
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [newShipment] = await db.insert(shipments).values(shipment).returning();
    return newShipment;
  }

  async updateShipment(id: number, shipmentData: Partial<InsertShipment>): Promise<Shipment | undefined> {
    const [updated] = await db.update(shipments).set({ ...shipmentData, updatedAt: new Date() }).where(eq(shipments.id, id)).returning();
    return updated || undefined;
  }

  // Customer Segments
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    return await db.select().from(customerSegments);
  }

  async createCustomerSegment(segment: InsertCustomerSegment): Promise<CustomerSegment> {
    const [newSegment] = await db.insert(customerSegments).values(segment).returning();
    return newSegment;
  }

  async updateCustomerSegment(id: number, segmentData: Partial<InsertCustomerSegment>): Promise<CustomerSegment | undefined> {
    const [updated] = await db.update(customerSegments).set(segmentData).where(eq(customerSegments.id, id)).returning();
    return updated || undefined;
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async getStaffMember(id: number): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id));
    return member || undefined;
  }

  async getStaffByEmail(email: string): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.email, email));
    return member || undefined;
  }

  async createStaff(member: InsertStaff): Promise<Staff> {
    const [newMember] = await db.insert(staff).values(member).returning();
    return newMember;
  }

  async updateStaff(id: number, memberData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [updated] = await db.update(staff).set(memberData).where(eq(staff.id, id)).returning();
    return updated || undefined;
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(supportTickets).set({ ...ticketData, updatedAt: new Date() }).where(eq(supportTickets.id, id)).returning();
    return updated || undefined;
  }

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || undefined;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon || undefined;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: number, couponData: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const [updated] = await db.update(coupons).set(couponData).where(eq(coupons.id, id)).returning();
    return updated || undefined;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses);
  }

  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse || undefined;
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [newWarehouse] = await db.insert(warehouses).values(warehouse).returning();
    return newWarehouse;
  }

  async updateWarehouse(id: number, warehouseData: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const [updated] = await db.update(warehouses).set(warehouseData).where(eq(warehouses.id, id)).returning();
    return updated || undefined;
  }

  async getWarehouseByCity(cityId: number): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.cityId, cityId));
    return warehouse || undefined;
  }

  async deleteWarehouse(id: number): Promise<void> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
  }

  // Cities
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).orderBy(cities.name);
  }

  async getCity(id: number): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city || undefined;
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async updateCity(id: number, cityData: Partial<InsertCity>): Promise<City | undefined> {
    const [updated] = await db.update(cities).set(cityData).where(eq(cities.id, id)).returning();
    return updated || undefined;
  }

  async deleteCity(id: number): Promise<void> {
    await db.delete(cities).where(eq(cities.id, id));
  }

  // Product Inventory (per warehouse)
  async getProductInventory(warehouseId: number): Promise<ProductInventory[]> {
    return await db.select().from(productInventory).where(eq(productInventory.warehouseId, warehouseId));
  }

  async getProductInventoryByProduct(productId: number): Promise<ProductInventory[]> {
    return await db.select().from(productInventory).where(eq(productInventory.productId, productId));
  }

  async getInventoryItem(productId: number, warehouseId: number): Promise<ProductInventory | undefined> {
    const [item] = await db.select().from(productInventory)
      .where(and(eq(productInventory.productId, productId), eq(productInventory.warehouseId, warehouseId)));
    return item || undefined;
  }

  async createProductInventory(inventory: InsertProductInventory): Promise<ProductInventory> {
    const [newItem] = await db.insert(productInventory).values(inventory).returning();
    return newItem;
  }

  async updateProductInventory(id: number, inventoryData: Partial<InsertProductInventory>): Promise<ProductInventory | undefined> {
    const [updated] = await db.update(productInventory).set(inventoryData).where(eq(productInventory.id, id)).returning();
    return updated || undefined;
  }

  async deleteProductInventory(id: number): Promise<void> {
    await db.delete(productInventory).where(eq(productInventory.id, id));
  }

  async getProductsByCity(cityId: number): Promise<Product[]> {
    const warehouse = await this.getWarehouseByCity(cityId);
    if (!warehouse) return [];
    
    const inventory = await db.select().from(productInventory)
      .where(and(eq(productInventory.warehouseId, warehouse.id), eq(productInventory.isActive, true)));
    
    const productIds = inventory.map(i => i.productId);
    if (productIds.length === 0) return [];
    
    return await db.select().from(products).where(sql`${products.id} = ANY(${productIds})`);
  }

  // Stats
  async getDashboardStats() {
    const [orderStats] = await db.select({ count: count() }).from(orders);
    const [userStats] = await db.select({ count: count() }).from(users);
    const [productStats] = await db.select({ count: count() }).from(products);
    const [pendingStats] = await db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending'));
    const [lowStockStats] = await db.select({ count: count() }).from(products).where(lte(products.stock, 30));
    
    const allOrders = await db.select().from(orders);
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

    return {
      totalOrders: orderStats.count,
      totalRevenue,
      totalCustomers: userStats.count,
      totalProducts: productStats.count,
      pendingOrders: pendingStats.count,
      lowStockProducts: lowStockStats.count,
    };
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Notifications
  async getNotifications(userId?: number, staffId?: number): Promise<Notification[]> {
    if (userId) {
      return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    }
    if (staffId) {
      return await db.select().from(notifications).where(eq(notifications.staffId, staffId)).orderBy(desc(notifications.createdAt));
    }
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsCount(userId?: number, staffId?: number): Promise<number> {
    if (userId) {
      const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
      return result.count;
    }
    if (staffId) {
      const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.staffId, staffId), eq(notifications.isRead, false)));
      return result.count;
    }
    const [result] = await db.select({ count: count() }).from(notifications).where(eq(notifications.isRead, false));
    return result.count;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId?: number, staffId?: number): Promise<void> {
    if (userId) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
    } else if (staffId) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.staffId, staffId));
    }
  }

  // Activity Logs
  async getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  // Inventory
  async getLowStockProducts(threshold: number = 30): Promise<Product[]> {
    return await db.select().from(products).where(lte(products.stock, threshold)).orderBy(products.stock);
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const [updated] = await db.update(products).set({ stock: quantity }).where(eq(products.id, id)).returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
