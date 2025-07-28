import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { digiflazzService } from "./services/digiflazz";
import { payDisiniService } from "./services/paydisini";
import { insertTransactionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Sync products from Digiflazz
  app.post("/api/products/sync", async (req, res) => {
    try {
      const digiflazzProducts = await digiflazzService.getProducts();
      
      for (const product of digiflazzProducts) {
        const existingProduct = await storage.getProductBysku(product.buyer_sku_code);
        
        if (existingProduct) {
          await storage.updateProduct(product.buyer_sku_code, {
            productName: product.product_name,
            price: product.price.toString(),
            sellerPrice: product.seller_price.toString(),
            buyerPrice: product.buyer_price.toString(),
            description: product.desc,
            isActive: product.buyer_last_status === 'available',
          });
        } else {
          await storage.createProduct({
            sku: product.buyer_sku_code,
            productName: product.product_name,
            category: product.category.toLowerCase(),
            brand: product.brand,
            type: product.type,
            price: product.price.toString(),
            sellerPrice: product.seller_price.toString(),
            buyerPrice: product.buyer_price.toString(),
            description: product.desc,
            isActive: product.buyer_last_status === 'available',
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

      // Create payment
      const paymentResponse = await payDisiniService.createPayment(
        transaction.refId,
        paymentMethod, // service ID for PayDisini
        transaction.totalAmount,
        `Payment for ${product.productName} - ${targetNumber}`,
        "1800", // 30 minutes
        `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment-callback`
      );

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

      // Check payment status with PayDisini
      if (transaction.paymentReference) {
        try {
          const paymentStatus = await payDisiniService.checkPaymentStatus(transaction.refId);
          
          if (paymentStatus.success && paymentStatus.data) {
            const payStatus = paymentStatus.data.status.toLowerCase();
            let newStatus = transaction.status;
            
            if (payStatus === 'success') {
              newStatus = 'processing';
            } else if (payStatus === 'expired' || payStatus === 'failed') {
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
          }
        } catch (paymentError) {
          console.error("Payment status check failed:", paymentError);
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
      // Return static payment methods for now
      const paymentMethods = [
        { id: '11', name: 'QRIS', icon: 'qrcode', type: 'qris' },
        { id: '1', name: 'Virtual Account BCA', icon: 'university', type: 'va' },
        { id: '14', name: 'Virtual Account BNI', icon: 'university', type: 'va' },
        { id: '15', name: 'Virtual Account Mandiri', icon: 'university', type: 'va' },
        { id: '21', name: 'GoPay', icon: 'mobile-alt', type: 'ewallet' },
        { id: '22', name: 'OVO', icon: 'credit-card', type: 'ewallet' },
        { id: '23', name: 'DANA', icon: 'wallet', type: 'ewallet' },
        { id: '24', name: 'ShopeePay', icon: 'shopping-bag', type: 'ewallet' },
      ];

      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
