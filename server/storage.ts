import { cache, CACHE_KEYS, CACHE_TTL } from "./cache";
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
  type WalletDepositRequest,
  type InsertWalletDepositRequest,
  walletDepositRequests,
  type Promotion,
  type InsertPromotion,
  promotions,
  type Supplier,
  type InsertSupplier,
  suppliers,
  type SupplierTransaction,
  type InsertSupplierTransaction,
  supplierTransactions,
  type SupplierStockPosition,
  type InsertSupplierStockPosition,
  supplierStockPositions,
  type SupplierBalance,
  type InsertSupplierBalance,
  supplierBalances,
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
  type PriceTier,
  type InsertPriceTier,
  priceTiers,
  productInventory,
  type BannerView,
  type InsertBannerView,
  bannerViews,
  type Driver,
  type InsertDriver,
  drivers,
  type Vehicle,
  type InsertVehicle,
  vehicles,
  type Banner,
  type InsertBanner,
  banners,
  type BannerProduct,
  type InsertBannerProduct,
  bannerProducts,
  type ExpenseCategory,
  type InsertExpenseCategory,
  expenseCategories,
  type Expense,
  type InsertExpense,
  expenses,
  type DeliverySetting,
  type InsertDeliverySetting,
  deliverySettings,
  type CustomerCredit,
  type InsertCustomerCredit,
  customerCredits,
  type CreditTransaction,
  type InsertCreditTransaction,
  creditTransactions,
  type Favorite,
  type InsertFavorite,
  favorites,
  type SiteSetting,
  type InsertSiteSetting,
  siteSettings,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  notificationPreferences,
  type Referral,
  type InsertReferral,
  referrals,
  type OtpVerification,
  type InsertOtpVerification,
  otpVerifications,
  type LoginAttempt,
  loginAttempts,
  type ErpSetting,
  type InsertErpSetting,
  erpSettings,
  type ErpProduct,
  type InsertErpProduct,
  erpProducts,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, count, or } from "drizzle-orm";

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

  // Price Tiers - أسعار الجملة المتدرجة
  getPriceTiers(productId: number): Promise<PriceTier[]>;
  createPriceTier(tier: InsertPriceTier): Promise<PriceTier>;
  updatePriceTier(id: number, tier: Partial<InsertPriceTier>): Promise<PriceTier | undefined>;
  deletePriceTier(id: number): Promise<void>;
  deleteProductPriceTiers(productId: number): Promise<void>;
  getEffectivePrice(productId: number, quantity: number): Promise<{ price: number; discount: number; tierId?: number }>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id'>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Brands
  getBrands(): Promise<Brand[]>;
  createBrand(brand: Omit<Brand, 'id'>): Promise<Brand>;
  deleteBrand(id: number): Promise<void>;

  // Favorites
  getFavorites(userId: number): Promise<Favorite[]>;
  addFavorite(data: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, productId: number): Promise<void>;
  isFavorite(userId: number, productId: number): Promise<boolean>;

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
  deleteOrderItem(itemId: number): Promise<void>;
  updateOrderTotals(orderId: number, totals: { subtotal: string; tax: string; total: string }): Promise<void>;

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

  // Wallet Deposit Requests
  createWalletDepositRequest(request: InsertWalletDepositRequest): Promise<WalletDepositRequest>;
  getWalletDepositRequests(userId: number): Promise<WalletDepositRequest[]>;
  getAllWalletDepositRequests(status?: string): Promise<WalletDepositRequest[]>;
  approveWalletDepositRequest(id: number, reviewedBy: number, notes?: string): Promise<WalletDepositRequest | undefined>;
  rejectWalletDepositRequest(id: number, reviewedBy: number, notes?: string): Promise<WalletDepositRequest | undefined>;

  // Wallet Order Payment (atomic)
  createOrderWithWalletPayment(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;

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

  // Supplier Transactions
  getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]>;
  createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction>;
  recordSupplierImport(data: { supplierId: number; warehouseId: number; productId: number; quantity: number; unitPrice: string; notes?: string }): Promise<SupplierTransaction>;
  recordSupplierExport(data: { supplierId: number; warehouseId: number; productId: number; quantity: number; unitPrice: string; notes?: string }): Promise<SupplierTransaction>;
  recordSupplierPayment(data: { supplierId: number; amount: string; paymentMethod: string; referenceNumber?: string; notes?: string }): Promise<SupplierTransaction>;

  // Supplier Stock Positions
  getSupplierStockPositions(supplierId: number): Promise<SupplierStockPosition[]>;
  getSupplierStockPosition(supplierId: number, productId: number, warehouseId: number): Promise<SupplierStockPosition | undefined>;

  // Supplier Balances
  getSupplierBalance(supplierId: number): Promise<SupplierBalance | undefined>;
  getSupplierDashboard(supplierId: number): Promise<{
    supplier: Supplier;
    balance: SupplierBalance | undefined;
    stockPositions: SupplierStockPosition[];
    recentTransactions: SupplierTransaction[];
  }>;
  recalculateSupplierBalance(supplierId: number): Promise<SupplierBalance>;

  // Returns
  getReturns(): Promise<Return[]>;
  getReturn(id: number): Promise<Return | undefined>;
  createReturn(ret: InsertReturn): Promise<Return>;
  updateReturn(id: number, ret: Partial<InsertReturn>): Promise<Return | undefined>;
  deleteReturn(id: number): Promise<void>;

  // Shipments
  getShipments(): Promise<Shipment[]>;
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentByOrder(orderId: number): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: number, shipment: Partial<InsertShipment>): Promise<Shipment | undefined>;

  // Customer Segments
  getCustomerSegments(): Promise<CustomerSegment[]>;
  getCustomerSegment(id: number): Promise<CustomerSegment | undefined>;
  createCustomerSegment(segment: InsertCustomerSegment): Promise<CustomerSegment>;
  updateCustomerSegment(id: number, segment: Partial<InsertCustomerSegment>): Promise<CustomerSegment | undefined>;
  deleteCustomerSegment(id: number): Promise<void>;
  recalculateSegmentCounts(): Promise<void>;

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
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;

  // Referrals
  getReferralsByUser(userId: number): Promise<Referral[]>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: number, referral: Partial<InsertReferral>): Promise<Referral | undefined>;
  getUserReferralStats(userId: number): Promise<{ totalReferred: number; completedReferrals: number; totalEarned: string }>;

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
  
  // Product with Inventory (transactional)
  createProductWithInventory(product: InsertProduct, inventoryItems: { warehouseId: number; stock: number }[]): Promise<Product>;
  updateProductWithInventory(id: number, product: Partial<InsertProduct>, inventoryItems: { warehouseId: number; stock: number }[]): Promise<Product | undefined>;
  getProductWithInventory(id: number): Promise<{ product: Product; inventory: ProductInventory[] } | undefined>;

  // Stats
  getDashboardStats(warehouseId?: number): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    lowStockProducts: number;
  }>;
  getAllOrders(): Promise<Order[]>;
  getAllUsers(): Promise<User[]>;
  getCustomerStats(): Promise<{
    total: number;
    newThisMonth: number;
    vipCount: number;
    activeCount: number;
    inactiveCount: number;
    avgCustomerValue: number;
    retentionRate: number;
    reorderRate: number;
    satisfactionRate: number;
    conversionRate: number;
  }>;
  getCustomerDetails(userId: number): Promise<{
    user: User;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date | null;
    isVip: boolean;
    isActive: boolean;
  } | null>;
  getTopCustomers(limit?: number): Promise<Array<{
    user: User;
    totalSpent: number;
    orderCount: number;
  }>>;
  getCustomerGrowthData(): Promise<Array<{
    month: string;
    count: number;
  }>>;

  // Notifications
  getNotifications(userId?: number, staffId?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId?: number, staffId?: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId?: number, staffId?: number): Promise<void>;

  // Notification Preferences
  getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined>;
  createNotificationPreferences(prefs: InsertNotificationPreferences): Promise<NotificationPreferences>;
  updateNotificationPreferences(userId: number, prefs: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences | undefined>;

  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Inventory
  getLowStockProducts(threshold?: number): Promise<Product[]>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;

  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: number): Promise<void>;
  getDriversByWarehouse(warehouseId: number): Promise<Driver[]>;
  getAvailableDrivers(): Promise<Driver[]>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;
  getVehiclesByWarehouse(warehouseId: number): Promise<Vehicle[]>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  assignVehicleToDriver(vehicleId: number, driverId: number): Promise<Vehicle | undefined>;

  // Banners
  getBanners(): Promise<Banner[]>;
  getActiveBanners(cityId?: number): Promise<Banner[]>;
  getBanner(id: number): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<void>;
  duplicateBanner(id: number): Promise<Banner | undefined>;
  incrementBannerViews(id: number): Promise<void>;
  incrementBannerClicks(id: number): Promise<void>;
  incrementBannerPurchase(id: number, amount: number): Promise<void>;
  reorderBanners(bannerIds: number[]): Promise<void>;
  deleteBanners(ids: number[]): Promise<void>;
  getBannerStats(): Promise<{ totalViews: number; totalClicks: number; avgCtr: number }>;

  // Banner Views Tracking - تتبع مشاهدات الشرائح
  trackBannerView(bannerId: number, userId?: number, ipAddress?: string, userAgent?: string): Promise<BannerView>;
  trackBannerClick(bannerId: number, userId?: number): Promise<void>;
  getBannerViewers(bannerId: number): Promise<(BannerView & { user?: User })[]>;

  // Banner Products - منتجات الباقات
  getBannerProducts(bannerId: number): Promise<(BannerProduct & { product: Product })[]>;
  addBannerProduct(bannerProduct: InsertBannerProduct): Promise<BannerProduct>;
  updateBannerProduct(id: number, data: Partial<InsertBannerProduct>): Promise<BannerProduct | undefined>;
  removeBannerProduct(id: number): Promise<void>;
  clearBannerProducts(bannerId: number): Promise<void>;

  // Expense Categories - فئات المصاريف
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: number): Promise<void>;

  // Expenses - المصاريف
  getExpenses(filters?: { categoryId?: number; warehouseId?: number; startDate?: Date; endDate?: Date }): Promise<(Expense & { category: ExpenseCategory; warehouse?: { id: number; name: string } })[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<void>;
  getExpenseSummary(filters?: { startDate?: Date; endDate?: Date; warehouseId?: number }): Promise<{
    totalExpenses: number;
    byCategory: { categoryId: number; categoryName: string; total: number; count: number }[];
    byMonth: { month: string; total: number }[];
  }>;

  // Delivery Settings - إعدادات التوصيل
  getDeliverySettings(): Promise<DeliverySetting[]>;
  getDeliverySetting(id: number): Promise<DeliverySetting | undefined>;
  getDeliverySettingByWarehouse(warehouseId: number): Promise<DeliverySetting | undefined>;
  createDeliverySetting(setting: InsertDeliverySetting): Promise<DeliverySetting>;
  updateDeliverySetting(id: number, setting: Partial<InsertDeliverySetting>): Promise<DeliverySetting | undefined>;
  deleteDeliverySetting(id: number): Promise<void>;
  resolveDeliveryFee(warehouseId: number, subtotal: number, quantity: number): Promise<{ fee: number; isFree: boolean; reason?: string }>;

  // OTP Verification - رموز التحقق
  createOtp(phone: string, code: string, expiresAt: Date): Promise<OtpVerification>;
  getValidOtp(phone: string, code: string): Promise<OtpVerification | undefined>;
  getOtpByPhone(phone: string): Promise<OtpVerification | undefined>;
  isPhoneVerified(phone: string): Promise<boolean>;
  markOtpUsedWithToken(id: number, token: string): Promise<void>;
  incrementOtpAttempts(id: number): Promise<void>;
  deleteExpiredOtps(): Promise<void>;
  getRecentOtpCount(phone: string, minutes: number): Promise<number>;
  validateVerificationToken(phone: string, token: string): Promise<boolean>;
  invalidateVerificationToken(phone: string, token: string): Promise<void>;

  // Login Attempts - محاولات تسجيل الدخول
  getLoginAttempts(phone: string): Promise<{ attempts: number; lockedUntil: Date | null }>;
  incrementLoginAttempts(phone: string): Promise<{ attempts: number; isLocked: boolean }>;
  resetLoginAttempts(phone: string): Promise<void>;
  isAccountLocked(phone: string): Promise<boolean>;
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
    const cacheKey = categoryId 
      ? `${CACHE_KEYS.PRODUCTS_BY_CATEGORY}${categoryId}` 
      : CACHE_KEYS.PRODUCTS;
    
    const cached = cache.get<Product[]>(cacheKey);
    if (cached) return cached;
    
    let result: Product[];
    if (categoryId) {
      result = await db.select().from(products).where(eq(products.categoryId, categoryId));
    } else {
      result = await db.select().from(products);
    }
    
    cache.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    cache.invalidatePattern(CACHE_KEYS.PRODUCTS);
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    cache.invalidatePattern(CACHE_KEYS.PRODUCTS);
    const [product] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    cache.invalidatePattern(CACHE_KEYS.PRODUCTS);
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    // Simple search implementation - could be improved with full-text search
    return await db.select().from(products);
  }

  // Price Tiers - أسعار الجملة المتدرجة
  async getPriceTiers(productId: number): Promise<PriceTier[]> {
    return await db.select().from(priceTiers)
      .where(eq(priceTiers.productId, productId))
      .orderBy(asc(priceTiers.minQuantity));
  }

  async createPriceTier(tier: InsertPriceTier): Promise<PriceTier> {
    const [newTier] = await db.insert(priceTiers).values(tier).returning();
    return newTier;
  }

  async updatePriceTier(id: number, tier: Partial<InsertPriceTier>): Promise<PriceTier | undefined> {
    const [updated] = await db.update(priceTiers).set(tier).where(eq(priceTiers.id, id)).returning();
    return updated || undefined;
  }

  async deletePriceTier(id: number): Promise<void> {
    await db.delete(priceTiers).where(eq(priceTiers.id, id));
  }

  async deleteProductPriceTiers(productId: number): Promise<void> {
    await db.delete(priceTiers).where(eq(priceTiers.productId, productId));
  }

  async getEffectivePrice(productId: number, quantity: number): Promise<{ price: number; discount: number; tierId?: number }> {
    // Get product base price
    const product = await this.getProduct(productId);
    if (!product) {
      return { price: 0, discount: 0 };
    }
    
    const basePrice = parseFloat(product.price);
    
    // Get applicable price tier
    const tiers = await this.getPriceTiers(productId);
    let effectiveTier: PriceTier | undefined;
    
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        if (!tier.maxQuantity || quantity <= tier.maxQuantity) {
          effectiveTier = tier;
        }
      }
    }
    
    if (effectiveTier) {
      const tierPrice = parseFloat(effectiveTier.price);
      const discount = basePrice - tierPrice;
      return { price: tierPrice, discount, tierId: effectiveTier.id };
    }
    
    return { price: basePrice, discount: 0 };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const cached = cache.get<Category[]>(CACHE_KEYS.CATEGORIES);
    if (cached) return cached;
    
    const result = await db.select().from(categories);
    cache.set(CACHE_KEYS.CATEGORIES, result, CACHE_TTL.LONG);
    return result;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    cache.delete(CACHE_KEYS.CATEGORIES);
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    cache.delete(CACHE_KEYS.CATEGORIES);
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

  // Favorites
  async getFavorites(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async addFavorite(data: InsertFavorite): Promise<Favorite> {
    const [existing] = await db.select().from(favorites).where(
      and(eq(favorites.userId, data.userId), eq(favorites.productId, data.productId))
    );
    if (existing) {
      return existing;
    }
    const [favorite] = await db.insert(favorites).values(data).returning();
    return favorite;
  }

  async removeFavorite(userId: number, productId: number): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.productId, productId))
    );
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const [existing] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.productId, productId))
    );
    return !!existing;
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
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      // Insert order items and atomically deduct inventory
      for (const item of items) {
        await tx.insert(orderItems).values({ ...item, orderId: newOrder.id });
        
        // Atomic stock deduction with WHERE clause to prevent overselling
        if (order.warehouseId) {
          const result = await tx.update(productInventory)
            .set({ stock: sql`${productInventory.stock} - ${item.quantity}` })
            .where(and(
              eq(productInventory.productId, item.productId),
              eq(productInventory.warehouseId, order.warehouseId),
              sql`${productInventory.stock} >= ${item.quantity}`
            ))
            .returning();
          
          if (result.length === 0) {
            throw new Error(`المنتج "${item.productName}" غير متوفر بالكمية المطلوبة`);
          }
        }
        
        // Allocate sale to supplier within transaction
        await this.allocateSaleToSupplierTx(tx, item.productId, item.quantity, item.price, newOrder.id);
      }

      return newOrder;
    });
  }

  private async allocateSaleToSupplierTx(tx: any, productId: number, quantity: number, salePrice: string, orderId: number): Promise<void> {
    // Use FOR UPDATE to lock supplier stock positions during allocation
    const positions = await tx.execute(
      sql`SELECT * FROM supplier_stock_positions 
          WHERE product_id = ${productId} AND quantity > 0 
          ORDER BY last_import_date 
          FOR UPDATE`
    );

    let remainingQty = quantity;

    for (const position of positions.rows || positions) {
      if (remainingQty <= 0) break;

      const positionQty = position.quantity || 0;
      const allocateQty = Math.min(remainingQty, positionQty);
      const costPrice = position.avg_cost || '0';
      const totalAmount = (allocateQty * parseFloat(costPrice)).toFixed(2);

      await tx.insert(supplierTransactions).values({
        supplierId: position.supplier_id,
        warehouseId: position.warehouse_id,
        productId: productId,
        type: 'sale',
        quantity: allocateQty,
        unitPrice: costPrice,
        totalAmount,
        referenceNumber: `ORD-${orderId}`,
        notes: `مبيعات من الطلب رقم ${orderId}`,
      });

      const newQty = positionQty - allocateQty;
      await tx.update(supplierStockPositions)
        .set({ quantity: newQty, updatedAt: new Date() })
        .where(eq(supplierStockPositions.id, position.id));

      remainingQty -= allocateQty;
    }
    
    // Note: If remainingQty > 0, it means supplier stock doesn't fully cover the order
    // This is acceptable as supplier stock is for accounting, not inventory control
  }

  async deductProductInventory(productId: number, warehouseId: number, quantity: number): Promise<void> {
    const [inventory] = await db.select().from(productInventory)
      .where(and(
        eq(productInventory.productId, productId),
        eq(productInventory.warehouseId, warehouseId)
      ));
    
    if (inventory) {
      const newStock = Math.max(0, inventory.stock - quantity);
      await db.update(productInventory)
        .set({ stock: newStock })
        .where(eq(productInventory.id, inventory.id));
    }
  }

  async checkStockAvailability(productId: number, warehouseId: number, quantity: number): Promise<{ available: boolean; currentStock: number }> {
    const [inventory] = await db.select().from(productInventory)
      .where(and(
        eq(productInventory.productId, productId),
        eq(productInventory.warehouseId, warehouseId)
      ));
    
    const currentStock = inventory?.stock || 0;
    return {
      available: currentStock >= quantity,
      currentStock
    };
  }

  async allocateSaleToSupplier(productId: number, quantity: number, salePrice: string, orderId: number): Promise<void> {
    // Find all supplier stock positions for this product, ordered by oldest import first (FIFO)
    const positions = await db.select().from(supplierStockPositions)
      .where(and(
        eq(supplierStockPositions.productId, productId),
        sql`${supplierStockPositions.quantity} > 0`
      ))
      .orderBy(supplierStockPositions.lastImportDate);

    let remainingQty = quantity;

    for (const position of positions) {
      if (remainingQty <= 0) break;

      const allocateQty = Math.min(remainingQty, position.quantity);
      // Use the supplier's original cost price (avgCost), not the sale price
      const costPrice = position.avgCost || '0';
      const totalAmount = (allocateQty * parseFloat(costPrice)).toFixed(2);

      // Record sale transaction for this supplier using their cost price
      await db.insert(supplierTransactions).values({
        supplierId: position.supplierId,
        warehouseId: position.warehouseId,
        productId: productId,
        type: 'sale',
        quantity: allocateQty,
        unitPrice: costPrice,
        totalAmount,
        referenceNumber: `ORD-${orderId}`,
        notes: `مبيعات من الطلب رقم ${orderId}`,
      });

      // Deduct from supplier stock position
      const newQty = position.quantity - allocateQty;
      await db.update(supplierStockPositions)
        .set({ quantity: newQty, updatedAt: new Date() })
        .where(eq(supplierStockPositions.id, position.id));

      // Recalculate supplier balance
      await this.recalculateSupplierBalance(position.supplierId);

      remainingQty -= allocateQty;
    }
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

  async deleteOrderItem(itemId: number): Promise<void> {
    await db.delete(orderItems).where(eq(orderItems.id, itemId));
  }

  async updateOrderTotals(orderId: number, totals: { subtotal: string; tax: string; total: string }): Promise<void> {
    await db.update(orders)
      .set({ 
        subtotal: totals.subtotal, 
        tax: totals.tax, 
        total: totals.total,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));
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

  // Wallet Deposit Requests
  async createWalletDepositRequest(request: InsertWalletDepositRequest): Promise<WalletDepositRequest> {
    const [newRequest] = await db.insert(walletDepositRequests).values(request).returning();
    return newRequest;
  }

  async getWalletDepositRequests(userId: number): Promise<WalletDepositRequest[]> {
    return await db.select()
      .from(walletDepositRequests)
      .where(eq(walletDepositRequests.userId, userId))
      .orderBy(desc(walletDepositRequests.createdAt));
  }

  async getAllWalletDepositRequests(status?: string): Promise<WalletDepositRequest[]> {
    if (status) {
      return await db.select()
        .from(walletDepositRequests)
        .where(eq(walletDepositRequests.status, status))
        .orderBy(desc(walletDepositRequests.createdAt));
    }
    return await db.select().from(walletDepositRequests).orderBy(desc(walletDepositRequests.createdAt));
  }

  async approveWalletDepositRequest(id: number, reviewedBy: number, notes?: string): Promise<WalletDepositRequest | undefined> {
    const [request] = await db.select().from(walletDepositRequests).where(eq(walletDepositRequests.id, id));
    if (!request || request.status !== 'pending') return undefined;

    // Update request status
    const [updatedRequest] = await db.update(walletDepositRequests)
      .set({
        status: 'approved',
        reviewedBy,
        reviewNotes: notes || null,
        reviewedAt: new Date()
      })
      .where(eq(walletDepositRequests.id, id))
      .returning();

    // Get wallet and update balance
    const wallet = await this.getWallet(request.userId);
    if (wallet) {
      const newBalance = (parseFloat(wallet.balance) + parseFloat(request.amount)).toFixed(2);
      await this.updateWalletBalance(request.userId, newBalance);

      // Create wallet transaction
      await this.createWalletTransaction({
        walletId: wallet.id,
        type: 'deposit',
        amount: request.amount,
        title: 'شحن رصيد - بشام كاش',
        method: 'basha_cash'
      });
    }

    return updatedRequest;
  }

  async rejectWalletDepositRequest(id: number, reviewedBy: number, notes?: string): Promise<WalletDepositRequest | undefined> {
    const [updatedRequest] = await db.update(walletDepositRequests)
      .set({
        status: 'rejected',
        reviewedBy,
        reviewNotes: notes || null,
        reviewedAt: new Date()
      })
      .where(eq(walletDepositRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  async createOrderWithWalletPayment(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      // Check wallet balance within transaction
      const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, order.userId));
      if (!wallet) {
        throw new Error('لم يتم العثور على المحفظة');
      }
      
      const walletBalance = parseFloat(wallet.balance);
      const originalTotal = parseFloat(order.total);
      
      // Apply 1% Basha Cash discount for wallet payments
      const discountRate = 0.01; // 1% خصم
      const walletDiscount = originalTotal * discountRate;
      const discountedTotal = originalTotal - walletDiscount;
      
      if (walletBalance < discountedTotal) {
        throw new Error('رصيد المحفظة غير كافي');
      }
      
      // Create order with discount applied
      const orderWithDiscount = {
        ...order,
        walletDiscount: walletDiscount.toFixed(2),
        total: discountedTotal.toFixed(2)
      };
      const [newOrder] = await tx.insert(orders).values(orderWithDiscount).returning();
      
      // Add items and atomically deduct inventory
      for (const item of items) {
        await tx.insert(orderItems).values({
          ...item,
          orderId: newOrder.id
        });
        
        // Atomic stock deduction with WHERE clause to prevent overselling
        if (order.warehouseId) {
          const result = await tx.update(productInventory)
            .set({ stock: sql`${productInventory.stock} - ${item.quantity}` })
            .where(and(
              eq(productInventory.productId, item.productId),
              eq(productInventory.warehouseId, order.warehouseId),
              sql`${productInventory.stock} >= ${item.quantity}`
            ))
            .returning();
          
          if (result.length === 0) {
            throw new Error(`المنتج "${item.productName}" غير متوفر بالكمية المطلوبة`);
          }
        }
        
        // Allocate sale to supplier within transaction
        await this.allocateSaleToSupplierTx(tx, item.productId, item.quantity, item.price, newOrder.id);
      }
      
      // Deduct discounted amount from wallet
      const newBalance = (walletBalance - discountedTotal).toFixed(2);
      await tx.update(wallets).set({ balance: newBalance, updatedAt: new Date() }).where(eq(wallets.userId, order.userId));
      
      // Record wallet transaction
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        type: 'payment',
        amount: discountedTotal.toFixed(2),
        title: `دفع طلب #${newOrder.id} (خصم Basha Cash 1%)`,
        method: 'wallet'
      });
      
      // Clear cart
      await tx.delete(cartItems).where(eq(cartItems.userId, order.userId));
      
      return newOrder;
    });
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

  // Supplier Transactions
  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    return await db.select().from(supplierTransactions)
      .where(eq(supplierTransactions.supplierId, supplierId))
      .orderBy(desc(supplierTransactions.createdAt));
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    const [newTransaction] = await db.insert(supplierTransactions).values(transaction).returning();
    return newTransaction;
  }

  async recordSupplierImport(data: { supplierId: number; warehouseId: number; productId: number; quantity: number; unitPrice: string; notes?: string }): Promise<SupplierTransaction> {
    const totalAmount = (parseFloat(data.unitPrice) * data.quantity).toFixed(2);
    
    // Create the import transaction
    const [transaction] = await db.insert(supplierTransactions).values({
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      type: 'import',
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount,
      notes: data.notes,
    }).returning();

    // Update or create stock position
    const existingPosition = await this.getSupplierStockPosition(data.supplierId, data.productId, data.warehouseId);
    if (existingPosition) {
      const newQty = existingPosition.quantity + data.quantity;
      await db.update(supplierStockPositions)
        .set({ quantity: newQty, lastImportDate: new Date(), updatedAt: new Date() })
        .where(eq(supplierStockPositions.id, existingPosition.id));
    } else {
      await db.insert(supplierStockPositions).values({
        supplierId: data.supplierId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        avgCost: data.unitPrice,
        lastImportDate: new Date(),
      });
    }

    // Recalculate supplier balance
    await this.recalculateSupplierBalance(data.supplierId);

    return transaction;
  }

  async recordSupplierExport(data: { supplierId: number; warehouseId: number; productId: number; quantity: number; unitPrice: string; notes?: string }): Promise<SupplierTransaction> {
    const totalAmount = (parseFloat(data.unitPrice) * data.quantity).toFixed(2);
    
    // Create the export transaction (negative)
    const [transaction] = await db.insert(supplierTransactions).values({
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      type: 'export',
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount,
      notes: data.notes,
    }).returning();

    // Update stock position
    const existingPosition = await this.getSupplierStockPosition(data.supplierId, data.productId, data.warehouseId);
    if (existingPosition) {
      const newQty = Math.max(0, existingPosition.quantity - data.quantity);
      await db.update(supplierStockPositions)
        .set({ quantity: newQty, updatedAt: new Date() })
        .where(eq(supplierStockPositions.id, existingPosition.id));
    }

    // Recalculate supplier balance
    await this.recalculateSupplierBalance(data.supplierId);

    return transaction;
  }

  async recordSupplierPayment(data: { supplierId: number; amount: string; paymentMethod: string; referenceNumber?: string; notes?: string }): Promise<SupplierTransaction> {
    // Create the payment transaction
    const [transaction] = await db.insert(supplierTransactions).values({
      supplierId: data.supplierId,
      type: 'payment',
      totalAmount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
    }).returning();

    // Recalculate supplier balance
    await this.recalculateSupplierBalance(data.supplierId);

    return transaction;
  }

  // Supplier Stock Positions
  async getSupplierStockPositions(supplierId: number): Promise<SupplierStockPosition[]> {
    return await db.select().from(supplierStockPositions)
      .where(eq(supplierStockPositions.supplierId, supplierId));
  }

  async getSupplierStockPosition(supplierId: number, productId: number, warehouseId: number): Promise<SupplierStockPosition | undefined> {
    const [position] = await db.select().from(supplierStockPositions)
      .where(and(
        eq(supplierStockPositions.supplierId, supplierId),
        eq(supplierStockPositions.productId, productId),
        eq(supplierStockPositions.warehouseId, warehouseId)
      ));
    return position || undefined;
  }

  // Supplier Balances
  async getSupplierBalance(supplierId: number): Promise<SupplierBalance | undefined> {
    const [balance] = await db.select().from(supplierBalances)
      .where(eq(supplierBalances.supplierId, supplierId));
    return balance || undefined;
  }

  async getSupplierDashboard(supplierId: number): Promise<{
    supplier: Supplier;
    balance: SupplierBalance | undefined;
    stockPositions: SupplierStockPosition[];
    recentTransactions: SupplierTransaction[];
  }> {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier) throw new Error('Supplier not found');
    
    const balance = await this.getSupplierBalance(supplierId);
    const stockPositions = await this.getSupplierStockPositions(supplierId);
    const recentTransactions = (await this.getSupplierTransactions(supplierId)).slice(0, 20);

    return { supplier, balance, stockPositions, recentTransactions };
  }

  async recalculateSupplierBalance(supplierId: number): Promise<SupplierBalance> {
    // Get all transactions for this supplier
    const transactions = await db.select().from(supplierTransactions)
      .where(eq(supplierTransactions.supplierId, supplierId));

    let totalImports = 0;
    let totalExports = 0;
    let totalSales = 0;
    let totalPayments = 0;

    for (const t of transactions) {
      const amount = parseFloat(t.totalAmount);
      switch (t.type) {
        case 'import':
          totalImports += amount;
          break;
        case 'export':
          totalExports += amount;
          break;
        case 'sale':
          totalSales += amount;
          break;
        case 'payment':
          totalPayments += amount;
          break;
      }
    }

    // Calculate stock value
    const stockPositions = await this.getSupplierStockPositions(supplierId);
    let totalStockValue = 0;
    for (const pos of stockPositions) {
      totalStockValue += pos.quantity * parseFloat(pos.avgCost || '0');
    }

    // Balance = imports - exports - payments (what we still owe)
    const balance = totalImports - totalExports - totalPayments;

    // Upsert the balance record
    const existingBalance = await this.getSupplierBalance(supplierId);
    if (existingBalance) {
      const [updated] = await db.update(supplierBalances)
        .set({
          totalImports: totalImports.toFixed(2),
          totalExports: totalExports.toFixed(2),
          totalSales: totalSales.toFixed(2),
          totalPayments: totalPayments.toFixed(2),
          balance: balance.toFixed(2),
          totalStockValue: totalStockValue.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(supplierBalances.supplierId, supplierId))
        .returning();
      return updated;
    } else {
      const [newBalance] = await db.insert(supplierBalances)
        .values({
          supplierId,
          totalImports: totalImports.toFixed(2),
          totalExports: totalExports.toFixed(2),
          totalSales: totalSales.toFixed(2),
          totalPayments: totalPayments.toFixed(2),
          balance: balance.toFixed(2),
          totalStockValue: totalStockValue.toFixed(2),
        })
        .returning();
      return newBalance;
    }
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

  async deleteReturn(id: number): Promise<void> {
    await db.delete(returns).where(eq(returns.id, id));
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

  async getCustomerSegment(id: number): Promise<CustomerSegment | undefined> {
    const [segment] = await db.select().from(customerSegments).where(eq(customerSegments.id, id));
    return segment || undefined;
  }

  async deleteCustomerSegment(id: number): Promise<void> {
    await db.delete(customerSegments).where(eq(customerSegments.id, id));
  }

  async recalculateSegmentCounts(): Promise<void> {
    // Get all segments and recalculate counts based on criteria
    const allSegments = await db.select().from(customerSegments);
    const allUsers = await db.select().from(users);
    
    for (const segment of allSegments) {
      let count = 0;
      const criteria = segment.criteria ? JSON.parse(segment.criteria) : {};
      
      for (const user of allUsers) {
        let matches = true;
        
        // Check criteria
        if (criteria.minOrders !== undefined) {
          // Would need to count orders per user
          matches = matches && true; // Simplified for now
        }
        // isVip criteria removed - field doesn't exist in users table
        if (criteria.cityId !== undefined) {
          matches = matches && (user.cityId === criteria.cityId);
        }
        
        if (matches) count++;
      }
      
      await db.update(customerSegments)
        .set({ customerCount: count })
        .where(eq(customerSegments.id, segment.id));
    }
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

  async deleteStaff(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
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

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
  }

  // Referrals
  async getReferralsByUser(userId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referralCode, code));
    return referral || undefined;
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async updateReferral(id: number, referralData: Partial<InsertReferral>): Promise<Referral | undefined> {
    const [updated] = await db.update(referrals).set(referralData).where(eq(referrals.id, id)).returning();
    return updated || undefined;
  }

  async getUserReferralStats(userId: number): Promise<{ totalReferred: number; completedReferrals: number; totalEarned: string }> {
    const userReferrals = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
    const completedReferrals = userReferrals.filter(r => r.status === 'rewarded').length;
    const totalEarned = userReferrals
      .filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + parseFloat(r.rewardAmount || '0'), 0);
    return {
      totalReferred: userReferrals.length,
      completedReferrals,
      totalEarned: totalEarned.toString()
    };
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
    // First delete any warehouses linked to this city
    await db.delete(warehouses).where(eq(warehouses.cityId, id));
    // Then delete the city
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

  // Product with Inventory (transactional)
  async createProductWithInventory(product: InsertProduct, inventoryItems: { warehouseId: number; stock: number }[]): Promise<Product> {
    return await db.transaction(async (tx) => {
      const [newProduct] = await tx.insert(products).values(product).returning();
      
      if (inventoryItems.length > 0) {
        const inventoryRecords = inventoryItems.map(item => ({
          productId: newProduct.id,
          warehouseId: item.warehouseId,
          stock: item.stock,
          isActive: true,
        }));
        await tx.insert(productInventory).values(inventoryRecords);
      }
      
      return newProduct;
    });
  }

  async updateProductWithInventory(id: number, productData: Partial<InsertProduct>, inventoryItems: { warehouseId: number; stock: number }[]): Promise<Product | undefined> {
    return await db.transaction(async (tx) => {
      const [updatedProduct] = await tx.update(products).set(productData).where(eq(products.id, id)).returning();
      if (!updatedProduct) return undefined;
      
      await tx.delete(productInventory).where(eq(productInventory.productId, id));
      
      if (inventoryItems.length > 0) {
        const inventoryRecords = inventoryItems.map(item => ({
          productId: id,
          warehouseId: item.warehouseId,
          stock: item.stock,
          isActive: true,
        }));
        await tx.insert(productInventory).values(inventoryRecords);
      }
      
      return updatedProduct;
    });
  }

  async getProductWithInventory(id: number): Promise<{ product: Product; inventory: ProductInventory[] } | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    
    const inventory = await db.select().from(productInventory).where(eq(productInventory.productId, id));
    return { product, inventory };
  }

  // Stats
  async getDashboardStats(warehouseId?: number) {
    // Build order queries with optional warehouse filter
    const orderCondition = warehouseId ? eq(orders.warehouseId, warehouseId) : undefined;
    const pendingCondition = warehouseId 
      ? and(eq(orders.status, 'pending'), eq(orders.warehouseId, warehouseId))
      : eq(orders.status, 'pending');
    
    const [orderStats] = orderCondition 
      ? await db.select({ count: count() }).from(orders).where(orderCondition)
      : await db.select({ count: count() }).from(orders);
    const [pendingStats] = await db.select({ count: count() }).from(orders).where(pendingCondition);
    
    // Customers and Products: scope by warehouse if provided
    let customerCount = 0;
    let productCount = 0;
    let lowStockCount = 0;
    
    if (warehouseId) {
      // Customers: count unique customers who ordered from this warehouse
      const warehouseOrders = await db.select({ userId: orders.userId })
        .from(orders)
        .where(eq(orders.warehouseId, warehouseId));
      const uniqueCustomers = new Set(warehouseOrders.map(o => o.userId));
      customerCount = uniqueCustomers.size;
      
      // Products: count products with inventory in this warehouse
      const [productStats] = await db.select({ count: count() })
        .from(productInventory)
        .where(eq(productInventory.warehouseId, warehouseId));
      productCount = productStats.count;
      
      // Low stock: products with low inventory in this warehouse
      const [lowStockStats] = await db.select({ count: count() })
        .from(productInventory)
        .where(and(eq(productInventory.warehouseId, warehouseId), lte(productInventory.stock, 30)));
      lowStockCount = lowStockStats.count;
    } else {
      // Global stats for admin
      const [userStats] = await db.select({ count: count() }).from(users);
      customerCount = userStats.count;
      
      const [productStats] = await db.select({ count: count() }).from(products);
      productCount = productStats.count;
      
      const [lowStockStats] = await db.select({ count: count() }).from(products).where(lte(products.stock, 30));
      lowStockCount = lowStockStats.count;
    }
    
    // Revenue calculation with warehouse filter
    const allOrders = orderCondition 
      ? await db.select().from(orders).where(orderCondition)
      : await db.select().from(orders);
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

    return {
      totalOrders: orderStats.count,
      totalRevenue,
      totalCustomers: customerCount,
      totalProducts: productCount,
      pendingOrders: pendingStats.count,
      lowStockProducts: lowStockCount,
    };
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCustomerStats(): Promise<{
    total: number;
    newThisMonth: number;
    vipCount: number;
    activeCount: number;
    inactiveCount: number;
    avgCustomerValue: number;
    retentionRate: number;
    reorderRate: number;
    satisfactionRate: number;
    conversionRate: number;
  }> {
    const allUsers = await db.select().from(users);
    const total = allUsers.length;
    
    // New this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = allUsers.filter(u => new Date(u.createdAt!) >= startOfMonth).length;
    
    // Get all orders for analysis
    const allOrders = await db.select().from(orders);
    
    // Calculate total spent per user
    const userSpending: Record<number, number> = {};
    const userOrderCount: Record<number, number> = {};
    const userLastOrder: Record<number, Date> = {};
    
    for (const order of allOrders) {
      if (!userSpending[order.userId]) {
        userSpending[order.userId] = 0;
        userOrderCount[order.userId] = 0;
      }
      userSpending[order.userId] += parseFloat(order.total);
      userOrderCount[order.userId]++;
      const orderDate = new Date(order.createdAt!);
      if (!userLastOrder[order.userId] || orderDate > userLastOrder[order.userId]) {
        userLastOrder[order.userId] = orderDate;
      }
    }
    
    // VIP customers: spent > 500,000 SYP
    const vipThreshold = 500000;
    const vipCount = Object.values(userSpending).filter(spent => spent >= vipThreshold).length;
    
    // Active: ordered in last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeCount = Object.entries(userLastOrder).filter(([_, date]) => date >= thirtyDaysAgo).length;
    
    // Inactive: no orders in 90 days
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const usersWithOrders = new Set(Object.keys(userLastOrder).map(Number));
    const inactiveFromOrders = Object.entries(userLastOrder).filter(([_, date]) => date < ninetyDaysAgo).length;
    const neverOrdered = allUsers.filter(u => !usersWithOrders.has(u.id)).length;
    const inactiveCount = inactiveFromOrders + neverOrdered;
    
    // Average customer value
    const totalSpent = Object.values(userSpending).reduce((sum, val) => sum + val, 0);
    const avgCustomerValue = total > 0 ? Math.round(totalSpent / total) : 0;
    
    // Retention rate: users with more than 1 order
    const retainedUsers = Object.values(userOrderCount).filter(count => count > 1).length;
    const retentionRate = usersWithOrders.size > 0 ? Math.round((retainedUsers / usersWithOrders.size) * 100) : 0;
    
    // Reorder rate
    const reorderRate = retentionRate;
    
    // Satisfaction rate (placeholder - would need reviews system)
    const satisfactionRate = 92;
    
    // Conversion rate: users who ordered / total users
    const conversionRate = total > 0 ? Math.round((usersWithOrders.size / total) * 100) : 0;
    
    return {
      total,
      newThisMonth,
      vipCount,
      activeCount,
      inactiveCount,
      avgCustomerValue,
      retentionRate,
      reorderRate,
      satisfactionRate,
      conversionRate,
    };
  }

  async getCustomerDetails(userId: number): Promise<{
    user: User;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date | null;
    isVip: boolean;
    isActive: boolean;
  } | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    
    let lastOrderDate: Date | null = null;
    for (const order of userOrders) {
      const orderDate = new Date(order.createdAt!);
      if (!lastOrderDate || orderDate > lastOrderDate) {
        lastOrderDate = orderDate;
      }
    }
    
    const vipThreshold = 500000;
    const isVip = totalSpent >= vipThreshold;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isActive = lastOrderDate ? lastOrderDate >= thirtyDaysAgo : false;
    
    return { user, totalOrders, totalSpent, lastOrderDate, isVip, isActive };
  }

  async getTopCustomers(limit: number = 10): Promise<Array<{
    user: User;
    totalSpent: number;
    orderCount: number;
  }>> {
    const allUsers = await db.select().from(users);
    const allOrders = await db.select().from(orders);
    
    const userStats: Record<number, { totalSpent: number; orderCount: number }> = {};
    
    for (const order of allOrders) {
      if (!userStats[order.userId]) {
        userStats[order.userId] = { totalSpent: 0, orderCount: 0 };
      }
      userStats[order.userId].totalSpent += parseFloat(order.total);
      userStats[order.userId].orderCount++;
    }
    
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    
    return Object.entries(userStats)
      .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
      .slice(0, limit)
      .map(([userId, stats]) => ({
        user: userMap.get(Number(userId))!,
        totalSpent: stats.totalSpent,
        orderCount: stats.orderCount,
      }))
      .filter(item => item.user);
  }

  async getCustomerGrowthData(): Promise<Array<{ month: string; count: number }>> {
    const allUsers = await db.select().from(users);
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const monthCounts: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthCounts[key] = 0;
    }
    
    for (const user of allUsers) {
      const d = new Date(user.createdAt!);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in monthCounts) {
        monthCounts[key]++;
      }
    }
    
    return Object.entries(monthCounts).map(([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      return { month: monthNames[month], count };
    });
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

  // Notification Preferences
  async getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return prefs || undefined;
  }

  async createNotificationPreferences(prefs: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [created] = await db.insert(notificationPreferences).values(prefs).returning();
    return created;
  }

  async updateNotificationPreferences(userId: number, prefs: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences | undefined> {
    const [updated] = await db.update(notificationPreferences)
      .set({ ...prefs, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return updated || undefined;
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

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).orderBy(desc(drivers.createdAt));
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [newDriver] = await db.insert(drivers).values(driver).returning();
    return newDriver;
  }

  async updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    const [updated] = await db.update(drivers).set(driver).where(eq(drivers.id, id)).returning();
    return updated || undefined;
  }

  async deleteDriver(id: number): Promise<void> {
    await db.delete(drivers).where(eq(drivers.id, id));
  }

  async getDriversByWarehouse(warehouseId: number): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.warehouseId, warehouseId));
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(and(eq(drivers.status, 'available'), eq(drivers.isActive, true)));
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updated || undefined;
  }

  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async getVehiclesByWarehouse(warehouseId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.warehouseId, warehouseId));
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(and(eq(vehicles.status, 'available'), eq(vehicles.isActive, true)));
  }

  async assignVehicleToDriver(vehicleId: number, driverId: number): Promise<Vehicle | undefined> {
    const [updated] = await db.update(vehicles).set({ driverId, status: 'in_use' }).where(eq(vehicles.id, vehicleId)).returning();
    return updated || undefined;
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    return await db.select().from(banners).orderBy(banners.position);
  }

  async getActiveBanners(cityId?: number): Promise<Banner[]> {
    const now = new Date();
    return await db.select().from(banners).where(
      and(
        eq(banners.isActive, true),
        or(
          sql`${banners.startDate} IS NULL`,
          lte(banners.startDate, now)
        ),
        or(
          sql`${banners.endDate} IS NULL`,
          gte(banners.endDate, now)
        ),
        // Filter by city: show if targetCityId is null (all cities) or matches user's city
        cityId ? or(
          sql`${banners.targetCityId} IS NULL`,
          eq(banners.targetCityId, cityId)
        ) : sql`1=1`
      )
    ).orderBy(banners.position);
  }

  async getBanner(id: number): Promise<Banner | undefined> {
    const [banner] = await db.select().from(banners).where(eq(banners.id, id));
    return banner || undefined;
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [newBanner] = await db.insert(banners).values(banner).returning();
    return newBanner;
  }

  async updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const [updated] = await db.update(banners).set(banner).where(eq(banners.id, id)).returning();
    return updated || undefined;
  }

  async deleteBanner(id: number): Promise<void> {
    await db.delete(banners).where(eq(banners.id, id));
  }

  async duplicateBanner(id: number): Promise<Banner | undefined> {
    const banner = await this.getBanner(id);
    if (!banner) return undefined;
    
    const maxPosition = await db.select({ max: sql<number>`MAX(${banners.position})` }).from(banners);
    const newPosition = (maxPosition[0]?.max || 0) + 1;
    
    const [newBanner] = await db.insert(banners).values({
      title: `${banner.title} (نسخة)`,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      colorClass: banner.colorClass,
      position: newPosition,
      isActive: false,
      startDate: banner.startDate,
      endDate: banner.endDate,
      targetAudience: banner.targetAudience,
      viewCount: 0,
      clickCount: 0,
    }).returning();
    return newBanner;
  }

  async incrementBannerViews(id: number): Promise<void> {
    await db.update(banners)
      .set({ viewCount: sql`${banners.viewCount} + 1` })
      .where(eq(banners.id, id));
  }

  async incrementBannerClicks(id: number): Promise<void> {
    await db.update(banners)
      .set({ clickCount: sql`${banners.clickCount} + 1` })
      .where(eq(banners.id, id));
  }

  async incrementBannerPurchase(id: number, amount: number): Promise<void> {
    await db.update(banners)
      .set({ 
        purchaseCount: sql`${banners.purchaseCount} + 1`,
        purchaseTotal: sql`${banners.purchaseTotal} + ${amount}`
      })
      .where(eq(banners.id, id));
  }

  async reorderBanners(bannerIds: number[]): Promise<void> {
    for (let i = 0; i < bannerIds.length; i++) {
      await db.update(banners)
        .set({ position: i })
        .where(eq(banners.id, bannerIds[i]));
    }
  }

  async deleteBanners(ids: number[]): Promise<void> {
    for (const id of ids) {
      await db.delete(banners).where(eq(banners.id, id));
    }
  }

  async getBannerStats(): Promise<{ totalViews: number; totalClicks: number; avgCtr: number }> {
    // Get all banners and calculate stats manually to avoid SQL parsing issues
    const allBanners = await db.select().from(banners);
    
    let totalViews = 0;
    let totalClicks = 0;
    
    for (const banner of allBanners) {
      totalViews += banner.viewCount || 0;
      totalClicks += banner.clickCount || 0;
    }
    
    const avgCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    return { totalViews, totalClicks, avgCtr };
  }

  // Banner Views Tracking - تتبع مشاهدات الشرائح
  async trackBannerView(bannerId: number, userId?: number, ipAddress?: string, userAgent?: string): Promise<BannerView> {
    // Check if this user has already viewed this banner (only count unique views)
    let hasViewedBefore = false;
    
    if (userId) {
      // Check by userId if available
      const existingView = await db.select()
        .from(bannerViews)
        .where(and(
          eq(bannerViews.bannerId, bannerId),
          eq(bannerViews.userId, userId)
        ))
        .limit(1);
      hasViewedBefore = existingView.length > 0;
    } else if (ipAddress) {
      // Fallback to IP address for anonymous users
      const existingView = await db.select()
        .from(bannerViews)
        .where(and(
          eq(bannerViews.bannerId, bannerId),
          eq(bannerViews.ipAddress, ipAddress)
        ))
        .limit(1);
      hasViewedBefore = existingView.length > 0;
    }
    
    // Only increment view count for unique viewers
    if (!hasViewedBefore) {
      await this.incrementBannerViews(bannerId);
    }
    
    // Record individual view (for tracking purposes)
    const [view] = await db.insert(bannerViews).values({
      bannerId,
      userId: userId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      clicked: false,
    }).returning();
    
    return view;
  }

  async trackBannerClick(bannerId: number, userId?: number): Promise<void> {
    // Increment click count
    await this.incrementBannerClicks(bannerId);
    
    // Update the most recent view for this user/banner to mark as clicked
    if (userId) {
      await db.update(bannerViews)
        .set({ clicked: true, clickedAt: new Date() })
        .where(
          and(
            eq(bannerViews.bannerId, bannerId),
            eq(bannerViews.userId, userId),
            eq(bannerViews.clicked, false)
          )
        );
    }
  }

  async getBannerViewers(bannerId: number): Promise<(BannerView & { user?: User })[]> {
    const views = await db.select()
      .from(bannerViews)
      .leftJoin(users, eq(bannerViews.userId, users.id))
      .where(eq(bannerViews.bannerId, bannerId))
      .orderBy(desc(bannerViews.viewedAt));
    
    return views.map(v => ({
      ...v.banner_views,
      user: v.users || undefined
    }));
  }

  // Banner Products - منتجات الباقات
  async getBannerProducts(bannerId: number): Promise<(BannerProduct & { product: Product })[]> {
    const items = await db.select()
      .from(bannerProducts)
      .innerJoin(products, eq(bannerProducts.productId, products.id))
      .where(eq(bannerProducts.bannerId, bannerId));
    
    return items.map(item => ({
      ...item.banner_products,
      product: item.products
    }));
  }

  async addBannerProduct(bannerProduct: InsertBannerProduct): Promise<BannerProduct> {
    const [newItem] = await db.insert(bannerProducts).values(bannerProduct).returning();
    return newItem;
  }

  async updateBannerProduct(id: number, data: Partial<InsertBannerProduct>): Promise<BannerProduct | undefined> {
    const [updated] = await db.update(bannerProducts)
      .set(data)
      .where(eq(bannerProducts.id, id))
      .returning();
    return updated || undefined;
  }

  async removeBannerProduct(id: number): Promise<void> {
    await db.delete(bannerProducts).where(eq(bannerProducts.id, id));
  }

  async clearBannerProducts(bannerId: number): Promise<void> {
    await db.delete(bannerProducts).where(eq(bannerProducts.bannerId, bannerId));
  }

  // Product Profit Report - تقرير أرباح المنتجات
  async getProductProfitReport(): Promise<{
    summary: {
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      avgMargin: number;
      totalSoldQty: number;
      totalStockQty: number;
    };
    breakdown: Array<{
      productId: number;
      productName: string;
      productImage: string | null;
      categoryName: string | null;
      stockQty: number;
      soldQty: number;
      remainingQty: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
      salePrice: string;
      avgCostPrice: number;
    }>;
  }> {
    // Get all products with their categories
    const allProducts = await db.select({
      id: products.id,
      name: products.name,
      image: products.image,
      price: products.price,
      stock: products.stock,
      categoryId: products.categoryId,
    }).from(products);

    // Get categories for lookup
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    // Get all sale transactions from supplier_transactions
    const saleTransactions = await db.select({
      productId: supplierTransactions.productId,
      quantity: supplierTransactions.quantity,
      unitPrice: supplierTransactions.unitPrice,
      totalAmount: supplierTransactions.totalAmount,
    }).from(supplierTransactions)
      .where(eq(supplierTransactions.type, 'sale'));

    // Get all order items for revenue calculation (actual sale prices)
    const allOrderItems = await db.select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
    }).from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id));

    // Aggregate sales by product
    const productSales = new Map<number, { soldQty: number; revenue: number; cost: number }>();

    // Calculate revenue from order items (actual sale price)
    for (const item of allOrderItems) {
      const current = productSales.get(item.productId) || { soldQty: 0, revenue: 0, cost: 0 };
      current.soldQty += item.quantity;
      current.revenue += item.quantity * parseFloat(item.price);
      productSales.set(item.productId, current);
    }

    // Calculate cost from supplier sale transactions (supplier cost price)
    for (const tx of saleTransactions) {
      if (!tx.productId) continue;
      const current = productSales.get(tx.productId) || { soldQty: 0, revenue: 0, cost: 0 };
      current.cost += parseFloat(tx.totalAmount || '0');
      productSales.set(tx.productId, current);
    }

    // Get supplier stock positions for average cost
    const stockPositions = await db.select({
      productId: supplierStockPositions.productId,
      avgCost: supplierStockPositions.avgCost,
      quantity: supplierStockPositions.quantity,
    }).from(supplierStockPositions);

    // Map average cost by product (weighted average if multiple suppliers)
    const productAvgCost = new Map<number, { totalCost: number; totalQty: number }>();
    for (const pos of stockPositions) {
      const current = productAvgCost.get(pos.productId) || { totalCost: 0, totalQty: 0 };
      const avgCostNum = parseFloat(pos.avgCost || '0');
      current.totalCost += avgCostNum * pos.quantity;
      current.totalQty += pos.quantity;
      productAvgCost.set(pos.productId, current);
    }

    // Build breakdown
    const breakdown = allProducts.map(product => {
      const sales = productSales.get(product.id) || { soldQty: 0, revenue: 0, cost: 0 };
      const costData = productAvgCost.get(product.id);
      const avgCostPrice = costData && costData.totalQty > 0 
        ? costData.totalCost / costData.totalQty 
        : 0;
      
      const stockQty = product.stock || 0;
      const soldQty = sales.soldQty;
      const remainingQty = stockQty;
      const revenue = sales.revenue;
      const cost = sales.cost;
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        categoryName: product.categoryId ? categoryMap.get(product.categoryId) || null : null,
        stockQty,
        soldQty,
        remainingQty,
        revenue,
        cost,
        profit,
        margin,
        salePrice: product.price,
        avgCostPrice,
      };
    });

    // Calculate summary
    const totalRevenue = breakdown.reduce((sum, p) => sum + p.revenue, 0);
    const totalCost = breakdown.reduce((sum, p) => sum + p.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalSoldQty = breakdown.reduce((sum, p) => sum + p.soldQty, 0);
    const totalStockQty = breakdown.reduce((sum, p) => sum + p.stockQty, 0);

    return {
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        avgMargin,
        totalSoldQty,
        totalStockQty,
      },
      breakdown: breakdown.sort((a, b) => b.profit - a.profit), // Sort by profit descending
    };
  }

  // Expense Categories - فئات المصاريف
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories).orderBy(expenseCategories.name);
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category || undefined;
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [newCategory] = await db.insert(expenseCategories).values(category).returning();
    return newCategory;
  }

  async updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const [updated] = await db.update(expenseCategories).set(category).where(eq(expenseCategories.id, id)).returning();
    return updated || undefined;
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
  }

  // Expenses - المصاريف
  async getExpenses(filters?: { categoryId?: number; warehouseId?: number; startDate?: Date; endDate?: Date }): Promise<(Expense & { category: ExpenseCategory; warehouse?: { id: number; name: string } })[]> {
    const conditions = [];
    if (filters?.categoryId) conditions.push(eq(expenses.categoryId, filters.categoryId));
    if (filters?.warehouseId) conditions.push(eq(expenses.warehouseId, filters.warehouseId));
    if (filters?.startDate) conditions.push(gte(expenses.expenseDate, filters.startDate));
    if (filters?.endDate) conditions.push(lte(expenses.expenseDate, filters.endDate));

    const expensesList = conditions.length > 0
      ? await db.select().from(expenses).where(and(...conditions)).orderBy(desc(expenses.expenseDate))
      : await db.select().from(expenses).orderBy(desc(expenses.expenseDate));

    const result = [];
    for (const expense of expensesList) {
      const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, expense.categoryId));
      let warehouse: { id: number; name: string } | undefined;
      if (expense.warehouseId) {
        const [wh] = await db.select({ id: warehouses.id, name: warehouses.name }).from(warehouses).where(eq(warehouses.id, expense.warehouseId));
        warehouse = wh;
      }
      result.push({ ...expense, category, warehouse });
    }
    return result;
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db.update(expenses).set(expense).where(eq(expenses.id, id)).returning();
    return updated || undefined;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getExpenseSummary(filters?: { startDate?: Date; endDate?: Date; warehouseId?: number }): Promise<{
    totalExpenses: number;
    byCategory: { categoryId: number; categoryName: string; total: number; count: number }[];
    byMonth: { month: string; total: number }[];
  }> {
    const conditions = [];
    if (filters?.warehouseId) conditions.push(eq(expenses.warehouseId, filters.warehouseId));
    if (filters?.startDate) conditions.push(gte(expenses.expenseDate, filters.startDate));
    if (filters?.endDate) conditions.push(lte(expenses.expenseDate, filters.endDate));

    const expensesList = conditions.length > 0
      ? await db.select().from(expenses).where(and(...conditions))
      : await db.select().from(expenses);

    const allCategories = await db.select().from(expenseCategories);
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    // Calculate totals by category
    const byCategoryMap = new Map<number, { total: number; count: number }>();
    let totalExpenses = 0;

    for (const exp of expensesList) {
      const amount = parseFloat(exp.amount);
      totalExpenses += amount;
      
      const current = byCategoryMap.get(exp.categoryId) || { total: 0, count: 0 };
      current.total += amount;
      current.count += 1;
      byCategoryMap.set(exp.categoryId, current);
    }

    const byCategory = Array.from(byCategoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: categoryMap.get(categoryId) || 'غير محدد',
      total: data.total,
      count: data.count,
    }));

    // Calculate totals by month
    const byMonthMap = new Map<string, number>();
    for (const exp of expensesList) {
      const date = new Date(exp.expenseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonthMap.set(monthKey, (byMonthMap.get(monthKey) || 0) + parseFloat(exp.amount));
    }

    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { totalExpenses, byCategory, byMonth };
  }

  // Delivery Settings - إعدادات التوصيل
  async getDeliverySettings(): Promise<DeliverySetting[]> {
    return await db.select().from(deliverySettings).orderBy(desc(deliverySettings.createdAt));
  }

  async getDeliverySetting(id: number): Promise<DeliverySetting | undefined> {
    const [setting] = await db.select().from(deliverySettings).where(eq(deliverySettings.id, id));
    return setting || undefined;
  }

  async getDeliverySettingByWarehouse(warehouseId: number): Promise<DeliverySetting | undefined> {
    const [setting] = await db.select().from(deliverySettings).where(eq(deliverySettings.warehouseId, warehouseId));
    return setting || undefined;
  }

  async createDeliverySetting(setting: InsertDeliverySetting): Promise<DeliverySetting> {
    const [newSetting] = await db.insert(deliverySettings).values(setting).returning();
    return newSetting;
  }

  async updateDeliverySetting(id: number, setting: Partial<InsertDeliverySetting>): Promise<DeliverySetting | undefined> {
    const [updated] = await db.update(deliverySettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(deliverySettings.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDeliverySetting(id: number): Promise<void> {
    await db.delete(deliverySettings).where(eq(deliverySettings.id, id));
  }

  async resolveDeliveryFee(warehouseId: number, subtotal: number, quantity: number): Promise<{ fee: number; isFree: boolean; reason?: string }> {
    const setting = await this.getDeliverySettingByWarehouse(warehouseId);
    
    if (!setting || !setting.isEnabled) {
      return { fee: 0, isFree: true, reason: 'التوصيل مجاني' };
    }

    const baseFee = parseFloat(setting.baseFee);
    const freeThresholdAmount = setting.freeThresholdAmount ? parseFloat(setting.freeThresholdAmount) : null;
    const freeThresholdQuantity = setting.freeThresholdQuantity;

    // Check if free delivery threshold is met
    if (freeThresholdAmount !== null && subtotal >= freeThresholdAmount) {
      return { fee: 0, isFree: true, reason: `التوصيل مجاني للطلبات أكثر من ${freeThresholdAmount.toLocaleString('ar-SY')} ل.س` };
    }

    if (freeThresholdQuantity !== null && quantity >= freeThresholdQuantity) {
      return { fee: 0, isFree: true, reason: `التوصيل مجاني للطلبات أكثر من ${freeThresholdQuantity} قطعة` };
    }

    return { fee: baseFee, isFree: false };
  }

  // Customer Credits - نظام الآجل
  async getCustomerCredit(userId: number): Promise<CustomerCredit | undefined> {
    const [credit] = await db.select().from(customerCredits).where(eq(customerCredits.userId, userId));
    return credit || undefined;
  }

  async getAllCustomerCredits(): Promise<CustomerCredit[]> {
    return await db.select().from(customerCredits).orderBy(desc(customerCredits.currentBalance));
  }

  async createCustomerCredit(credit: InsertCustomerCredit): Promise<CustomerCredit> {
    const [newCredit] = await db.insert(customerCredits).values(credit).returning();
    return newCredit;
  }

  async updateCustomerCredit(userId: number, credit: Partial<InsertCustomerCredit>): Promise<CustomerCredit | undefined> {
    const [updated] = await db.update(customerCredits)
      .set({ ...credit, updatedAt: new Date() })
      .where(eq(customerCredits.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getOrCreateCustomerCredit(userId: number): Promise<CustomerCredit> {
    let credit = await this.getCustomerCredit(userId);
    if (!credit) {
      credit = await this.createCustomerCredit({
        userId,
        totalPurchases: "0",
        creditLimit: "500000", // 500,000 ل.س الحد الافتراضي
        currentBalance: "0",
        loyaltyLevel: "bronze",
        creditPeriodDays: 7,
        isEligible: true,
      });
    }
    return credit;
  }

  // حساب مستوى العميل وتحديث مدة الآجل
  async updateCustomerLoyaltyLevel(userId: number): Promise<CustomerCredit> {
    const credit = await this.getOrCreateCustomerCredit(userId);
    const totalPurchases = parseFloat(credit.totalPurchases);
    
    let loyaltyLevel = "bronze";
    let creditPeriodDays = 7;
    let creditLimit = 500000;
    
    if (totalPurchases >= 10000000) { // 10 مليون
      loyaltyLevel = "diamond";
      creditPeriodDays = 30;
      creditLimit = 5000000;
    } else if (totalPurchases >= 5000000) { // 5 مليون
      loyaltyLevel = "gold";
      creditPeriodDays = 21;
      creditLimit = 3000000;
    } else if (totalPurchases >= 1000000) { // 1 مليون
      loyaltyLevel = "silver";
      creditPeriodDays = 14;
      creditLimit = 1500000;
    }
    
    const updated = await this.updateCustomerCredit(userId, {
      loyaltyLevel,
      creditPeriodDays,
      creditLimit: creditLimit.toString(),
    });
    
    return updated || credit;
  }

  // Credit Transactions - معاملات الآجل
  async getCreditTransactions(userId: number): Promise<CreditTransaction[]> {
    return await db.select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  async getPendingCreditTransactions(userId: number): Promise<CreditTransaction[]> {
    return await db.select()
      .from(creditTransactions)
      .where(and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.status, "pending")
      ))
      .orderBy(creditTransactions.dueDate);
  }

  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db.insert(creditTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateCreditTransaction(id: number, transaction: Partial<InsertCreditTransaction>): Promise<CreditTransaction | undefined> {
    const [updated] = await db.update(creditTransactions)
      .set(transaction)
      .where(eq(creditTransactions.id, id))
      .returning();
    return updated || undefined;
  }

  // إنشاء عملية شراء بالآجل
  async createCreditPurchase(userId: number, orderId: number, amount: number): Promise<CreditTransaction> {
    const credit = await this.getOrCreateCustomerCredit(userId);
    const currentBalance = parseFloat(credit.currentBalance);
    const newBalance = currentBalance + amount;
    
    // حساب تاريخ الاستحقاق
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + credit.creditPeriodDays);
    
    // تحديث رصيد العميل
    await this.updateCustomerCredit(userId, {
      currentBalance: newBalance.toString(),
    });
    
    // إنشاء معاملة الآجل
    const transaction = await this.createCreditTransaction({
      userId,
      orderId,
      type: "purchase",
      amount: amount.toString(),
      balanceAfter: newBalance.toString(),
      dueDate,
      status: "pending",
    });
    
    return transaction;
  }

  // تسديد دين الآجل
  async createCreditPayment(userId: number, amount: number, notes?: string): Promise<CreditTransaction> {
    const credit = await this.getOrCreateCustomerCredit(userId);
    const currentBalance = parseFloat(credit.currentBalance);
    const newBalance = Math.max(0, currentBalance - amount);
    
    // تحديث رصيد العميل
    await this.updateCustomerCredit(userId, {
      currentBalance: newBalance.toString(),
      lastPaymentDate: new Date(),
    });
    
    // إنشاء معاملة السداد
    const transaction = await this.createCreditTransaction({
      userId,
      type: "payment",
      amount: amount.toString(),
      balanceAfter: newBalance.toString(),
      paidDate: new Date(),
      status: "paid",
      notes,
    });
    
    // تحديث المعاملات المعلقة
    const pendingTransactions = await this.getPendingCreditTransactions(userId);
    let remainingPayment = amount;
    
    for (const pending of pendingTransactions) {
      if (remainingPayment <= 0) break;
      
      const pendingAmount = parseFloat(pending.amount);
      if (remainingPayment >= pendingAmount) {
        await this.updateCreditTransaction(pending.id, {
          status: "paid",
          paidDate: new Date(),
        });
        remainingPayment -= pendingAmount;
      }
    }
    
    return transaction;
  }

  // التحقق من أهلية العميل للشراء بالآجل
  async checkCreditEligibility(userId: number, amount: number): Promise<{ eligible: boolean; reason: string; credit: CustomerCredit }> {
    const credit = await this.getOrCreateCustomerCredit(userId);
    
    if (!credit.isEligible) {
      return { eligible: false, reason: "حسابك غير مؤهل للشراء بالآجل", credit };
    }
    
    const currentBalance = parseFloat(credit.currentBalance);
    const creditLimit = parseFloat(credit.creditLimit);
    const availableCredit = creditLimit - currentBalance;
    
    if (amount > availableCredit) {
      return { 
        eligible: false, 
        reason: `تجاوزت الحد الأقصى للآجل. المتاح: ${availableCredit.toLocaleString('ar-SY')} ل.س`,
        credit 
      };
    }
    
    // التحقق من وجود ديون متأخرة
    const pendingTransactions = await this.getPendingCreditTransactions(userId);
    const now = new Date();
    const hasOverdue = pendingTransactions.some(t => t.dueDate && new Date(t.dueDate) < now);
    
    if (hasOverdue) {
      return { eligible: false, reason: "لديك ديون متأخرة السداد. يرجى السداد أولاً", credit };
    }
    
    return { eligible: true, reason: "مؤهل للشراء بالآجل", credit };
  }
  // الحصول على جميع الديون المعلقة مرتبة حسب تاريخ الاستحقاق (الأقرب أولاً)
  async getAllPendingCreditsWithUsers(): Promise<Array<{
    transaction: CreditTransaction;
    user: User;
    credit: CustomerCredit;
  }>> {
    const pendingTransactions = await db.select()
      .from(creditTransactions)
      .where(eq(creditTransactions.status, "pending"))
      .orderBy(asc(creditTransactions.dueDate));
    
    const result = [];
    for (const transaction of pendingTransactions) {
      const [user] = await db.select().from(users).where(eq(users.id, transaction.userId));
      const credit = await this.getCustomerCredit(transaction.userId);
      if (user && credit) {
        result.push({ transaction, user, credit });
      }
    }
    return result;
  }

  // الحصول على أقرب موعد سداد للعميل (الأقرب أولاً)
  async getNextDueCredit(userId: number): Promise<CreditTransaction | null> {
    const [transaction] = await db.select()
      .from(creditTransactions)
      .where(and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.status, "pending")
      ))
      .orderBy(asc(creditTransactions.dueDate))
      .limit(1);
    return transaction || null;
  }

  // Site Settings - إعدادات الموقع
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(siteSettings.key);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async upsertSiteSetting(data: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(data.key);
    if (existing) {
      const [updated] = await db.update(siteSettings)
        .set({ value: data.value, label: data.label, updatedAt: new Date() })
        .where(eq(siteSettings.key, data.key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteSettings).values(data).returning();
      return created;
    }
  }

  async deleteSiteSetting(key: string): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }

  // OTP Verification - رموز التحقق
  async createOtp(phone: string, code: string, expiresAt: Date): Promise<OtpVerification> {
    await db.delete(otpVerifications).where(
      and(eq(otpVerifications.phone, phone), eq(otpVerifications.isUsed, false))
    );
    
    const [otp] = await db.insert(otpVerifications).values({
      phone,
      code,
      expiresAt,
      isUsed: false,
      attempts: 0,
    }).returning();
    return otp;
  }

  async getValidOtp(phone: string, code: string): Promise<OtpVerification | undefined> {
    const [otp] = await db.select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.code, code),
        eq(otpVerifications.isUsed, false),
        gte(otpVerifications.expiresAt, new Date())
      ));
    return otp || undefined;
  }

  async markOtpUsedWithToken(id: number, token: string): Promise<void> {
    await db.update(otpVerifications)
      .set({ isUsed: true, verificationToken: token })
      .where(eq(otpVerifications.id, id));
  }

  async incrementOtpAttempts(id: number): Promise<void> {
    await db.update(otpVerifications)
      .set({ attempts: sql`${otpVerifications.attempts} + 1` })
      .where(eq(otpVerifications.id, id));
  }

  async deleteExpiredOtps(): Promise<void> {
    await db.delete(otpVerifications)
      .where(lte(otpVerifications.expiresAt, new Date()));
  }

  async getOtpByPhone(phone: string): Promise<OtpVerification | undefined> {
    const [otp] = await db.select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.isUsed, false),
        gte(otpVerifications.expiresAt, new Date())
      ))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);
    return otp || undefined;
  }

  async isPhoneVerified(phone: string): Promise<boolean> {
    const [otp] = await db.select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.isUsed, true)
      ))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);
    
    if (!otp) return false;
    
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return otp.createdAt >= thirtyMinutesAgo;
  }

  async getRecentOtpCount(phone: string, minutes: number): Promise<number> {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        gte(otpVerifications.createdAt, timeAgo)
      ));
    return result[0]?.count || 0;
  }

  async validateVerificationToken(phone: string, token: string): Promise<boolean> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const [otp] = await db.select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.verificationToken, token),
        eq(otpVerifications.isUsed, true),
        gte(otpVerifications.createdAt, thirtyMinutesAgo)
      ))
      .limit(1);
    return !!otp;
  }

  async invalidateVerificationToken(phone: string, token: string): Promise<void> {
    await db.update(otpVerifications)
      .set({ verificationToken: null })
      .where(and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.verificationToken, token)
      ));
  }

  // Login Attempts - محاولات تسجيل الدخول
  async getLoginAttempts(phone: string): Promise<{ attempts: number; lockedUntil: Date | null }> {
    const [record] = await db.select()
      .from(loginAttempts)
      .where(eq(loginAttempts.phone, phone));
    
    if (!record) {
      return { attempts: 0, lockedUntil: null };
    }
    return { attempts: record.attempts, lockedUntil: record.lockedUntil };
  }

  async incrementLoginAttempts(phone: string): Promise<{ attempts: number; isLocked: boolean }> {
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MINUTES = 30; // مدة القفل 30 دقيقة
    
    const [existing] = await db.select()
      .from(loginAttempts)
      .where(eq(loginAttempts.phone, phone));
    
    if (existing) {
      // Check if lock has expired
      if (existing.lockedUntil && new Date() > existing.lockedUntil) {
        // Reset attempts after lock expires
        await db.update(loginAttempts)
          .set({ attempts: 1, lockedUntil: null, lastAttempt: new Date() })
          .where(eq(loginAttempts.phone, phone));
        return { attempts: 1, isLocked: false };
      }
      
      const newAttempts = existing.attempts + 1;
      const isLocked = newAttempts >= MAX_ATTEMPTS;
      const lockedUntil = isLocked ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000) : existing.lockedUntil;
      
      await db.update(loginAttempts)
        .set({ 
          attempts: newAttempts, 
          lockedUntil,
          lastAttempt: new Date() 
        })
        .where(eq(loginAttempts.phone, phone));
      
      return { attempts: newAttempts, isLocked };
    } else {
      // First attempt
      await db.insert(loginAttempts).values({
        phone,
        attempts: 1,
        lastAttempt: new Date()
      });
      return { attempts: 1, isLocked: false };
    }
  }

  async resetLoginAttempts(phone: string): Promise<void> {
    await db.delete(loginAttempts).where(eq(loginAttempts.phone, phone));
  }

  async isAccountLocked(phone: string): Promise<boolean> {
    const [record] = await db.select()
      .from(loginAttempts)
      .where(eq(loginAttempts.phone, phone));
    
    if (!record || !record.lockedUntil) {
      return false;
    }
    
    // Check if lock has expired
    if (new Date() > record.lockedUntil) {
      return false;
    }
    
    return record.attempts >= 5;
  }

  // ERP Settings - إعدادات نظام ERP الخارجي
  async getErpSettings(): Promise<ErpSetting[]> {
    return await db.select().from(erpSettings).orderBy(desc(erpSettings.createdAt));
  }

  async getErpSetting(id: number): Promise<ErpSetting | undefined> {
    const [setting] = await db.select().from(erpSettings).where(eq(erpSettings.id, id));
    return setting || undefined;
  }

  async getErpSettingByWarehouse(warehouseId: number): Promise<ErpSetting | undefined> {
    const [setting] = await db.select().from(erpSettings).where(eq(erpSettings.warehouseId, warehouseId));
    return setting || undefined;
  }

  async createErpSetting(data: InsertErpSetting): Promise<ErpSetting> {
    const [setting] = await db.insert(erpSettings).values(data).returning();
    return setting;
  }

  async updateErpSetting(id: number, data: Partial<InsertErpSetting>): Promise<ErpSetting | undefined> {
    const [setting] = await db.update(erpSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(erpSettings.id, id))
      .returning();
    return setting || undefined;
  }

  async deleteErpSetting(id: number): Promise<void> {
    await db.delete(erpSettings).where(eq(erpSettings.id, id));
  }

  async updateErpSettingSync(id: number, status: string, error?: string): Promise<void> {
    await db.update(erpSettings)
      .set({ 
        lastSyncAt: new Date(),
        lastSyncStatus: status,
        lastSyncError: error || null,
        updatedAt: new Date()
      })
      .where(eq(erpSettings.id, id));
  }

  // ERP Products - منتجات ERP المخزنة
  async getErpProducts(warehouseId: number): Promise<ErpProduct[]> {
    return await db.select().from(erpProducts)
      .where(eq(erpProducts.warehouseId, warehouseId))
      .orderBy(erpProducts.name);
  }

  async getErpProduct(id: number): Promise<ErpProduct | undefined> {
    const [product] = await db.select().from(erpProducts).where(eq(erpProducts.id, id));
    return product || undefined;
  }

  async createErpProduct(data: InsertErpProduct): Promise<ErpProduct> {
    const [product] = await db.insert(erpProducts).values({
      ...data,
      lastUpdatedAt: new Date(),
    }).returning();
    return product;
  }

  async deleteErpProductsByWarehouse(warehouseId: number): Promise<void> {
    await db.delete(erpProducts).where(eq(erpProducts.warehouseId, warehouseId));
  }
}

export const storage = new DatabaseStorage();
