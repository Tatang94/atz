import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getDigiflazzService, isDigiflazzConfigured } from "./services/digiflazz";
import { payDisiniService } from "./services/paydisini";
import { insertTransactionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // No more sample products initialization

  // Check API configuration status
  app.get("/api/config/status", (req, res) => {
    res.json({
      digiflazz: isDigiflazzConfigured(),
      message: isDigiflazzConfigured() 
        ? "Digiflazz API dikonfigurasi dengan benar"
        : "Digiflazz API belum dikonfigurasi. Tambahkan DIGIFLAZZ_USERNAME dan DIGIFLAZZ_API_KEY"
    });
  });

  // Admin configuration endpoints
  app.post("/api/admin/config", async (req, res) => {
    try {
      const { digiflazzUsername, digiflazzApiKey } = req.body;
      
      console.log("Saving config:", { digiflazzUsername, digiflazzApiKey: digiflazzApiKey ? "***" : "empty" });
      
      // In a real implementation, you would save these to environment variables
      // For now, we'll temporarily set them in process.env
      if (digiflazzUsername) {
        process.env.DIGIFLAZZ_USERNAME = digiflazzUsername;
        console.log("Set DIGIFLAZZ_USERNAME:", digiflazzUsername);
      }
      if (digiflazzApiKey) {
        process.env.DIGIFLAZZ_API_KEY = digiflazzApiKey;
        console.log("Set DIGIFLAZZ_API_KEY: ***");
      }
      
      console.log("After setting, isConfigured:", isDigiflazzConfigured());
      
      res.json({ 
        message: "Konfigurasi berhasil disimpan",
        digiflazz: isDigiflazzConfigured()
      });
    } catch (error) {
      console.error("Error saving configuration:", error);
      res.status(500).json({ message: "Gagal menyimpan konfigurasi" });
    }
  });

  // Test Digiflazz API
  app.post("/api/admin/test-digiflazz", async (req, res) => {
    try {
      if (!isDigiflazzConfigured()) {
        return res.status(400).json({ message: "API Digiflazz belum dikonfigurasi" });
      }
      
      const balance = await digiflazzService.getBalance();
      res.json({ 
        message: "API Digiflazz berhasil terhubung",
        balance 
      });
    } catch (error) {
      console.error("Error testing Digiflazz API:", error);
      res.status(500).json({ message: "Gagal menghubungi API Digiflazz" });
    }
  });

  // Admin stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allTransactions = await storage.getAllTransactions();
      const products = await storage.getProducts();
      const users = await storage.getAllUsers();
      
      const totalRevenue = allTransactions
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + parseFloat(t.totalAmount || '0'), 0);
      
      const stats = {
        totalTransactions: allTransactions.length,
        totalRevenue: totalRevenue.toString(),
        pendingTransactions: allTransactions.filter(t => t.status === 'pending').length,
        successfulTransactions: allTransactions.filter(t => t.status === 'success').length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get products by category
  app.get("/api/products/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsBycategory(category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Clear all products and re-sync with new pricing
  app.post("/api/products/clear-and-sync", async (req, res) => {
    try {
      await storage.clearAllProducts();
      
      const digiflazzProducts = await getDigiflazzService().getProducts();
      
      if (!Array.isArray(digiflazzProducts)) {
        console.error("Digiflazz response is not an array:", digiflazzProducts);
        return res.status(500).json({ message: "Invalid response from Digiflazz API" });
      }
      
      for (const product of digiflazzProducts) {
        // Skip products with missing essential data
        if (!product.buyer_sku_code || !product.product_name) {
          console.log("Skipping product with missing data:", product);
          continue;
        }

        // Simple pricing: Digiflazz price + 1000 rupiah margin
        const digiflazzPrice = product.price || 0;
        const finalPrice = digiflazzPrice + 1000; // Add 1000 rupiah margin
        
        await storage.createProduct({
          sku: product.buyer_sku_code,
          category: (product.category || 'other').toLowerCase(),
          brand: product.brand || 'Unknown',
          type: product.type || 'prepaid',
          productName: product.product_name || 'Unknown Product',
          price: digiflazzPrice.toString(), // Keep original Digiflazz price for reference
          sellerPrice: finalPrice.toString(), // Same price for all users
          buyerPrice: finalPrice.toString(), // Same price for all users
          description: product.desc || null,
          isActive: product.buyer_product_status === true,
        });
      }

      res.json({ 
        message: "All products cleared and re-synced with new pricing (1000 rupiah margin)", 
        count: digiflazzProducts.length 
      });
    } catch (error) {
      console.error("Error clearing and syncing products:", error);
      res.status(500).json({ message: "Failed to clear and sync products" });
    }
  });

  // Sync products from Digiflazz
  app.post("/api/products/sync", async (req, res) => {
    try {
      // Check if Digiflazz is configured
      if (!isDigiflazzConfigured()) {
        return res.status(400).json({ 
          message: "Digiflazz API belum dikonfigurasi. Silakan tambahkan DIGIFLAZZ_USERNAME dan DIGIFLAZZ_API_KEY pada environment variables.",
          configured: false
        });
      }

      const digiflazzProducts = await getDigiflazzService().getProducts();
      
      console.log("Digiflazz API response:", JSON.stringify(digiflazzProducts).substring(0, 500));
      
      if (!Array.isArray(digiflazzProducts)) {
        console.error("Digiflazz response is not an array:", digiflazzProducts);
        return res.status(500).json({ message: "Invalid response from Digiflazz API" });
      }
      
      for (const product of digiflazzProducts) {
        // Skip products with missing essential data
        if (!product.buyer_sku_code || !product.product_name) {
          console.log("Skipping product with missing data:", product);
          continue;
        }

        const existingProduct = await storage.getProductBysku(product.buyer_sku_code);
        
        // Simple pricing: Digiflazz price + 1000 rupiah margin
        const digiflazzPrice = product.price || 0;
        const finalPrice = digiflazzPrice + 1000; // Add 1000 rupiah margin
        
        const productData = {
          productName: product.product_name || 'Unknown Product',
          price: digiflazzPrice.toString(), // Keep original Digiflazz price for reference
          sellerPrice: finalPrice.toString(), // Same price for all users
          buyerPrice: finalPrice.toString(), // Same price for all users
          description: product.desc || null,
          isActive: product.buyer_product_status === true,
        };
        
        if (existingProduct) {
          await storage.updateProduct(product.buyer_sku_code, productData);
        } else {
          await storage.createProduct({
            sku: product.buyer_sku_code,
            category: (product.category || 'other').toLowerCase(),
            brand: product.brand || 'Unknown',
            type: product.type || 'prepaid',
            ...productData,
          });
        }
      }

      res.json({ message: "Products synced successfully", count: digiflazzProducts.length });
    } catch (error) {
      console.error("Error syncing products:", error);
      res.status(500).json({ message: "Failed to sync products" });
    }
  });

  // Create transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const { productCode, targetNumber, paymentMethod } = validatedData;

      // Get product details
      const product = await storage.getProductBysku(productCode);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        productCode,
        productName: product.productName,
        category: product.category,
        operator: product.brand,
        targetNumber,
        amount: product.buyerPrice,
        adminFee: "0",
        totalAmount: product.buyerPrice,
        paymentMethod,
      });

      // PayDisini integration required
      res.status(503).json({ 
        message: "Payment service not configured. Admin needs to set up PayDisini API keys.",
        transaction: null 
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Get transaction status
  app.get("/api/transactions/:refId/status", async (req, res) => {
    try {
      const { refId } = req.params;
      const transaction = await storage.getTransactionByRefId(refId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Real payment status check (PayDisini integration required)
      // Payment status checking will be implemented when PayDisini is configured

      const updatedTransaction = await storage.getTransactionByRefId(refId);
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error checking transaction status:", error);
      res.status(500).json({ message: "Failed to check transaction status" });
    }
  });

  // Payment callback from PayDisini
  app.post("/api/payment-callback", async (req, res) => {
    try {
      const { unique_code, status } = req.body;
      
      if (!unique_code) {
        return res.status(400).json({ message: "Missing unique_code" });
      }

      const transaction = await storage.getTransactionByRefId(unique_code);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      let newStatus = transaction.status;
      if (status === 'Success') {
        newStatus = 'processing';
      } else if (status === 'Expired' || status === 'Failed') {
        newStatus = 'failed';
      }

      await storage.updateTransaction(transaction.id, { status: newStatus });

      // If payment is successful, process with Digiflazz
      if (newStatus === 'processing') {
        try {
          const digiflazzResult = await getDigiflazzService().createTransaction(
            transaction.productCode,
            transaction.targetNumber,
            transaction.refId
          );

          await storage.updateTransaction(transaction.id, {
            status: digiflazzResult.data.status === 'Sukses' ? 'success' : 'failed',
            digiflazzTrxId: digiflazzResult.data.trx_id,
            sn: digiflazzResult.data.sn,
            message: digiflazzResult.data.message,
          });
        } catch (digiflazzError) {
          console.error("Digiflazz transaction failed:", digiflazzError);
          await storage.updateTransaction(transaction.id, {
            status: 'failed',
            message: 'Payment successful but product delivery failed',
          });
        }
      }

      res.json({ message: "Callback processed successfully" });
    } catch (error) {
      console.error("Error processing payment callback:", error);
      res.status(500).json({ message: "Failed to process callback" });
    }
  });



  // Detect operator from phone number
  app.post("/api/detect-operator", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const cleanNumber = phoneNumber.replace(/\D/g, '');
      let operator = '';

      // Indonesian operator detection logic
      if (cleanNumber.startsWith('0811') || cleanNumber.startsWith('0812') || cleanNumber.startsWith('0813') || 
          cleanNumber.startsWith('0821') || cleanNumber.startsWith('0822') || cleanNumber.startsWith('0823') ||
          cleanNumber.startsWith('0851') || cleanNumber.startsWith('0852') || cleanNumber.startsWith('0853')) {
        operator = 'Telkomsel';
      } else if (cleanNumber.startsWith('0814') || cleanNumber.startsWith('0815') || cleanNumber.startsWith('0816') ||
                 cleanNumber.startsWith('0855') || cleanNumber.startsWith('0856') || cleanNumber.startsWith('0857') ||
                 cleanNumber.startsWith('0858')) {
        operator = 'Indosat';
      } else if (cleanNumber.startsWith('0817') || cleanNumber.startsWith('0818') || cleanNumber.startsWith('0819') ||
                 cleanNumber.startsWith('0859') || cleanNumber.startsWith('0877') || cleanNumber.startsWith('0878')) {
        operator = 'XL';
      } else if (cleanNumber.startsWith('0895') || cleanNumber.startsWith('0896') || cleanNumber.startsWith('0897') ||
                 cleanNumber.startsWith('0898') || cleanNumber.startsWith('0899')) {
        operator = 'Tri';
      } else if (cleanNumber.startsWith('0831') || cleanNumber.startsWith('0832') || cleanNumber.startsWith('0833') ||
                 cleanNumber.startsWith('0838')) {
        operator = 'Axis';
      } else if (cleanNumber.startsWith('0881') || cleanNumber.startsWith('0882') || cleanNumber.startsWith('0883') ||
                 cleanNumber.startsWith('0884') || cleanNumber.startsWith('0885') || cleanNumber.startsWith('0886') ||
                 cleanNumber.startsWith('0887') || cleanNumber.startsWith('0888') || cleanNumber.startsWith('0889')) {
        operator = 'Smartfren';
      }

      res.json({ operator, phoneNumber: cleanNumber });
    } catch (error) {
      console.error("Error detecting operator:", error);
      res.status(500).json({ message: "Failed to detect operator" });
    }
  });

  // Get payment methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      // Focus on QRIS and DANA as requested by user
      const paymentMethods = [
        { 
          id: '11', 
          name: 'QRIS', 
          icon: 'qrcode', 
          type: 'qris',
          description: 'Bayar dengan QRIS dari berbagai aplikasi',
          fee: '0',
          isActive: true
        },
        { 
          id: '23', 
          name: 'DANA', 
          icon: 'wallet', 
          type: 'ewallet',
          description: 'Bayar dengan DANA e-wallet',
          fee: '0',
          isActive: true
        },
      ];

      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // ================== ADMIN ROUTES ==================
  
  // Admin: Get all transactions with pagination
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category } = req.query;
      const transactions = await storage.getAllTransactions(
        parseInt(page as string), 
        parseInt(limit as string),
        status as string,
        category as string
      );
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin: Get transaction statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getTransactionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin: Get all products with filters
  app.get("/api/admin/products", async (req, res) => {
    try {
      const { category, brand, isActive } = req.query;
      const products = await storage.getProductsWithFilters(
        category as string,
        brand as string,
        isActive === 'true'
      );
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Admin: Update product prices
  app.patch("/api/admin/products/:sku", async (req, res) => {
    try {
      const { sku } = req.params;
      const { sellerPrice, buyerPrice, isActive } = req.body;
      
      const updatedProduct = await storage.updateProduct(sku, {
        sellerPrice: sellerPrice?.toString(),
        buyerPrice: buyerPrice?.toString(),
        isActive
      });
      
      res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Admin: Get product categories with counts
  app.get("/api/admin/categories", async (req, res) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin: Test Digiflazz connection
  app.get("/api/admin/test-digiflazz", async (req, res) => {
    try {
      const balance = await getDigiflazzService().getBalance();
      const testProducts = await getDigiflazzService().getProducts();
      
      res.json({
        message: "Digiflazz connection successful",
        balance: balance,
        productCount: Array.isArray(testProducts) ? testProducts.length : 0,
        sampleProducts: Array.isArray(testProducts) ? testProducts.slice(0, 3) : testProducts
      });
    } catch (error) {
      console.error("Digiflazz test failed:", error);
      res.status(500).json({ 
        message: "Digiflazz connection failed", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin: Clear all products (dangerous operation)
  app.delete("/api/admin/products", async (req, res) => {
    try {
      await storage.clearAllProducts();
      res.json({ message: "All products cleared successfully" });
    } catch (error) {
      console.error("Error clearing products:", error);
      res.status(500).json({ message: "Failed to clear products" });
    }
  });

  // Admin: Get user list
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => ({ ...user, password: undefined }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin: Update user role or status
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { role, isActive, balance } = req.body;
      
      const updatedUser = await storage.updateUser(id, { role, isActive, balance });
      res.json({ 
        message: "User updated successfully", 
        user: { ...updatedUser, password: undefined } 
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getTransactionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category } = req.query;
      const transactions = await storage.getAllTransactions(
        parseInt(page as string),
        parseInt(limit as string),
        status as string,
        category as string
      );
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/products/:isActive?", async (req, res) => {
    try {
      const { isActive } = req.params;
      const { category, brand } = req.query;
      
      let activeFilter: boolean | undefined;
      if (isActive !== undefined) {
        activeFilter = isActive === 'true';
      }
      
      const products = await storage.getProductsWithFilters(
        category as string,
        brand as string,
        activeFilter
      );
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/admin/categories", async (req, res) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/products/:sku", async (req, res) => {
    try {
      const { sku } = req.params;
      const updates = req.body;
      
      // Validate pricing updates
      if (updates.sellerPrice && updates.buyerPrice) {
        const sellerPrice = parseInt(updates.sellerPrice);
        const buyerPrice = parseInt(updates.buyerPrice);
        
        if (sellerPrice <= 0 || buyerPrice <= 0) {
          return res.status(400).json({ message: "Harga harus lebih dari 0" });
        }
        
        if (sellerPrice > buyerPrice) {
          return res.status(400).json({ 
            message: "Harga reseller tidak boleh lebih tinggi dari harga customer" 
          });
        }
      }
      
      await storage.updateProduct(sku, updates);
      res.json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products", async (req, res) => {
    try {
      await storage.clearAllProducts();
      res.json({ message: "All products cleared successfully" });
    } catch (error) {
      console.error("Error clearing products:", error);
      res.status(500).json({ message: "Failed to clear products" });
    }
  });

  app.get("/api/admin/test-digiflazz", async (req, res) => {
    try {
      const balance = await getDigiflazzService().getBalance();
      const products = await getDigiflazzService().getProducts();
      
      res.json({
        balance,
        productCount: Array.isArray(products) ? products.length : 0,
        status: "connected"
      });
    } catch (error) {
      console.error("Error testing Digiflazz connection:", error);
      res.status(500).json({ 
        message: "Failed to connect to Digiflazz API",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
