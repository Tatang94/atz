import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, reseller, admin
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  refId: text("ref_id").notNull().unique(),
  digiflazzTrxId: text("digiflazz_trx_id"),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  category: text("category").notNull(), // pulsa, data, pln, game, ewallet
  operator: text("operator"),
  targetNumber: text("target_number").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  adminFee: decimal("admin_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, success, failed, expired
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  paymentUrl: text("payment_url"),
  sn: text("sn"), // Serial number from Digiflazz
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  productName: text("product_name").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  type: text("type").notNull(), // prepaid, postpaid
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  sellerPrice: decimal("seller_price", { precision: 12, scale: 2 }).notNull(),
  buyerPrice: decimal("buyer_price", { precision: 12, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  productCode: true,
  targetNumber: true,
  paymentMethod: true,
});

export const insertProductSchema = createInsertSchema(products);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
