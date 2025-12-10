import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCartItemSchema, insertOrderSchema, insertAddressSchema, 
  insertPaymentCardSchema, insertWalletTransactionSchema, insertPromotionSchema,
  insertSupplierSchema, insertReturnSchema, insertShipmentSchema, insertCustomerSegmentSchema,
  insertReportSchema, insertStaffSchema, insertSupportTicketSchema, insertCouponSchema,
  insertWarehouseSchema, insertNotificationSchema, insertActivityLogSchema,
  insertCitySchema, insertProductInventorySchema, insertDriverSchema, insertBannerSchema
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";
import multer from "multer";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create default admin if no staff exists
  try {
    const existingStaff = await storage.getStaff();
    if (existingStaff.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await storage.createStaff({
        name: 'مدير النظام',
        email: 'admin@sary.sy',
        phone: '+963900000000',
        password: hashedPassword,
        role: 'admin',
        department: 'الإدارة',
        permissions: ['orders', 'products', 'customers', 'reports', 'settings', 'staff', 'warehouses'],
        status: 'active',
        avatar: null,
      });
      console.log('✅ Default admin account initialized');
    }
  } catch (error) {
    // Silently fail - staff may already exist
  }

  // ==================== Auth Routes ====================
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { password, ...otherData } = req.body;
      
      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      
      const validData = insertUserSchema.parse({
        ...otherData,
        password: hashedPassword,
      });
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(validData.phone);
      if (existingUser) {
        return res.status(400).json({ error: "رقم الجوال مسجل بالفعل" });
      }

      const user = await storage.createUser(validData);
      
      // Create wallet for new user
      await storage.createWallet({ userId: user.id, balance: "0" });
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Check if phone exists
  app.post("/api/auth/check-phone", async (req, res) => {
    try {
      const { phone } = req.body;
      
      const user = await storage.getUserByPhone(phone);
      res.json({ exists: !!user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Verify password
      if (!user.password) {
        return res.status(401).json({ error: "كلمة السر غير مسجلة، يرجى إعادة التسجيل" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "كلمة السر غير صحيحة" });
      }

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Staff/Admin authentication
  app.post("/api/auth/staff/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }

      const staffMember = await storage.getStaffByEmail(email);
      if (!staffMember) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Check password with bcrypt
      const passwordMatch = await bcrypt.compare(password, staffMember.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Check if staff is active
      if (staffMember.status !== 'active') {
        return res.status(403).json({ error: "حسابك غير نشط، يرجى التواصل مع المدير" });
      }

      // Return staff info without password
      const { password: _, ...staffData } = staffMember;
      res.json({ staff: staffData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify staff session
  app.get("/api/auth/staff/verify/:id", async (req, res) => {
    try {
      const staffMember = await storage.getStaffMember(parseInt(req.params.id));
      if (!staffMember || staffMember.status !== 'active') {
        return res.status(401).json({ error: "جلسة غير صالحة" });
      }
      const { password: _, ...staffData } = staffMember;
      res.json({ staff: staffData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Object Storage Routes ====================
  
  const objectStorageService = new ObjectStorageService();

  // Serve public objects (product images, etc.)
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "الملف غير موجود" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  // Serve private objects (uploaded files)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for image uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm upload and get object path
  app.put("/api/objects/confirm", async (req, res) => {
    if (!req.body.uploadURL) {
      return res.status(400).json({ error: "uploadURL is required" });
    }

    try {
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.uploadURL,
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error confirming upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upload and compress image
  app.post("/api/objects/upload-compressed", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "يجب تحميل صورة" });
      }

      const maxWidth = req.body.maxWidth ? parseInt(req.body.maxWidth) : 1920;
      const quality = req.body.quality ? parseInt(req.body.quality) : 80;

      const result = await objectStorageService.uploadCompressedImage(
        req.file.buffer,
        req.file.mimetype,
        { maxWidth, quality }
      );

      const compressionRatio = ((1 - result.compressedSize / result.originalSize) * 100).toFixed(1);

      res.json({
        objectPath: result.objectPath,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: `${compressionRatio}%`,
      });
    } catch (error: any) {
      console.error("Error uploading compressed image:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Products Routes ====================
  
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const products = await storage.getProducts(categoryId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const withInventory = req.query.withInventory === 'true';
      if (withInventory) {
        const result = await storage.getProductWithInventory(parseInt(req.params.id));
        if (!result) {
          return res.status(404).json({ error: "المنتج غير موجود" });
        }
        res.json(result);
      } else {
        const product = await storage.getProduct(parseInt(req.params.id));
        if (!product) {
          return res.status(404).json({ error: "المنتج غير موجود" });
        }
        res.json(product);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { inventory, ...productData } = req.body;
      if (inventory && Array.isArray(inventory) && inventory.length > 0) {
        const product = await storage.createProductWithInventory(productData, inventory);
        res.status(201).json(product);
      } else {
        const product = await storage.createProduct(productData);
        res.status(201).json(product);
      }
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { inventory, ...productData } = req.body;
      if (inventory && Array.isArray(inventory)) {
        const product = await storage.updateProductWithInventory(parseInt(req.params.id), productData, inventory);
        if (!product) {
          return res.status(404).json({ error: "المنتج غير موجود" });
        }
        res.json(product);
      } else {
        const product = await storage.updateProduct(parseInt(req.params.id), productData);
        if (!product) {
          return res.status(404).json({ error: "المنتج غير موجود" });
        }
        res.json(product);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export products to CSV
  app.get("/api/products/export/csv", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const categories = await storage.getCategories();
      const brands = await storage.getBrands();
      
      // Create CSV content with Arabic headers
      const headers = ['المعرف', 'الاسم', 'القسم', 'العلامة التجارية', 'السعر', 'السعر الأصلي', 'الحد الأدنى', 'الوحدة', 'المخزون', 'رابط الصورة'];
      const rows = products.map(p => {
        const category = categories.find(c => c.id === p.categoryId);
        const brand = brands.find(b => b.id === p.brandId);
        return [
          p.id,
          p.name,
          category?.name || '',
          brand?.name || '',
          p.price,
          p.originalPrice || '',
          p.minOrder,
          p.unit,
          p.stock,
          p.image
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
      });
      
      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // BOM for Arabic support
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=products_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import products from CSV
  app.post("/api/products/import/csv", async (req, res) => {
    try {
      const { products: importData } = req.body;
      
      if (!Array.isArray(importData) || importData.length === 0) {
        return res.status(400).json({ error: 'لا توجد بيانات للاستيراد' });
      }
      
      const results = { success: 0, errors: [] as string[] };
      
      for (const item of importData) {
        try {
          await storage.createProduct({
            name: item.name,
            categoryId: parseInt(item.categoryId),
            brandId: item.brandId ? parseInt(item.brandId) : null,
            price: item.price,
            originalPrice: item.originalPrice || null,
            minOrder: parseInt(item.minOrder) || 1,
            unit: item.unit || 'كرتون',
            stock: parseInt(item.stock) || 0,
            image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          });
          results.success++;
        } catch (err: any) {
          results.errors.push(`خطأ في المنتج "${item.name}": ${err.message}`);
        }
      }
      
      res.json({ 
        message: `تم استيراد ${results.success} منتج بنجاح`,
        success: results.success,
        errors: results.errors 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Categories Routes ====================
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Brands Routes ====================
  
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const brand = await storage.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/brands/:id", async (req, res) => {
    try {
      await storage.deleteBrand(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Favorites Routes ====================

  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favoriteItems = await storage.getFavorites(parseInt(req.params.userId));
      
      // Get product details for each favorite
      const favoritesWithProducts = await Promise.all(
        favoriteItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(favoritesWithProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, productId } = req.body;
      const favorite = await storage.addFavorite({ userId, productId });
      res.json(favorite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/favorites/:userId/:productId", async (req, res) => {
    try {
      await storage.removeFavorite(parseInt(req.params.userId), parseInt(req.params.productId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/favorites/:userId/:productId/check", async (req, res) => {
    try {
      const isFavorite = await storage.isFavorite(parseInt(req.params.userId), parseInt(req.params.productId));
      res.json({ isFavorite });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Cart Routes ====================
  
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const cartItems = await storage.getCart(parseInt(req.params.userId));
      
      // Get product details for each cart item
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(itemsWithProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validData = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(validData);
      res.json(item);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(parseInt(req.params.id), quantity);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/user/:userId", async (req, res) => {
    try {
      await storage.clearCart(parseInt(req.params.userId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Orders Routes ====================
  
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrders(parseInt(req.params.userId));
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/detail/:orderId", async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.orderId));
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }
      
      const items = await storage.getOrderItems(order.id);
      const address = await storage.getAddress(order.addressId);
      
      res.json({ ...order, items, address });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      const validOrder = insertOrderSchema.parse(order);
      
      // Handle wallet payment atomically with database transaction
      if (validOrder.paymentMethod === 'wallet') {
        try {
          const newOrder = await storage.createOrderWithWalletPayment(validOrder, items);
          return res.json(newOrder);
        } catch (error: any) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      const newOrder = await storage.createOrder(validOrder, items);
      
      // If payment method is credit, create credit transaction with due date
      if (validOrder.paymentMethod === 'credit') {
        const orderTotal = parseFloat(newOrder.total);
        await storage.createCreditPurchase(validOrder.userId, newOrder.id, orderTotal);
      }
      
      // Clear cart after order
      await storage.clearCart(validOrder.userId);
      
      res.json(newOrder);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(parseInt(req.params.id), status);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Addresses Routes ====================
  
  app.get("/api/addresses/:userId", async (req, res) => {
    try {
      const addresses = await storage.getAddresses(parseInt(req.params.userId));
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const validData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(validData);
      res.json(address);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const address = await storage.updateAddress(parseInt(req.params.id), req.body);
      res.json(address);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      await storage.deleteAddress(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses/:userId/default/:addressId", async (req, res) => {
    try {
      await storage.setDefaultAddress(parseInt(req.params.userId), parseInt(req.params.addressId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Payment Cards Routes ====================
  
  app.get("/api/cards/:userId", async (req, res) => {
    try {
      const cards = await storage.getPaymentCards(parseInt(req.params.userId));
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cards", async (req, res) => {
    try {
      const validData = insertPaymentCardSchema.parse(req.body);
      const card = await storage.createPaymentCard(validData);
      res.json(card);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cards/:id", async (req, res) => {
    try {
      await storage.deletePaymentCard(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Wallet Routes ====================
  
  app.get("/api/wallet/:userId", async (req, res) => {
    try {
      let wallet = await storage.getWallet(parseInt(req.params.userId));
      
      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet({
          userId: parseInt(req.params.userId),
          balance: "0"
        });
      }
      
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wallet/:userId/transactions", async (req, res) => {
    try {
      const wallet = await storage.getWallet(parseInt(req.params.userId));
      if (!wallet) {
        return res.json([]);
      }
      
      const transactions = await storage.getWalletTransactions(wallet.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wallet/transaction", async (req, res) => {
    try {
      const validData = insertWalletTransactionSchema.parse(req.body);
      const transaction = await storage.createWalletTransaction(validData);
      
      // Update wallet balance
      const wallet = await storage.getWallet(transaction.walletId);
      if (wallet) {
        let newBalance = parseFloat(wallet.balance);
        const amount = parseFloat(validData.amount);
        
        if (validData.type === "deposit" || validData.type === "refund") {
          newBalance += amount;
        } else if (validData.type === "payment") {
          newBalance -= amount;
        }
        
        await storage.updateWalletBalance(wallet.userId, newBalance.toFixed(2));
      }
      
      res.json(transaction);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Wallet Deposit Requests ====================

  app.post("/api/wallet/deposit-request", async (req, res) => {
    try {
      const { userId, amount, proofImage, referenceCode } = req.body;
      if (!userId || !amount) {
        return res.status(400).json({ error: "userId و amount مطلوبين" });
      }
      
      // Get wallet for user
      const wallet = await storage.getWallet(parseInt(userId));
      if (!wallet) {
        return res.status(400).json({ error: "لم يتم العثور على المحفظة" });
      }
      
      const request = await storage.createWalletDepositRequest({
        userId: parseInt(userId),
        walletId: wallet.id,
        amount: amount.toString(),
        proofImage: proofImage || null,
        referenceCode: referenceCode || null,
        status: 'pending'
      });
      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wallet/deposit-requests/:userId", async (req, res) => {
    try {
      const requests = await storage.getWalletDepositRequests(parseInt(req.params.userId));
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/deposit-requests", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.getAllWalletDepositRequests(status);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/deposit-requests/:id/approve", async (req, res) => {
    try {
      const { reviewedBy, notes } = req.body;
      const request = await storage.approveWalletDepositRequest(
        parseInt(req.params.id),
        reviewedBy,
        notes
      );
      if (!request) {
        return res.status(404).json({ error: "الطلب غير موجود أو تمت معالجته مسبقاً" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/deposit-requests/:id/reject", async (req, res) => {
    try {
      const { reviewedBy, notes } = req.body;
      const request = await storage.rejectWalletDepositRequest(
        parseInt(req.params.id),
        reviewedBy,
        notes
      );
      if (!request) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Promotions Routes ====================
  
  app.get("/api/promotions", async (req, res) => {
    try {
      const promos = await storage.getPromotions();
      res.json(promos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/promotions/:id", async (req, res) => {
    try {
      const promo = await storage.getPromotion(parseInt(req.params.id));
      if (!promo) return res.status(404).json({ error: "العرض غير موجود" });
      res.json(promo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const validData = insertPromotionSchema.parse(req.body);
      const promo = await storage.createPromotion(validData);
      res.status(201).json(promo);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/promotions/:id", async (req, res) => {
    try {
      const promo = await storage.updatePromotion(parseInt(req.params.id), req.body);
      if (!promo) return res.status(404).json({ error: "العرض غير موجود" });
      res.json(promo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/promotions/:id", async (req, res) => {
    try {
      await storage.deletePromotion(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Suppliers Routes ====================
  
  app.get("/api/suppliers", async (req, res) => {
    try {
      const supplierList = await storage.getSuppliers();
      res.json(supplierList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) return res.status(404).json({ error: "المورد غير موجود" });
      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validData);
      res.status(201).json(supplier);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(parseInt(req.params.id), req.body);
      if (!supplier) return res.status(404).json({ error: "المورد غير موجود" });
      res.json(supplier);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Supplier Dashboard (detailed view with balance & transactions)
  app.get("/api/suppliers/:id/dashboard", async (req, res) => {
    try {
      const dashboard = await storage.getSupplierDashboard(parseInt(req.params.id));
      res.json(dashboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Supplier Transactions
  app.get("/api/suppliers/:id/transactions", async (req, res) => {
    try {
      const transactions = await storage.getSupplierTransactions(parseInt(req.params.id));
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record Supplier Import (goods received from supplier)
  app.post("/api/suppliers/:id/import", async (req, res) => {
    try {
      const { warehouseId, productId, quantity, unitPrice, notes } = req.body;
      if (!warehouseId || !productId || !quantity || !unitPrice) {
        return res.status(400).json({ error: "يرجى تعبئة جميع الحقول المطلوبة" });
      }
      const transaction = await storage.recordSupplierImport({
        supplierId: parseInt(req.params.id),
        warehouseId,
        productId,
        quantity: parseInt(quantity),
        unitPrice: String(unitPrice),
        notes,
      });
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record Supplier Export (goods returned to supplier)
  app.post("/api/suppliers/:id/export", async (req, res) => {
    try {
      const { warehouseId, productId, quantity, unitPrice, notes } = req.body;
      if (!warehouseId || !productId || !quantity || !unitPrice) {
        return res.status(400).json({ error: "يرجى تعبئة جميع الحقول المطلوبة" });
      }
      const transaction = await storage.recordSupplierExport({
        supplierId: parseInt(req.params.id),
        warehouseId,
        productId,
        quantity: parseInt(quantity),
        unitPrice: String(unitPrice),
        notes,
      });
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record Supplier Payment
  app.post("/api/suppliers/:id/payment", async (req, res) => {
    try {
      const { amount, paymentMethod, referenceNumber, notes } = req.body;
      if (!amount || !paymentMethod) {
        return res.status(400).json({ error: "يرجى تعبئة المبلغ وطريقة الدفع" });
      }
      const transaction = await storage.recordSupplierPayment({
        supplierId: parseInt(req.params.id),
        amount: String(amount),
        paymentMethod,
        referenceNumber,
        notes,
      });
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Supplier Stock Positions
  app.get("/api/suppliers/:id/stock", async (req, res) => {
    try {
      const stockPositions = await storage.getSupplierStockPositions(parseInt(req.params.id));
      res.json(stockPositions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Supplier Balance
  app.get("/api/suppliers/:id/balance", async (req, res) => {
    try {
      const balance = await storage.getSupplierBalance(parseInt(req.params.id));
      res.json(balance || { balance: "0", totalImports: "0", totalExports: "0", totalPayments: "0", totalStockValue: "0" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Recalculate Supplier Balance
  app.post("/api/suppliers/:id/recalculate", async (req, res) => {
    try {
      const balance = await storage.recalculateSupplierBalance(parseInt(req.params.id));
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Returns Routes ====================
  
  app.get("/api/returns", async (req, res) => {
    try {
      const returnList = await storage.getReturns();
      res.json(returnList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/returns/:id", async (req, res) => {
    try {
      const ret = await storage.getReturn(parseInt(req.params.id));
      if (!ret) return res.status(404).json({ error: "طلب الاسترجاع غير موجود" });
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/returns", async (req, res) => {
    try {
      const validData = insertReturnSchema.parse(req.body);
      const ret = await storage.createReturn(validData);
      res.status(201).json(ret);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/returns/:id", async (req, res) => {
    try {
      const ret = await storage.updateReturn(parseInt(req.params.id), req.body);
      if (!ret) return res.status(404).json({ error: "طلب الاسترجاع غير موجود" });
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/returns/stats", async (req, res) => {
    try {
      const allReturns = await storage.getReturns();
      const stats = {
        total: allReturns.length,
        pending: allReturns.filter(r => r.status === 'pending').length,
        approved: allReturns.filter(r => r.status === 'approved').length,
        rejected: allReturns.filter(r => r.status === 'rejected').length,
        refunded: allReturns.filter(r => r.status === 'refunded').length,
        totalRefundAmount: allReturns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + parseFloat(r.refundAmount || '0'), 0),
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/returns/:id/approve", async (req, res) => {
    try {
      const { refundMethod, notes } = req.body;
      const ret = await storage.updateReturn(parseInt(req.params.id), {
        status: 'approved',
        refundMethod,
        notes,
        processedAt: new Date(),
      });
      if (!ret) return res.status(404).json({ error: "طلب الاسترجاع غير موجود" });
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/returns/:id/reject", async (req, res) => {
    try {
      const { notes } = req.body;
      const ret = await storage.updateReturn(parseInt(req.params.id), {
        status: 'rejected',
        notes,
        processedAt: new Date(),
      });
      if (!ret) return res.status(404).json({ error: "طلب الاسترجاع غير موجود" });
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/returns/:id/refund", async (req, res) => {
    try {
      const ret = await storage.updateReturn(parseInt(req.params.id), {
        status: 'refunded',
        processedAt: new Date(),
      });
      if (!ret) return res.status(404).json({ error: "طلب الاسترجاع غير موجود" });
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/returns/:id", async (req, res) => {
    try {
      await storage.deleteReturn(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Shipments Routes ====================
  
  app.get("/api/shipments", async (req, res) => {
    try {
      const shipmentList = await storage.getShipments();
      res.json(shipmentList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/shipments/:id", async (req, res) => {
    try {
      const shipment = await storage.getShipment(parseInt(req.params.id));
      if (!shipment) return res.status(404).json({ error: "الشحنة غير موجودة" });
      res.json(shipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/shipments/order/:orderId", async (req, res) => {
    try {
      const shipment = await storage.getShipmentByOrder(parseInt(req.params.orderId));
      res.json(shipment || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const validData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validData);
      res.status(201).json(shipment);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/shipments/:id", async (req, res) => {
    try {
      const shipment = await storage.updateShipment(parseInt(req.params.id), req.body);
      if (!shipment) return res.status(404).json({ error: "الشحنة غير موجودة" });
      res.json(shipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Customer Segments Routes ====================
  
  app.get("/api/segments", async (req, res) => {
    try {
      const segments = await storage.getCustomerSegments();
      res.json(segments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/segments", async (req, res) => {
    try {
      const validData = insertCustomerSegmentSchema.parse(req.body);
      const segment = await storage.createCustomerSegment(validData);
      res.status(201).json(segment);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/segments/:id", async (req, res) => {
    try {
      const segment = await storage.updateCustomerSegment(parseInt(req.params.id), req.body);
      if (!segment) return res.status(404).json({ error: "الشريحة غير موجودة" });
      res.json(segment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/segments/:id", async (req, res) => {
    try {
      const segment = await storage.getCustomerSegment(parseInt(req.params.id));
      if (!segment) return res.status(404).json({ error: "الشريحة غير موجودة" });
      await storage.deleteCustomerSegment(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/segments/recalculate", async (req, res) => {
    try {
      await storage.recalculateSegmentCounts();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Reports Routes ====================
  
  app.get("/api/reports", async (req, res) => {
    try {
      const reportList = await storage.getReports();
      res.json(reportList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const validData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validData);
      res.status(201).json(report);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  // Product Profit Report - تقرير أرباح المنتجات
  app.get("/api/reports/product-profit", async (req, res) => {
    try {
      const report = await storage.getProductProfitReport();
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Staff Routes ====================
  
  app.get("/api/staff", async (req, res) => {
    try {
      const staffList = await storage.getStaff();
      res.json(staffList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const member = await storage.getStaffMember(parseInt(req.params.id));
      if (!member) return res.status(404).json({ error: "الموظف غير موجود" });
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const validData = insertStaffSchema.parse(req.body);
      const member = await storage.createStaff(validData);
      res.status(201).json(member);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const member = await storage.updateStaff(parseInt(req.params.id), req.body);
      if (!member) return res.status(404).json({ error: "الموظف غير موجود" });
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      await storage.deleteStaff(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Support Tickets Routes ====================
  
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(parseInt(req.params.id));
      if (!ticket) return res.status(404).json({ error: "التذكرة غير موجودة" });
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const validData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validData);
      res.status(201).json(ticket);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateSupportTicket(parseInt(req.params.id), req.body);
      if (!ticket) return res.status(404).json({ error: "التذكرة غير موجودة" });
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tickets/user/:userId", async (req, res) => {
    try {
      const tickets = await storage.getSupportTicketsByUser(parseInt(req.params.userId));
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Referrals Routes ====================

  app.get("/api/referrals/user/:userId", async (req, res) => {
    try {
      const userReferrals = await storage.getReferralsByUser(parseInt(req.params.userId));
      res.json(userReferrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/referrals/stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserReferralStats(parseInt(req.params.userId));
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/referrals/code/:code", async (req, res) => {
    try {
      const referral = await storage.getReferralByCode(req.params.code);
      if (!referral) return res.status(404).json({ error: "كود الإحالة غير موجود" });
      res.json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/referrals", async (req, res) => {
    try {
      const referral = await storage.createReferral(req.body);
      res.status(201).json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/referrals/:id", async (req, res) => {
    try {
      const referral = await storage.updateReferral(parseInt(req.params.id), req.body);
      if (!referral) return res.status(404).json({ error: "الإحالة غير موجودة" });
      res.json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Coupons Routes ====================
  
  app.get("/api/coupons", async (req, res) => {
    try {
      const couponList = await storage.getCoupons();
      res.json(couponList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/coupons/:id", async (req, res) => {
    try {
      const coupon = await storage.getCoupon(parseInt(req.params.id));
      if (!coupon) return res.status(404).json({ error: "الكوبون غير موجود" });
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/coupons/code/:code", async (req, res) => {
    try {
      const coupon = await storage.getCouponByCode(req.params.code);
      if (!coupon) return res.status(404).json({ error: "الكوبون غير موجود" });
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const validData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validData);
      res.status(201).json(coupon);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const coupon = await storage.updateCoupon(parseInt(req.params.id), req.body);
      if (!coupon) return res.status(404).json({ error: "الكوبون غير موجود" });
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      await storage.deleteCoupon(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Warehouses Routes ====================
  
  app.get("/api/warehouses", async (req, res) => {
    try {
      const warehouseList = await storage.getWarehouses();
      res.json(warehouseList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/warehouses/:id", async (req, res) => {
    try {
      const warehouse = await storage.getWarehouse(parseInt(req.params.id));
      if (!warehouse) return res.status(404).json({ error: "المستودع غير موجود" });
      res.json(warehouse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const validData = insertWarehouseSchema.parse(req.body);
      const warehouse = await storage.createWarehouse(validData);
      res.status(201).json(warehouse);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/warehouses/:id", async (req, res) => {
    try {
      const warehouse = await storage.updateWarehouse(parseInt(req.params.id), req.body);
      if (!warehouse) return res.status(404).json({ error: "المستودع غير موجود" });
      res.json(warehouse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Dashboard Stats Routes ====================
  
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      // Enrich orders with address data for map display
      const ordersWithAddresses = await Promise.all(
        allOrders.map(async (order) => {
          if (order.addressId) {
            const address = await storage.getAddress(order.addressId);
            return { ...order, address };
          }
          return order;
        })
      );
      res.json(ordersWithAddresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Driver App Routes ====================

  // Driver login endpoint
  app.post("/api/driver/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      // Check drivers table first
      const drivers = await storage.getDrivers();
      const driver = drivers.find(d => d.phone === phone);
      
      if (!driver) {
        return res.status(401).json({ error: "رقم الهاتف غير مسجل كسائق" });
      }
      
      // For now, use a simple password check (in production, should use bcrypt)
      // Default password is the last 4 digits of phone number
      const defaultPassword = phone.slice(-4);
      if (password !== defaultPassword && password !== 'driver123') {
        return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
      }
      
      res.json({ 
        success: true, 
        driver: { 
          id: driver.id, 
          name: driver.name, 
          phone: driver.phone,
          vehicleType: driver.vehicleType 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/driver/orders", async (req, res) => {
    try {
      // Get driver ID from query params (in production, use session/JWT)
      const driverId = req.query.driverId;
      if (!driverId) {
        return res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
      }
      
      const allOrders = await storage.getAllOrders();
      // Filter to show only pending, confirmed, processing, and shipped orders
      const activeOrders = allOrders.filter(o => 
        ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
      );
      
      // Enrich orders with user, address, and items data for driver app
      const enrichedOrders = await Promise.all(
        activeOrders.map(async (order) => {
          const user = await storage.getUser(order.userId);
          const address = order.addressId ? await storage.getAddress(order.addressId) : null;
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            user: user ? { id: user.id, phone: user.phone, facilityName: user.facilityName } : null,
            address,
            items: items.map(item => ({ 
              id: item.id,
              productId: item.productId,
              productName: item.productName, 
              quantity: item.quantity,
              price: item.price,
              unit: 'قطعة',
            })),
          };
        })
      );
      res.json(enrichedOrders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete order item (for driver to adjust order)
  app.delete("/api/driver/orders/:orderId/items/:itemId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);
      
      // Get the order and item to calculate proper adjustments
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }
      
      const items = await storage.getOrderItems(orderId);
      const item = items.find(i => i.id === itemId);
      
      if (!item) {
        return res.status(404).json({ error: "المنتج غير موجود في الطلب" });
      }
      
      // Use the item's stored total value for accurate calculation
      const itemTotal = parseFloat(item.total);
      
      // Delete the item
      await storage.deleteOrderItem(itemId);
      
      // Get remaining items
      const remainingItems = await storage.getOrderItems(orderId);
      
      if (remainingItems.length === 0) {
        // If no items left, cancel the order
        await storage.updateOrderStatus(orderId, 'cancelled');
        return res.json({ message: "تم حذف المنتج وإلغاء الطلب لعدم وجود منتجات", orderCancelled: true });
      }
      
      // Calculate new totals by summing remaining items
      const newSubtotal = remainingItems.reduce((sum, i) => sum + parseFloat(i.total), 0);
      
      // Preserve the original tax ratio from the order
      const originalSubtotal = parseFloat(order.subtotal);
      const originalTax = parseFloat(order.tax);
      const taxRatio = originalSubtotal > 0 ? originalTax / originalSubtotal : 0.15;
      const newTax = newSubtotal * taxRatio;
      
      // Calculate new total (subtotal + tax + delivery fee)
      const deliveryFee = parseFloat(order.deliveryFee || '0');
      const newTotal = newSubtotal + newTax + deliveryFee;
      
      await storage.updateOrderTotals(orderId, {
        subtotal: newSubtotal.toFixed(2),
        tax: newTax.toFixed(2),
        total: newTotal.toFixed(2),
      });
      
      res.json({ message: "تم حذف المنتج بنجاح", orderCancelled: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Customer Statistics Routes ====================

  app.get("/api/admin/customers/stats", async (req, res) => {
    try {
      const stats = await storage.getCustomerStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topCustomers = await storage.getTopCustomers(limit);
      res.json(topCustomers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers/growth", async (req, res) => {
    try {
      const growthData = await storage.getCustomerGrowthData();
      res.json(growthData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers/:id/details", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const details = await storage.getCustomerDetails(userId);
      if (!details) {
        return res.status(404).json({ error: "العميل غير موجود" });
      }
      res.json(details);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/customers", async (req, res) => {
    try {
      const newUser = await storage.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Change user password
  app.put("/api/users/:id/password", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "كلمة السر الحالية والجديدة مطلوبتان" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      if (!user.password) {
        return res.status(400).json({ error: "لم يتم تعيين كلمة سر لهذا الحساب" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "كلمة السر الحالية غير صحيحة" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.json({ success: true, message: "تم تغيير كلمة السر بنجاح" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Notifications Routes ====================
  
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : undefined;
      const notificationList = await storage.getNotifications(userId, staffId);
      res.json(notificationList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notifications/unread/count", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : undefined;
      const count = await storage.getUnreadNotificationsCount(userId, staffId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validData);
      res.status(201).json(notification);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/notifications/read-all", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : undefined;
      await storage.markAllNotificationsRead(userId, staffId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Notification Preferences Routes ====================

  app.get("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let prefs = await storage.getNotificationPreferences(userId);
      if (!prefs) {
        prefs = await storage.createNotificationPreferences({
          userId,
          ordersEnabled: true,
          promotionsEnabled: true,
          systemEnabled: true,
        });
      }
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let prefs = await storage.getNotificationPreferences(userId);
      if (!prefs) {
        prefs = await storage.createNotificationPreferences({
          userId,
          ordersEnabled: req.body.ordersEnabled ?? true,
          promotionsEnabled: req.body.promotionsEnabled ?? true,
          systemEnabled: req.body.systemEnabled ?? true,
        });
      } else {
        prefs = await storage.updateNotificationPreferences(userId, req.body);
      }
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Activity Logs Routes ====================
  
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const validData = insertActivityLogSchema.parse(req.body);
      const log = await storage.createActivityLog(validData);
      res.status(201).json(log);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Inventory Routes ====================
  
  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 30;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/inventory/:id/stock", async (req, res) => {
    try {
      const { quantity } = req.body;
      const product = await storage.updateProductStock(parseInt(req.params.id), quantity);
      if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Cities Routes ====================

  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cities/:id", async (req, res) => {
    try {
      const city = await storage.getCity(parseInt(req.params.id));
      if (!city) return res.status(404).json({ error: "المدينة غير موجودة" });
      res.json(city);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cities", async (req, res) => {
    try {
      const validData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(validData);
      res.status(201).json(city);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/cities/:id", async (req, res) => {
    try {
      const city = await storage.updateCity(parseInt(req.params.id), req.body);
      if (!city) return res.status(404).json({ error: "المدينة غير موجودة" });
      res.json(city);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cities/:id", async (req, res) => {
    try {
      await storage.deleteCity(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Drivers Routes ====================

  app.get("/api/drivers", async (req, res) => {
    try {
      const driversList = await storage.getDrivers();
      res.json(driversList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/drivers/available", async (req, res) => {
    try {
      const availableDrivers = await storage.getAvailableDrivers();
      res.json(availableDrivers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.getDriver(parseInt(req.params.id));
      if (!driver) return res.status(404).json({ error: "السائق غير موجود" });
      res.json(driver);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/drivers/warehouse/:warehouseId", async (req, res) => {
    try {
      const driversList = await storage.getDriversByWarehouse(parseInt(req.params.warehouseId));
      res.json(driversList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const validData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(validData);
      res.status(201).json(driver);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.updateDriver(parseInt(req.params.id), req.body);
      if (!driver) return res.status(404).json({ error: "السائق غير موجود" });
      res.json(driver);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      await storage.deleteDriver(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Vehicles Routes ====================

  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehiclesList = await storage.getVehicles();
      res.json(vehiclesList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vehicles/available", async (req, res) => {
    try {
      const availableVehicles = await storage.getAvailableVehicles();
      res.json(availableVehicles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(parseInt(req.params.id));
      if (!vehicle) return res.status(404).json({ error: "المركبة غير موجودة" });
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vehicles/warehouse/:warehouseId", async (req, res) => {
    try {
      const vehiclesList = await storage.getVehiclesByWarehouse(parseInt(req.params.warehouseId));
      res.json(vehiclesList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicle = await storage.createVehicle(req.body);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(parseInt(req.params.id), req.body);
      if (!vehicle) return res.status(404).json({ error: "المركبة غير موجودة" });
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vehicles/:id/assign-driver", async (req, res) => {
    try {
      const { driverId } = req.body;
      const vehicle = await storage.assignVehicleToDriver(parseInt(req.params.id), driverId);
      if (!vehicle) return res.status(404).json({ error: "المركبة غير موجودة" });
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Warehouses with Cities Routes ====================

  app.get("/api/warehouses/by-city/:cityId", async (req, res) => {
    try {
      const warehouse = await storage.getWarehouseByCity(parseInt(req.params.cityId));
      if (!warehouse) return res.status(404).json({ error: "لا يوجد مستودع لهذه المدينة" });
      res.json(warehouse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Product Inventory Routes ====================

  app.get("/api/product-inventory/warehouse/:warehouseId", async (req, res) => {
    try {
      const inventory = await storage.getProductInventory(parseInt(req.params.warehouseId));
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/product-inventory/product/:productId", async (req, res) => {
    try {
      const inventory = await storage.getProductInventoryByProduct(parseInt(req.params.productId));
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/product-inventory", async (req, res) => {
    try {
      const validData = insertProductInventorySchema.parse(req.body);
      const inventory = await storage.createProductInventory(validData);
      res.status(201).json(inventory);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/product-inventory/:id", async (req, res) => {
    try {
      const inventory = await storage.updateProductInventory(parseInt(req.params.id), req.body);
      if (!inventory) return res.status(404).json({ error: "سجل المخزون غير موجود" });
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/product-inventory/:id", async (req, res) => {
    try {
      await storage.deleteProductInventory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get products by city (for customer filtering)
  app.get("/api/products/by-city/:cityId", async (req, res) => {
    try {
      const products = await storage.getProductsByCity(parseInt(req.params.cityId));
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Banners/Slides Routes ====================

  app.get("/api/banners", async (req, res) => {
    try {
      const bannersList = await storage.getBanners();
      res.json(bannersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/banners/active", async (req, res) => {
    try {
      const cityId = req.query.cityId ? parseInt(req.query.cityId as string) : undefined;
      const activeBanners = await storage.getActiveBanners(cityId);
      res.json(activeBanners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get banner stats - must be before :id route
  app.get("/api/banners/stats", async (req, res) => {
    try {
      const stats = await storage.getBannerStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/banners/:id", async (req, res) => {
    try {
      const banner = await storage.getBanner(parseInt(req.params.id));
      if (!banner) return res.status(404).json({ error: "الشريحة غير موجودة" });
      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/banners", async (req, res) => {
    try {
      // Convert date strings to Date objects or null
      const data = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      };
      const validData = insertBannerSchema.parse(data);
      const banner = await storage.createBanner(validData);
      res.status(201).json(banner);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: fromError(error).toString() });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/banners/:id", async (req, res) => {
    try {
      // Convert date strings to Date objects or null
      const data = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      };
      const banner = await storage.updateBanner(parseInt(req.params.id), data);
      if (!banner) return res.status(404).json({ error: "الشريحة غير موجودة" });
      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/banners/:id", async (req, res) => {
    try {
      await storage.deleteBanner(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Duplicate banner
  app.post("/api/banners/:id/duplicate", async (req, res) => {
    try {
      const banner = await storage.duplicateBanner(parseInt(req.params.id));
      if (!banner) return res.status(404).json({ error: "الشريحة غير موجودة" });
      res.status(201).json(banner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Increment banner views
  app.post("/api/banners/:id/view", async (req, res) => {
    try {
      const { userId } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      const userAgent = req.headers['user-agent'];
      await storage.trackBannerView(parseInt(req.params.id), userId, ipAddress, userAgent);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get banner viewers
  app.get("/api/banners/:id/viewers", async (req, res) => {
    try {
      const viewers = await storage.getBannerViewers(parseInt(req.params.id));
      res.json(viewers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Increment banner clicks
  app.post("/api/banners/:id/click", async (req, res) => {
    try {
      await storage.incrementBannerClicks(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Track banner purchase
  app.post("/api/banners/:id/purchase", async (req, res) => {
    try {
      const { amount } = req.body;
      await storage.incrementBannerPurchase(parseInt(req.params.id), parseFloat(amount) || 0);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reorder banners
  app.post("/api/banners/reorder", async (req, res) => {
    try {
      const { bannerIds } = req.body;
      if (!Array.isArray(bannerIds)) return res.status(400).json({ error: "bannerIds must be an array" });
      await storage.reorderBanners(bannerIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk delete banners
  app.post("/api/banners/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) return res.status(400).json({ error: "ids must be an array" });
      await storage.deleteBanners(ids);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Banner Products Routes - منتجات الباقات ====================

  // Get products for a banner (promo bundle)
  app.get("/api/banners/:bannerId/products", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.bannerId);
      const products = await storage.getBannerProducts(bannerId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add product to banner bundle
  app.post("/api/banners/:bannerId/products", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.bannerId);
      const { productId, promoPrice, quantity } = req.body;
      const item = await storage.addBannerProduct({
        bannerId,
        productId,
        promoPrice,
        quantity: quantity || 1
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update banner product
  app.put("/api/banner-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateBannerProduct(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove product from banner bundle
  app.delete("/api/banner-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeBannerProduct(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear all products from banner
  app.delete("/api/banners/:bannerId/products", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.bannerId);
      await storage.clearBannerProducts(bannerId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Expense Categories - فئات المصاريف =====
  app.get("/api/expense-categories", async (req, res) => {
    try {
      const categoriesList = await storage.getExpenseCategories();
      res.json(categoriesList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/expense-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getExpenseCategory(id);
      if (!category) {
        return res.status(404).json({ error: "الفئة غير موجودة" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expense-categories", async (req, res) => {
    try {
      const category = await storage.createExpenseCategory(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/expense-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateExpenseCategory(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "الفئة غير موجودة" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/expense-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpenseCategory(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Expenses - المصاريف =====
  app.get("/api/expenses", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.categoryId) filters.categoryId = parseInt(req.query.categoryId as string);
      if (req.query.warehouseId) filters.warehouseId = parseInt(req.query.warehouseId as string);
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      
      const expensesList = await storage.getExpenses(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(expensesList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/expenses/summary", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.warehouseId) filters.warehouseId = parseInt(req.query.warehouseId as string);
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      
      const summary = await storage.getExpenseSummary(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ error: "المصروف غير موجود" });
      }
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await storage.createExpense(req.body);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateExpense(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "المصروف غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpense(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delivery Settings Routes - إعدادات التوصيل
  app.get("/api/delivery-settings", async (req, res) => {
    try {
      const settings = await storage.getDeliverySettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/delivery-settings/resolve", async (req, res) => {
    try {
      const warehouseId = parseInt(req.query.warehouseId as string);
      const subtotal = parseFloat(req.query.subtotal as string) || 0;
      const quantity = parseInt(req.query.quantity as string) || 0;
      
      if (!warehouseId) {
        return res.status(400).json({ error: "warehouseId مطلوب" });
      }
      
      const result = await storage.resolveDeliveryFee(warehouseId, subtotal, quantity);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/delivery-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const setting = await storage.getDeliverySetting(id);
      if (!setting) {
        return res.status(404).json({ error: "إعدادات التوصيل غير موجودة" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/delivery-settings", async (req, res) => {
    try {
      const setting = await storage.createDeliverySetting(req.body);
      res.status(201).json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/delivery-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateDeliverySetting(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "إعدادات التوصيل غير موجودة" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/delivery-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDeliverySetting(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Customer Credit Routes - نظام الآجل ====================
  
  // Get customer credit info
  app.get("/api/credits/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const credit = await storage.getOrCreateCustomerCredit(userId);
      res.json(credit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all customer credits (admin)
  app.get("/api/credits", async (req, res) => {
    try {
      const credits = await storage.getAllCustomerCredits();
      res.json(credits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check credit eligibility
  app.post("/api/credits/:userId/check-eligibility", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { amount } = req.body;
      const result = await storage.checkCreditEligibility(userId, parseFloat(amount));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update customer loyalty level
  app.post("/api/credits/:userId/update-level", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const credit = await storage.updateCustomerLoyaltyLevel(userId);
      res.json(credit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get credit transactions
  app.get("/api/credits/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getCreditTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create credit purchase (buy on credit)
  app.post("/api/credits/:userId/purchase", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { orderId, amount } = req.body;
      
      // Check eligibility first
      const eligibility = await storage.checkCreditEligibility(userId, parseFloat(amount));
      if (!eligibility.eligible) {
        return res.status(400).json({ error: eligibility.reason });
      }
      
      const transaction = await storage.createCreditPurchase(userId, parseInt(orderId), parseFloat(amount));
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create credit payment (pay debt)
  app.post("/api/credits/:userId/payment", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { amount, notes } = req.body;
      const transaction = await storage.createCreditPayment(userId, parseFloat(amount), notes);
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update customer credit settings (admin)
  app.put("/api/credits/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updated = await storage.updateCustomerCredit(userId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "رصيد العميل غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all pending credits with users (admin) - sorted by due date
  app.get("/api/credits/pending/all", async (req, res) => {
    try {
      const pendingCredits = await storage.getAllPendingCreditsWithUsers();
      res.json(pendingCredits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get next due credit for a user (customer view)
  app.get("/api/credits/:userId/next-due", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const nextDue = await storage.getNextDueCredit(userId);
      res.json(nextDue);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Site Settings Routes ====================

  // Get all site settings
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get site setting by key
  app.get("/api/site-settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSiteSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "الإعداد غير موجود" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create or update site setting (admin)
  app.post("/api/site-settings", async (req, res) => {
    try {
      const { key, value, label } = req.body;
      if (!key || !value) {
        return res.status(400).json({ error: "المفتاح والقيمة مطلوبان" });
      }
      const setting = await storage.upsertSiteSetting({ key, value, label });
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete site setting (admin)
  app.delete("/api/site-settings/:key", async (req, res) => {
    try {
      await storage.deleteSiteSetting(req.params.key);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
