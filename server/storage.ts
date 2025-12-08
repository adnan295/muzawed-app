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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
  searchProducts(query: string): Promise<Product[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id'>): Promise<Category>;

  // Brands
  getBrands(): Promise<Brand[]>;
  createBrand(brand: Omit<Brand, 'id'>): Promise<Brand>;

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

  // Brands
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async createBrand(brand: Omit<Brand, 'id'>): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
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
}

export const storage = new DatabaseStorage();
