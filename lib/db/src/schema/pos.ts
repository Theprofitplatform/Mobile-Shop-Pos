import {
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productCategoryEnum = pgEnum("product_category", [
  "phone",
  "accessory",
  "part",
  "service",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "transfer",
  "mixed",
]);

export const repairStatusEnum = pgEnum("repair_status", [
  "received",
  "diagnosing",
  "waiting_parts",
  "repairing",
  "ready",
  "completed",
  "cancelled",
]);

export const stockAdjustmentTypeEnum = pgEnum("stock_adjustment_type", [
  "restock",
  "damage",
  "return",
  "correction",
]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: productCategoryEnum("category").notNull(),
  stock: integer("stock").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(0),
  costPrice: doublePrecision("cost_price").notNull().default(0),
  salePrice: doublePrecision("sale_price").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockAdjustmentsTable = pgTable("stock_adjustments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id, {
    onDelete: "restrict",
  }),
  type: stockAdjustmentTypeEnum("type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  deviceNotes: text("device_notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customersTable.id, {
    onDelete: "set null",
  }),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  subtotal: doublePrecision("subtotal").notNull().default(0),
  discount: doublePrecision("discount").notNull().default(0),
  tax: doublePrecision("tax").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const saleItemsTable = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => salesTable.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").notNull().references(() => productsTable.id, {
    onDelete: "restrict",
  }),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  lineTotal: doublePrecision("line_total").notNull(),
});

export const repairTicketsTable = pgTable("repair_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id, {
    onDelete: "restrict",
  }),
  device: text("device").notNull(),
  imei: text("imei").notNull().default(""),
  issue: text("issue").notNull(),
  status: repairStatusEnum("status").notNull().default("received"),
  estimate: doublePrecision("estimate").notNull().default(0),
  deposit: doublePrecision("deposit").notNull().default(0),
  dueDate: date("due_date", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
});
export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  createdAt: true,
});
export const insertSaleSchema = createInsertSchema(salesTable).omit({
  id: true,
  createdAt: true,
});
export const insertSaleItemSchema = createInsertSchema(saleItemsTable).omit({
  id: true,
});
export const insertRepairTicketSchema = createInsertSchema(repairTicketsTable).omit({
  id: true,
  createdAt: true,
});
export const insertStockAdjustmentSchema = createInsertSchema(stockAdjustmentsTable).omit({
  id: true,
  previousStock: true,
  newStock: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type InsertRepairTicket = z.infer<typeof insertRepairTicketSchema>;
export type InsertStockAdjustment = z.infer<typeof insertStockAdjustmentSchema>;
export type Product = typeof productsTable.$inferSelect;
export type Customer = typeof customersTable.$inferSelect;
export type Sale = typeof salesTable.$inferSelect;
export type SaleItem = typeof saleItemsTable.$inferSelect;
export type RepairTicket = typeof repairTicketsTable.$inferSelect;
export type StockAdjustment = typeof stockAdjustmentsTable.$inferSelect;