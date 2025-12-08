import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCartItemSchema, insertOrderSchema, insertAddressSchema, insertPaymentCardSchema, insertWalletTransactionSchema } from "@shared/schema";
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

  // ==================== Categories Routes ====================
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
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

  return httpServer;
}
