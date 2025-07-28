import { type User, type InsertUser, type Transaction, type InsertTransaction, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, balance: string): Promise<void>;

  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByRefId(refId: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: Omit<InsertTransaction, 'refId'> & { 
    userId?: string;
    productName: string;
    category: string;
    operator?: string;
    amount: string;
    adminFee: string;
    totalAmount: string;
  }): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsBycategory(category: string): Promise<Product[]>;
  getProductBysku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(sku: string, updates: Partial<Product>): Promise<void>;
  clearAllProducts(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.products = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "user",
      balance: "0",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: string, balance: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.balance = balance;
      this.users.set(userId, user);
    }
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (transaction) => transaction.refId === refId,
    );
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    );
  }

  async createTransaction(transactionData: Omit<InsertTransaction, 'refId'> & { 
    userId?: string;
    productName: string;
    category: string;
    operator?: string;
    amount: string;
    adminFee: string;
    totalAmount: string;
  }): Promise<Transaction> {
    const id = randomUUID();
    const refId = `TRX${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const transaction: Transaction = {
      ...transactionData,
      id,
      refId,
      operator: transactionData.operator || null,
      digiflazzTrxId: null,
      status: "pending",
      paymentReference: null,
      paymentUrl: null,
      sn: null,
      message: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updatedTransaction = { 
        ...transaction, 
        ...updates, 
        updatedAt: new Date() 
      };
      this.transactions.set(id, updatedTransaction);
    }
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProductsBycategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      p => p.category === category && p.isActive
    );
  }

  async getProductBysku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.sku === sku);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...productData,
      id,
      description: productData.description || null,
      isActive: true,
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(sku: string, updates: Partial<Product>): Promise<void> {
    const product = Array.from(this.products.values()).find(p => p.sku === sku);
    if (product) {
      const updatedProduct = { 
        ...product, 
        ...updates, 
        updatedAt: new Date() 
      };
      this.products.set(product.id, updatedProduct);
    }
  }

  async clearAllProducts(): Promise<void> {
    this.products.clear();
  }
}

export const storage = new MemStorage();
