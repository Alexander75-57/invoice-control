'use server'

import { createInvoice } from "@/db/actions";
import { InvoiceStatus } from "@/db/schema";
import { redirect } from "next/navigation";
import { newInvoiceFormSchema } from "./schema";

export async function createInvoiceAction(formData: FormData) {
  try {
    // Extract form data
    const rawData = {
      customerId: formData.get("customerId"),
      value: formData.get("value"),
      description: formData.get("description") as string || undefined,
      status: formData.get("status") as InvoiceStatus
    };

    // Validate form data
    const validatedData = newInvoiceFormSchema.parse(rawData);
    
    // Value is already rounded to 2 decimal places in the schema
    // Convert to integer cents for database storage
    const valueInCents = Math.round(validatedData.value * 100);
    
    // Create the invoice
    await createInvoice({
      customerId: validatedData.customerId,
      value: valueInCents,
      description: validatedData.description,
      status: validatedData.status || InvoiceStatus.Open
    });
    
    // Return success instead of redirecting
    return {
      success: true
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: false,
      message: "Failed to create invoice"
    };
  }
}