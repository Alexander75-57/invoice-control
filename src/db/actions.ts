import { db } from "./index";
import { customers, invoices, CustomerType, InvoiceType, InvoiceStatus } from "./schema";
import { and, asc, desc, eq, gte, like, lt, sql } from "drizzle-orm";
import { z } from "zod";

// Customer actions
export async function getCustomers() {
  return await db.select().from(customers).orderBy(asc(customers.name));
}

export async function getCustomerById(id: number) {
  const result = await db.select().from(customers).where(eq(customers.id, id));
  return result[0] || null;
}

export async function searchCustomers(query: string) {
  return await db
    .select()
    .from(customers)
    .where(like(customers.name, `%${query}%`))
    .orderBy(asc(customers.name));
}

export async function createCustomer(data: Omit<CustomerType, "id" | "createTS">) {
  const validated = customerCreateSchema.parse(data);
  
  const result = await db.insert(customers).values({
    name: validated.name,
    email: validated.email,
  }).returning();
  
  return result[0];
}

export async function updateCustomer(id: number, data: Omit<CustomerType, "id" | "createTS">) {
  const validated = customerCreateSchema.parse(data);
  
  const result = await db
    .update(customers)
    .set({
      name: validated.name,
      email: validated.email,
    })
    .where(eq(customers.id, id))
    .returning();
    
  return result[0];
}

// Invoice actions
export async function getInvoices() {
  return await db
    .select({
      ...invoices,
      customerName: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .orderBy(desc(invoices.createTS));
}

export async function getInvoiceById(id: number) {
  const result = await db
    .select({
      ...invoices,
      customerName: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.id, id));
    
  return result[0] || null;
}

export async function getInvoicesByCustomerId(customerId: number) {
  return await db
    .select()
    .from(invoices)
    .where(eq(invoices.customerId, customerId))
    .orderBy(desc(invoices.createTS));
}

export async function getInvoicesByStatus(status: InvoiceStatus) {
  return await db
    .select({
      ...invoices,
      customerName: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.status, status))
    .orderBy(desc(invoices.createTS));
}

const invoiceCreateSchema = z.object({
  value: z.number().int().positive("Value must be a positive number"),
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
  
  const result = await db.insert(invoices).values({
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
    .update(invoices)
    .set(updateData)
    .where(eq(invoices.id, id))
    .returning();
    
  return result[0];
}

export async function updateInvoiceStatus(id: number, status: InvoiceStatus) {
  const result = await db
    .update(invoices)
    .set({ status })
    .where(eq(invoices.id, id))
    .returning();
    
  return result[0];
}

export async function getInvoicesStats() {
  const result = await db.select({
    totalInvoices: sql<number>`count(*)`,
    totalAmount: sql<number>`sum(${invoices.value})`,
    paidAmount: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.value} else 0 end)`,
    outstandingAmount: sql<number>`sum(case when ${invoices.status} = 'open' then ${invoices.value} else 0 end)`,
    voidAmount: sql<number>`sum(case when ${invoices.status} = 'void' then ${invoices.value} else 0 end)`,
    uncollectibleAmount: sql<number>`sum(case when ${invoices.status} = 'uncollectible' then ${invoices.value} else 0 end)`
  }).from(invoices);
  
  return result[0];
}

export async function deleteInvoice(id: number) {
  return await db.delete(invoices).where(eq(invoices.id, id)).returning();
}

export async function deleteCustomer(id: number) {
  // Check if customer has invoices
  const customerInvoices = await getInvoicesByCustomerId(id);
  if (customerInvoices.length > 0) {
    throw new Error("Cannot delete customer with existing invoices");
  }
  
  return await db.delete(customers).where(eq(customers.id, id)).returning();
}