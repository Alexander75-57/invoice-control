import { z } from "zod";

// Define a schema for the new customer form
export const newCustomerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export type NewCustomerFormValues = z.infer<typeof newCustomerFormSchema>;
