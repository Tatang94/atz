import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { digiflazzService, isDigiflazzConfigured } from "./services/digiflazz";
import { payDisiniService } from "./services/paydisini";
import { insertTransactionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize some sample products if no products exist and Digiflazz is not configured
  const initializeSampleProducts = async () => {
    const products = await storage.getProducts();
    if (products.length === 0 && !isDigiflazzConfigured()) {
      const sampleProducts = [
        {
          sku: "TSEL5",
          productName: "Telkomsel 5.000",
          category: "pulsa",
          brand: "Telkomsel",
          type: "prepaid",
          price: "5000",
          sellerPrice: "6000",
          buyerPrice: "6000",
          description: "Pulsa Telkomsel 5.000",
          isActive: true,
        },
        {
          sku: "TSEL10",
          productName: "Telkomsel 10.000",
          category: "pulsa", 
          brand: "Telkomsel",
          type: "prepaid",
          price: "10000",
          sellerPrice: "11000",
          buyerPrice: "11000",
          description: "Pulsa Telkomsel 10.000",
          isActive: true,
        },
        {
          sku: "ISAT5",
          productName: "Indosat 5.000",
          category: "pulsa",
          brand: "Indosat",
          type: "prepaid", 
          price: "5000",
          sellerPrice: "6000",
          buyerPrice: "6000",
          description: "Pulsa Indosat 5.000",
          isActive: true,
        },
        {
          sku: "XL5",
          productName: "XL 5.000",
          category: "pulsa",
          brand: "XL",
          type: "prepaid",
          price: "5000", 
          sellerPrice: "6000",
          buyerPrice: "6000",
          description: "Pulsa XL 5.000",
          isActive: true,
        },
        {
          sku: "PLN20",
          productName: "PLN 20.000",
          category: "pln",
          brand: "PLN",
          type: "prepaid",
          price: "20000",
          sellerPrice: "21000", 
          buyerPrice: "21000",
          description: "Token PLN 20.000",
          isActive: true,
        },
      ];
      
      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }
    }
  };

  // Initialize sample products on server start
  await initializeSampleProducts();

  // Check API configuration status
  app.get("/api/config/status", (req, res) => {
    res.json({
      digiflazz: isDigiflazzConfigured(),
      message: isDigiflazzConfigured() 
        ? "Digiflazz API dikonfigurasi dengan benar"
        : "Digiflazz API belum dikonfigurasi. Tambahkan DIGIFLAZZ_USERNAME dan DIGIFLAZZ_API_KEY"
    });
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
      
      const digiflazzProducts = await digiflazzService.getProducts();
      
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

      const digiflazzProducts = await digiflazzService.getProducts();
      
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

      // Create demo payment (PayDisini account suspended)
      const paymentResponse = {
        success: true,
        data: {
          pay_id: transaction.refId,
          unique_code: transaction.refId,
          service: paymentMethod,
          service_name: paymentMethod === '11' ? 'QRIS' : 'DANA',
          amount: transaction.totalAmount,
          fee: "0",
          status: "Unpaid",
          expired: new Date(Date.now() + 30 * 60000).toISOString(),
          checkout_url: `${req.protocol}://${req.get('host')}/payment-demo/${transaction.refId}`,
          checkout_url_v2: `${req.protocol}://${req.get('host')}/payment-demo/${transaction.refId}`,
          checkout_url_v3: `${req.protocol}://${req.get('host')}/payment-demo/${transaction.refId}`,
          qr_content: paymentMethod === '11' ? `demo-qris-${transaction.refId}` : undefined,
          qrcode_url: paymentMethod === '11' ? `${req.protocol}://${req.get('host')}/api/qr/${transaction.refId}` : undefined,
        }
      };

      if (paymentResponse.success && paymentResponse.data) {
        await storage.updateTransaction(transaction.id, {
          paymentReference: paymentResponse.data.pay_id,
          paymentUrl: paymentResponse.data.checkout_url_v3,
          status: "pending",
        });

        res.json({
          transaction,
          paymentUrl: paymentResponse.data.checkout_url_v3,
          qrCodeUrl: paymentResponse.data.qrcode_url,
        });
      } else {
        throw new Error("Failed to create payment");
      }
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

      // Demo payment status (since PayDisini account is suspended)
      if (transaction.paymentReference) {
        try {
          // Simulate payment status check
          const timeDiff = Date.now() - new Date(transaction.createdAt).getTime();
          let newStatus = transaction.status;
          
          // Auto-process payment after 2 minutes for demo
          if (timeDiff > 120000 && transaction.status === 'pending') {
            newStatus = 'processing';
          } else if (timeDiff > 1800000) { // 30 minutes expired
            newStatus = 'failed';
          }

            if (newStatus !== transaction.status) {
              await storage.updateTransaction(transaction.id, { status: newStatus });
              
              // If payment is successful, process with Digiflazz
              if (newStatus === 'processing') {
                try {
                  const digiflazzResult = await digiflazzService.createTransaction(
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
            }
        } catch (paymentError) {
          console.error("Demo payment status check:", paymentError);
        }
      }

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
          const digiflazzResult = await digiflazzService.createTransaction(
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

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const { username, email, password, role } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user (password should be hashed in production)
      const user = await storage.createUser({
        username,
        email,
        password, // TODO: Hash password
        role: role || "user",
      });

      res.status(201).json({ 
        message: "User created successfully",
        user: { ...user, password: undefined } 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) { // TODO: Use proper password hashing
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        message: "Login successful",
        user: { ...user, password: undefined } 
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
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
      const balance = await digiflazzService.getBalance();
      const testProducts = await digiflazzService.getProducts();
      
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
      const balance = await digiflazzService.getBalance();
      const products = await digiflazzService.getProducts();
      
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

  // Demo QR Code endpoint
  app.get("/api/qr/:refId", async (req, res) => {
    try {
      const { refId } = req.params;
      
      // Generate simple QR code content for demo
      const qrContent = `demo-qris-payment-${refId}`;
      
      // Return SVG QR code for demo purposes
      const svgQR = `
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="20" height="20" fill="black"/>
          <rect x="60" y="20" width="20" height="20" fill="black"/>
          <rect x="100" y="20" width="20" height="20" fill="black"/>
          <rect x="140" y="20" width="20" height="20" fill="black"/>
          <rect x="20" y="60" width="20" height="20" fill="black"/>
          <rect x="140" y="60" width="20" height="20" fill="black"/>
          <rect x="20" y="100" width="20" height="20" fill="black"/>
          <rect x="60" y="100" width="20" height="20" fill="black"/>
          <rect x="100" y="100" width="20" height="20" fill="black"/>
          <rect x="140" y="100" width="20" height="20" fill="black"/>
          <rect x="20" y="140" width="20" height="20" fill="black"/>
          <rect x="60" y="140" width="20" height="20" fill="black"/>
          <rect x="100" y="140" width="20" height="20" fill="black"/>
          <rect x="140" y="140" width="20" height="20" fill="black"/>
          <text x="100" y="185" text-anchor="middle" font-family="Arial" font-size="12" fill="black">DEMO QR: ${refId}</text>
        </svg>
      `;
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgQR);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Demo payment page
  app.get("/payment-demo/:refId", async (req, res) => {
    try {
      const { refId } = req.params;
      const transaction = await storage.getTransactionByRefId(refId);
      
      if (!transaction) {
        return res.status(404).send("Transaction not found");
      }

      const demoPage = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Demo Payment - ${refId}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 20px; }
                .amount { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; margin-bottom: 20px; }
                .qr-code { text-align: center; margin: 20px 0; }
                .button { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 16px; margin-top: 20px; }
                .button:hover { background: #059669; }
                .info { background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Pembayaran Demo</h2>
                    <p>ID Transaksi: ${refId}</p>
                </div>
                
                <div class="amount">Rp ${parseInt(transaction.totalAmount).toLocaleString('id-ID')}</div>
                
                <div class="info">
                    <strong>Produk:</strong> ${transaction.productName}<br>
                    <strong>Target:</strong> ${transaction.targetNumber}<br>
                    <strong>Metode:</strong> ${transaction.paymentMethod === '11' ? 'QRIS' : 'DANA'}
                </div>
                
                ${transaction.paymentMethod === '11' ? `
                    <div class="qr-code">
                        <img src="/api/qr/${refId}" alt="QR Code" style="max-width: 200px;" />
                        <p>Scan QR code di atas dengan aplikasi pembayaran Anda</p>
                    </div>
                ` : `
                    <div class="qr-code">
                        <p>Buka aplikasi DANA dan lakukan pembayaran dengan nominal di atas</p>
                    </div>
                `}
                
                <button class="button" onclick="simulatePayment()">Simulasi Pembayaran Berhasil</button>
                
                <script>
                    function simulatePayment() {
                        fetch('/api/payment-callback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ unique_code: '${refId}', status: 'Success' })
                        })
                        .then(() => {
                            alert('Pembayaran berhasil disimulasikan!');
                            window.close();
                        })
                        .catch(err => console.error('Error:', err));
                    }
                </script>
            </div>
        </body>
        </html>
      `;
      
      res.send(demoPage);
    } catch (error) {
      console.error("Error generating demo payment page:", error);
      res.status(500).send("Failed to generate payment page");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
