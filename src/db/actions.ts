import { db } from "./index";
import { Customers, Invoices, CustomerType, InvoiceType, InvoiceStatus } from "./schema";
import { and, asc, desc, eq, gte, like, lt, sql } from "drizzle-orm";
import { z } from "zod";

// Customer actions
export async function getCustomers() {
  return await db.select().from(Customers).orderBy(asc(Customers.name));
}

export async function getCustomerById(id: number) {
  const result = await db.select().from(Customers).where(eq(Customers.id, id));
  return result[0] || null;
}

export async function searchCustomers(query: string) {
  return await db
    .select()
    .from(Customers)
    .where(like(Customers.name, `%${query}%`))
    .orderBy(asc(Customers.name));
}

export async function createCustomer(data: Omit<CustomerType, "id" | "createTS">) {
  const validated = customerCreateSchema.parse(data);
  
  const result = await db.insert(Customers).values({
    name: validated.name,
    email: validated.email,
  }).returning();
  
  return result[0];
}

export async function updateCustomer(id: number, data: Omit<CustomerType, "id" | "createTS">) {
  const validated = customerCreateSchema.parse(data);
  
  const result = await db
    .update(Customers)
    .set({
      name: validated.name,
      email: validated.email,
    })
    .where(eq(Customers.id, id))
    .returning();
    
  return result[0];
}

// Invoice actions
export async function getInvoices() {
  return await db
    .select({
      ...Invoices,
      customerName: Customers.name,
    })
    .from(Invoices)
    .leftJoin(Customers, eq(Invoices.customerId, Customers.id))
    .orderBy(desc(Invoices.createTS));
}

export async function getInvoiceById(id: number) {
  const result = await db
    .select({
      ...Invoices,
      customerName: Customers.name,
    })
    .from(Invoices)
    .leftJoin(Customers, eq(Invoices.customerId, Customers.id))
    .where(eq(Invoices.id, id));
    
  return result[0] || null;
}

export async function getInvoicesByCustomerId(customerId: number) {
  return await db
    .select()
    .from(Invoices)
    .where(eq(Invoices.customerId, customerId))
    .orderBy(desc(Invoices.createTS));
}

export async function getInvoicesByStatus(status: InvoiceStatus) {
  return await db
    .select({
      ...Invoices,
      customerName: Customers.name,
    })
    .from(Invoices)
    .leftJoin(Customers, eq(Invoices.customerId, Customers.id))
    .where(eq(Invoices.status, status))
    .orderBy(desc(Invoices.createTS));
}

const invoiceCreateSchema = z.object({
  // Value is stored as cents in the database (integer)
  // The UI sends value in cents (already rounded to 2 decimal places and multiplied by 100)
  value: z.number().int().positive("Value must be a positive number")
    .refine(
      val => {
        // When converting back to decimal, ensure it represents a valid monetary value
        const decimal = val / 100;
        return Number.isFinite(decimal) && decimal > 0 && 
               // Check that when formatted with 2 decimals and parsed back, we get the same value
               // This ensures it had at most 2 decimal places originally
               Math.round(decimal * 100) === val;
      },
      {
        message: "Value must be a valid monetary amount with at most 2 decimal places"
      }
    ),
  description: z.string().optional(),
  customerId: z.number().int().positive("Customer ID is required"),
  status: z.enum([
    InvoiceStatus.Open,
    InvoiceStatus.Paid,
    InvoiceStatus.Void,
    InvoiceStatus.Uncollectible
  ])
});

const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format")
});

export async function createInvoice(data: Omit<InvoiceType, "id" | "createTS">) {
  const validated = invoiceCreateSchema.parse(data);
  
  const result = await db.insert(Invoices).values({
    value: validated.value,
    description: validated.description || null,
    customerId: validated.customerId,
    status: validated.status
  }).returning();
  
  return result[0];
}

export async function updateInvoice(id: number, data: Partial<Omit<InvoiceType, "id" | "createTS">>) {
  const updateData: Record<string, unknown> = {};
  
  if (data.value !== undefined) {
    updateData.value = z.number().int().positive().parse(data.value);
  }
  
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  
  if (data.customerId !== undefined) {
    updateData.customerId = z.number().int().positive().parse(data.customerId);
  }
  
  if (data.status !== undefined) {
    updateData.status = z.enum([
      InvoiceStatus.Open,
      InvoiceStatus.Paid,
      InvoiceStatus.Void,
      InvoiceStatus.Uncollectible
    ]).parse(data.status);
  }
  
  const result = await db
    .update(Invoices)
    .set(updateData)
    .where(eq(Invoices.id, id))
    .returning();
    
  return result[0];
}

export async function updateInvoiceStatus(id: number, status: InvoiceStatus) {
  const result = await db
    .update(Invoices)
    .set({ status })
    .where(eq(Invoices.id, id))
    .returning();
    
  return result[0];
}

export async function getInvoicesStats() {
  const result = await db.select({
    totalInvoices: sql<number>`count(*)`,
    totalAmount: sql<number>`sum(${Invoices.value})`,
    paidAmount: sql<number>`sum(case when ${Invoices.status} = 'paid' then ${Invoices.value} else 0 end)`,
    outstandingAmount: sql<number>`sum(case when ${Invoices.status} = 'open' then ${Invoices.value} else 0 end)`,
    voidAmount: sql<number>`sum(case when ${Invoices.status} = 'void' then ${Invoices.value} else 0 end)`,
    uncollectibleAmount: sql<number>`sum(case when ${Invoices.status} = 'uncollectible' then ${Invoices.value} else 0 end)`
  }).from(Invoices);
  
  return result[0];
}

export async function deleteInvoice(id: number) {
  return await db.delete(Invoices).where(eq(Invoices.id, id)).returning();
}

export async function deleteCustomer(id: number) {
  // Check if customer has invoices
  const customerInvoices = await getInvoicesByCustomerId(id);
  if (customerInvoices.length > 0) {
    throw new Error("Cannot delete customer with existing invoices");
  }
  
  return await db.delete(Customers).where(eq(Customers.id, id)).returning();
}