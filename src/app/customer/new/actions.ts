'use server'

import { createCustomer } from "@/db/actions";
import { newCustomerFormSchema } from "./schema";

export async function createCustomerAction(formData: FormData) {
  try {
    // Extract form data
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    // Validate form data
    const validatedData = newCustomerFormSchema.parse(rawData);
    
    // Create the customer
    await createCustomer({
      name: validatedData.name,
      email: validatedData.email,
    });
    
    // Return success
    return {
      success: true
    };
  } catch (error) {
    console.error("Error creating customer:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: false,
      message: "Failed to create customer"
    };
  }
}
