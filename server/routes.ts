import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCartItemSchema, insertOrderSchema, insertAddressSchema, 
  insertPaymentCardSchema, insertWalletTransactionSchema, insertPromotionSchema,
  insertSupplierSchema, insertReturnSchema, insertShipmentSchema, insertCustomerSegmentSchema,
  insertReportSchema, insertStaffSchema, insertSupportTicketSchema, insertCouponSchema,
  insertWarehouseSchema, insertNotificationSchema, insertActivityLogSchema,
  insertCitySchema, insertProductInventorySchema
} from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== Auth Routes ====================
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(validData.phone);
      if (existingUser) {
        return res.status(400).json({ error: "رقم الجوال مسجل بالفعل" });
      }

      const user = await storage.createUser(validData);
      
      // Create wallet for new user
      await storage.createWallet({ userId: user.id, balance: "0" });
      
      res.json({ user });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      const user = await storage.getUserByPhone(phone);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "رقم الجوال أو كلمة المرور غير صحيحة" });
      }

      res.json({ user });
    } catch (error: any) {
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
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }
      res.json(product);
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
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!product) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }
      res.json(product);
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
      
      const newOrder = await storage.createOrder(validOrder, items);
      
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
      res.json(allOrders);
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

  return httpServer;
}
