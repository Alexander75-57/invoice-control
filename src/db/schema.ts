import { pgTable, serial, varchar, timestamp, integer, text } from "drizzle-orm/pg-core";
import { z } from "zod";

// Define TypeScript enum for invoice status
export enum InvoiceStatus {
  Open = 'open',
  Paid = 'paid',
  Void = 'void',
  Uncollectible = 'uncollectible'
}

// Define Zod schema for validating invoice status
export const invoiceStatusSchema = z.enum([
  InvoiceStatus.Open,
  InvoiceStatus.Paid,
  InvoiceStatus.Void,
  InvoiceStatus.Uncollectible
]);

// Type alias for invoice status using the Zod schema
export type InvoiceStatusType = z.infer<typeof invoiceStatusSchema>;

// Define Zod schema for customer validation
export const customerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  createTS: z.date().optional()
});

// Type alias for customer using the Zod schema
export type CustomerType = z.infer<typeof customerSchema>;

// Define Zod schema for invoice validation
export const invoiceSchema = z.object({
  id: z.number().optional(),
  createTS: z.date().optional(),
  // Value is stored as cents in the database (integer)
  // The UI handles this as decimal with comma/dot separator
  value: z.number().int().positive("Value must be a positive number")
    .refine(
      val => {
        // When converting back to decimal, ensure it's valid
        const decimal = val / 100;
        return Number.isFinite(decimal) && decimal > 0;
      },
      {
        message: "Value must be a valid positive number"
      }
    ),
  description: z.string().optional(),
  customerId: z.number().int().positive("Customer ID is required"),
  status: invoiceStatusSchema
});

// Type alias for invoice using the Zod schema
export type InvoiceType = z.infer<typeof invoiceSchema>;

// Customers table schema
export const Customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  createTS: timestamp("createTS").defaultNow().notNull()
});

// Invoices table schema
export const Invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  createTS: timestamp("createTS").defaultNow().notNull(),
  value: integer("value").notNull(),
  description: text("description"),
  customerId: integer("customerId").references(() => Customers.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().$type<InvoiceStatusType>()
});